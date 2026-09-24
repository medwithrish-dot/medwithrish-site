import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = readFileSync(new URL("../app/medicforest/interview/_lib/useInterviewSpeech.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const deliveryModule = { exports: {} };
new Function("module", "exports", ts.transpileModule(readFileSync(new URL("../app/medicforest/interview/_lib/speech-delivery.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(deliveryModule, deliveryModule.exports);
const { createSpeechBoundaryTracker, normalizeSpeechTranscript, getTranscriptHints, getSpeechDelivery } = deliveryModule.exports;

// Exercise the production hook with a delayed browser recognition service.
// Each harness has isolated browser globals; no microphone or real timers run.
function speechHarness(options = {}) {
  const hooks = [];
  const effects = [];
  let hookIndex = 0;
  const timers = [];
  const delays = [];
  const played = [];
  const recorded = [];
  const transcripts = [];
  const recognitions = [];
  let reportActivity;
  let cancellations = 0;
  let now = 0;
  const react = {
    useCallback: (callback, dependencies) => {
      const index = hookIndex++;
      const previous = hooks[index];
      if (previous && dependencies?.every((dependency, offset) => Object.is(dependency, previous.dependencies?.[offset]))) return previous.callback;
      hooks[index] = { callback, dependencies };
      return callback;
    },
    useEffect: (effect, dependencies) => {
      const index = hookIndex++;
      const previous = hooks[index];
      if (previous && dependencies?.every((dependency, offset) => Object.is(dependency, previous.dependencies?.[offset]))) return;
      effects.push(() => {
        previous?.cleanup?.();
        hooks[index] = { dependencies, cleanup: effect() };
      });
    },
    useRef: current => {
      const index = hookIndex++;
      hooks[index] ??= { current };
      return hooks[index];
    },
    useState: initial => {
      const index = hookIndex++;
      hooks[index] ??= { value: typeof initial === "function" ? initial() : initial };
      return [hooks[index].value, value => { hooks[index].value = value; }];
    },
    useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
  };
  class Recognition {
    constructor() { this.startCalls = 0; this.stopCalls = 0; this.abortCalls = 0; recognitions.push(this); }
    start() { this.startCalls += 1; }
    stop() { this.stopCalls += 1; }
    abort() { this.abortCalls += 1; }
    end() { this.onend?.(); }
  }
  class Utterance {
    constructor(text) { this.text = text; }
  }
  class AudioPlayer {
    constructor(src) { this.src = src; this.currentTime = 0; recorded.push(this); }
    play() { return options.audioPlayRejects ? Promise.reject(new Error("Playback unavailable")) : Promise.resolve(); }
    pause() { this.paused = true; }
    end() { this.onended?.(); }
  }
  const loaded = { exports: {} };
  runInNewContext(compiled, {
    module: loaded, exports: loaded.exports,
    require: name => {
      if (name === "./speech-delivery") return options.measuredActivity ? {
        ...deliveryModule.exports,
        monitorSpeechActivity: (_recognition, onActivity) => {
          reportActivity = onActivity;
          return () => { reportActivity = undefined; };
        },
      } : deliveryModule.exports;
      assert.equal(name, "react", "Only the React hook lifecycle is substituted");
      return react;
    },
    SpeechSynthesisUtterance: Utterance,
    Audio: AudioPlayer,
    Date: class extends Date { static now() { return now; } },
    window: {
      Audio: AudioPlayer,
      SpeechRecognition: Recognition,
      setTimeout: (callback, delay) => { timers.push(callback); delays.push(delay); return timers.length; },
      clearTimeout: id => { if (id !== undefined) timers[id - 1] = null; },
      speechSynthesis: {
        cancel: () => { cancellations += 1; },
        getVoices: () => [],
        speak: utterance => { if (options.synthesisThrows) throw new Error("Playback unavailable"); played.push(utterance.text); },
      },
    },
  });
  let speech;
  const render = (nextOptions = {}) => {
    options = { ...options, ...nextOptions };
    hookIndex = 0;
    speech = loaded.exports.useInterviewSpeech({ ...options, onTranscript: text => transcripts.push(text) });
    effects.splice(0).forEach(effect => effect());
  };
  render();
  let unmounted = false;
  return {
    get speech() { return speech; }, render, played, recorded, recognitions, transcripts,
    advanceTime: milliseconds => { now += milliseconds; },
    reportActivity: active => reportActivity?.(active),
    get cancellations() { return cancellations; },
    fireSilenceTimers() { timers.forEach((callback, index) => { if (delays[index] === (options.silenceMs ?? 4000)) { timers[index] = null; callback?.(); } }); },
    fireRestartTimers() { timers.forEach((callback, index) => { if (delays[index] === 200) { timers[index] = null; callback?.(); } }); },
    finishStopTimeouts() {
      for (let index = 0; index < timers.length; index += 1) {
        const callback = timers[index];
        timers[index] = null;
        callback?.();
      }
    },
    unmount() {
      if (unmounted) return;
      unmounted = true;
      for (const hook of hooks) hook?.cleanup?.();
    },
  };
}

test("leaving the room cancels read-aloud waiting for recognition to stop", async t => {
  const room = speechHarness();
  t.after(() => room.unmount());
  room.speech.start();
  const pending = room.speech.speak("The question from the room we are leaving.");
  assert.equal(room.recognitions[0].stopCalls, 1);
  assert.deepEqual(room.played, []);

  const cancellationsBeforeLeaving = room.cancellations;
  room.unmount();
  room.finishStopTimeouts();
  await pending;

  assert.ok(room.recognitions[0].abortCalls > 0, "Leaving releases speech recognition");
  assert.ok(room.cancellations > cancellationsBeforeLeaving, "Leaving cancels existing playback");
  assert.deepEqual(room.played, [], "A pending question must not start after leaving");
});

test("recorded questions use their matched MP3 at the selected pace", async t => {
  const room = speechHarness({ rate: 0.8 });
  t.after(() => room.unmount());
  let completed = false;
  await room.speech.speak("Question text", () => { completed = true; }, "/audio/female/q018.mp3");
  assert.equal(room.recorded.length, 1);
  assert.equal(room.recorded[0].src, "/audio/female/q018.mp3");
  assert.equal(room.recorded[0].playbackRate, 0.8);
  assert.equal(room.recorded[0].preservesPitch, true);
  assert.deepEqual(room.played, [], "Browser text-to-speech is not used when recorded audio starts");
  room.recorded[0].end();
  assert.equal(completed, true);
});

test("a failed question recording falls back to browser text-to-speech", async t => {
  const room = speechHarness({ audioPlayRejects: true });
  t.after(() => room.unmount());
  await room.speech.speak("Fallback question", undefined, "/audio/male/q999.mp3");
  await Promise.resolve();
  assert.deepEqual(room.played, ["Fallback question"]);
});

test("compact pauses and audible fillers are normalized without rewriting slang", () => {
  assert.equal(normalizeSpeechTranscript("uhhh I'm gonna [4 seconds pause] um [uhhh] I-I wanted to"), "[uhhh] I'm gonna [4s pause] [um] [uhhh] I-I wanted to");
  assert.equal(normalizeSpeechTranscript("[3s pause] [uhhh]"), "[3s pause] [uhhh]");
  assert.equal(getTranscriptHints("one [3s pause] two [4 seconds pause]").wordCount, 2);
  assert.equal(getTranscriptHints("gonna wanna innit").slangCount, 3);
  assert.equal(getTranscriptHints("w-w-wanted to help").repetitionCount, 1, "One repeated-sound event is not counted twice");
});

test("recognition inserts a compact gap between committed speech and preserves audible fillers", t => {
  const room = speechHarness();
  t.after(() => room.unmount());
  room.speech.start();
  const recognition = room.recognitions[0];
  recognition.onspeechstart();
  room.advanceTime(2000);
  recognition.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "First thought." } }] });
  recognition.onspeechend();
  room.advanceTime(4000);
  recognition.onspeechstart();
  recognition.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "uhhh I'm gonna explain." } }] });
  assert.deepEqual(room.transcripts, ["First thought.", "[4s pause]", "[uhhh] I'm gonna explain."]);
});

test("delayed recognition cannot move a pause before the words that preceded it", t => {
  const room = speechHarness();
  t.after(() => room.unmount());
  room.speech.start();
  const recognition = room.recognitions[0];
  recognition.onspeechstart();
  room.advanceTime(2000);
  recognition.onspeechend();
  room.advanceTime(4000);
  recognition.onspeechstart();
  recognition.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "Words the service delivered late." } }] });
  assert.deepEqual(room.transcripts, ["Words the service delivered late."]);
});

test("unmount does not deliver pending interim speech into a room being left", async () => {
  const room = speechHarness();
  room.speech.start();
  room.recognitions[0].onresult({ resultIndex: 0, results: [{ isFinal: false, 0: { transcript: "Still pending" } }] });
  const stopping = room.speech.stop();
  room.unmount();
  await stopping;
  assert.deepEqual(room.transcripts, []);
});

test("speech gaps ignore natural sentence stops, opening silence and deliberate breaks", () => {
  const boundaries = createSpeechBoundaryTracker();
  assert.equal(boundaries.start(10), null, "Waiting before the answer is not a pause");
  boundaries.commit();
  boundaries.end(12);
  assert.equal(boundaries.start(14.9), null, "Natural sentence pauses shorter than 3s are ignored");
  boundaries.commit();
  boundaries.end(18);
  assert.equal(boundaries.start(21).text, "[3s pause]");
  boundaries.commit();
  boundaries.end(25);
  assert.equal(boundaries.start(29).text, "[4s pause]");
  boundaries.end(32);
  boundaries.reset();
  assert.equal(boundaries.start(90), null, "Pausing the microphone resets the gap detector");
  boundaries.end(92);
  assert.equal(boundaries.start(97), null, "Delayed recognition cannot put a gap before its preceding words");
});

test("seven-second pace uses measured timing, excludes trailing silence and waits for a full window", () => {
  const sample = (words, endSeconds = 7) => ({ kind: "speech", text: Array(words).fill("word").join(" "), startSeconds: 0, endSeconds });
  const speed = (words, elapsedSeconds = 7, end = 7) => getSpeechDelivery({ transcript: "", segments: [sample(words, end)], elapsedSeconds }).speed;
  assert.equal(speed(8), "slow");
  assert.equal(speed(17), "medium");
  assert.equal(speed(27), "fast");
  assert.equal(speed(27, 60), "fast", "Time waiting to submit cannot lower pace");
  assert.equal(speed(10, 3, 3), null, "No confident pace claim for a short answer");
});

test("speech coaching flags only supported concerns, never mistakes missing confidence for errors", () => {
  const base = { transcript: "A thoughtful answer.", segments: [], elapsedSeconds: 10 };
  assert.equal(getSpeechDelivery({ ...base, confidence: [{ words: 20, confidence: 0 }] }).manyTranscriptionErrors, false);
  assert.equal(getSpeechDelivery({ ...base, confidence: [{ words: 20, confidence: 0.4 }] }).manyTranscriptionErrors, true);
  assert.equal(getSpeechDelivery({ ...base, confidence: [{ words: 3, confidence: 0.2 }] }).manyTranscriptionErrors, false);
  assert.equal(getSpeechDelivery({ ...base, transcript: "Hello [3s pause] again [4s pause] today" }).manyPausesOrRepetitions, false);
  assert.equal(getSpeechDelivery({ ...base, transcript: "Hello [3s pause] again [4s pause] today [3s pause] yes" }).manyPausesOrRepetitions, true);
});

test("Voice off prevents pending read-aloud after the microphone finishes", async t => {
  const room = speechHarness();
  t.after(() => room.unmount());
  room.speech.start();
  const pending = room.speech.speak("Do not read this after Voice off.");
  assert.equal(room.recognitions[0].stopCalls, 1);

  room.speech.stopSpeaking();
  room.recognitions[0].end();
  room.finishStopTimeouts();
  await pending;
  assert.deepEqual(room.played, [], "Voice off also cancels a question not yet playing");

  await room.speech.speak("A later explicit request can still play.");
  assert.deepEqual(room.played, ["A later explicit request can still play."]);
});

test("only the newest read-aloud request plays while recognition is stopping", async t => {
  const room = speechHarness();
  t.after(() => room.unmount());
  room.speech.start();
  const first = room.speech.speak("The superseded question.");
  const newest = room.speech.speak("The current question.");
  assert.deepEqual(room.played, [], "Playback waits for the microphone to stop");

  // Also exercise the browser fallback when recognition does not emit onend.
  room.finishStopTimeouts();
  await Promise.all([first, newest]);
  assert.deepEqual(room.played, ["The current question."]);
});

test("concurrent microphone stops preserve the final transcript and share one shutdown", async t => {
  const room = speechHarness();
  t.after(() => room.unmount());
  room.speech.start();
  const recognition = room.recognitions[0];
  const first = room.speech.stop();
  const second = room.speech.stop();

  assert.equal(first, second, "Both callers wait for the same microphone shutdown");
  assert.equal(recognition.stopCalls, 1);
  assert.equal(recognition.abortCalls, 0, "A second caller must not discard pending speech");
  recognition.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "My final reflection." } }] });
  recognition.end();
  await Promise.all([first, second]);
  assert.deepEqual(room.transcripts, ["My final reflection."]);
  assert.equal(recognition.onresult, null);

  room.speech.start();
  const nextRecognition = room.recognitions[1];
  room.finishStopTimeouts();
  assert.equal(nextRecognition.abortCalls, 0, "An old fallback cannot stop the next answer");
});


function activityHarness({ pending = false, suspended = false } = {}) {
  let now = 0, loud = false, nextFrame, stoppedTracks = 0, closedContexts = 0, grant;
  const events = [];
  const stream = { getTracks: () => [{ stop: () => stoppedTracks++ }] };
  const recognition = { onspeechstart: () => events.push("start"), onspeechend: () => events.push("end") };
  const activityModule = { exports: {} };
  class AudioContext {
    state = suspended ? "suspended" : "running";
    createMediaStreamSource() { return { connect() {} }; }
    createAnalyser() { return { fftSize: 256, getByteTimeDomainData(samples) { samples.fill(loud ? 136 : 128); } }; }
    async resume() {}
    async close() { this.state = "closed"; closedContexts++; }
  }
  runInNewContext(ts.transpileModule(readFileSync(new URL("../app/medicforest/interview/_lib/speech-delivery.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    module: activityModule, exports: activityModule.exports, window: { AudioContext },
    navigator: { mediaDevices: { getUserMedia: () => pending ? new Promise(resolve => { grant = () => resolve(stream); }) : Promise.resolve(stream) } },
    requestAnimationFrame: callback => { nextFrame = callback; return 1; },
    cancelAnimationFrame: () => { nextFrame = undefined; },
    performance: { now: () => now },
  });
  const stop = activityModule.exports.monitorSpeechActivity(recognition);
  return { events, recognition, stop, grant: () => grant(), get stoppedTracks() { return stoppedTracks; }, get closedContexts() { return closedContexts; },
    frame(milliseconds, speech) { now += milliseconds; loud = speech; const callback = nextFrame; nextFrame = undefined; callback?.(); },
  };
}

test("local microphone activity detects boundaries, ignores brief dips and replaces duplicate native events", async () => {
  const mic = activityHarness();
  await new Promise(resolve => setImmediate(resolve));
  mic.frame(100, true);
  mic.recognition.onspeechstart();
  mic.frame(100, false);
  mic.frame(100, true);
  assert.deepEqual(mic.events, ["start"]);
  mic.frame(100, false);
  mic.frame(300, false);
  mic.recognition.onspeechend();
  mic.frame(4000, true);
  assert.deepEqual(mic.events, ["start", "end", "start"]);
  mic.stop();
  mic.frame(4000, false);
  assert.equal(mic.stoppedTracks, 1);
  assert.equal(mic.closedContexts, 1);
  assert.deepEqual(mic.events, ["start", "end", "start"]);
});

test("ending listening before microphone permission resolves releases the late stream", async () => {
  const mic = activityHarness({ pending: true });
  mic.stop(); mic.grant();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(mic.stoppedTracks, 1);
  assert.equal(mic.closedContexts, 0);
  assert.deepEqual(mic.events, []);
});

test("a suspended mobile audio context retains native speech boundaries", async () => {
  const mic = activityHarness({ suspended: true });
  await new Promise(resolve => setImmediate(resolve));
  mic.recognition.onspeechstart();
  mic.recognition.onspeechend();
  assert.deepEqual(mic.events, ["start", "end"]);
  assert.equal(mic.stoppedTracks, 1, "An unusable audio meter releases its microphone stream");
  assert.equal(mic.closedContexts, 1);
  mic.stop();
});


test("answer silence uses four seconds, requires words and cancels on speech or manual stop", async t => {
  let prompts = 0;
  const room = speechHarness({ onSilence: () => prompts++ });
  t.after(() => room.unmount());
  room.speech.start();
  const recognition = room.recognitions[0];
  room.fireSilenceTimers();
  assert.equal(prompts, 0, "No prompt during opening silence");
  recognition.onspeechend();
  room.fireSilenceTimers();
  assert.equal(prompts, 0, "An empty speech boundary or background noise is not an answer");
  recognition.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "My first answer." } }] });
  recognition.onspeechstart(); recognition.onspeechend();
  recognition.onspeechstart();
  room.fireSilenceTimers();
  assert.equal(prompts, 0, "Continuing speech cancels the pending prompt");
  recognition.onspeechend();
  room.fireSilenceTimers(); room.fireSilenceTimers();
  assert.equal(prompts, 1, "One confirmation per gap");
  recognition.onspeechstart(); recognition.onspeechend();
  const pending = room.speech.stop();
  room.fireSilenceTimers(); room.finishStopTimeouts(); await pending;
  assert.equal(prompts, 1, "A deliberate mic stop never asks for confirmation");
});

test("recognition results detect a pause when the browser omits speechend", t => {
  let prompts = 0;
  const room = speechHarness({ onSilence: () => prompts++ });
  t.after(() => room.unmount());
  room.speech.start();
  room.recognitions[0].onresult({ resultIndex: 0, results: [{ isFinal: false, 0: { transcript: "My reflection on that experience" } }] });
  room.fireSilenceTimers();
  room.fireSilenceTimers();
  assert.equal(prompts, 1);
});

test("measured ongoing voice prevents confirmation even when recognition delivers words late", t => {
  let prompts = 0;
  const room = speechHarness({ measuredActivity: true, onSilence: () => prompts++ });
  t.after(() => room.unmount());
  room.speech.start();
  room.reportActivity(true);
  room.recognitions[0].onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "I am still explaining my answer." } }] });
  room.fireSilenceTimers();
  assert.equal(prompts, 0);
  room.reportActivity(false);
  room.fireSilenceTimers();
  assert.equal(prompts, 1, "A measured quiet gap starts the confirmation countdown");
});

test("natural recognition ends preserve words, restart listening and still detect the pause", async t => {
  let prompts = 0;
  const room = speechHarness({ onSilence: () => prompts++ });
  t.after(() => room.unmount());
  room.speech.start();
  const recognition = room.recognitions[0];
  recognition.onresult({ resultIndex: 0, results: [{ isFinal: false, 0: { transcript: "Words before a browser timeout" } }] });
  recognition.end();
  room.fireRestartTimers();
  assert.equal(recognition.startCalls, 2);
  assert.deepEqual(room.transcripts, ["Words before a browser timeout"]);
  room.fireSilenceTimers();
  assert.equal(prompts, 1, "A browser restart cannot discard the pending pause");
  recognition.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "And another thought." } }] });
  assert.deepEqual(room.transcripts, ["Words before a browser timeout", "And another thought."]);
  recognition.end();
  const stopped = room.speech.stop();
  room.fireRestartTimers();
  assert.equal(recognition.startCalls, 2, "Explicit stop cancels a queued restart");
  room.finishStopTimeouts();
  await stopped;
});

test("read-aloud cancels a pending browser restart and releases final words before playback", async t => {
  const room = speechHarness();
  t.after(() => room.unmount());
  room.speech.start();
  const recognition = room.recognitions[0];
  recognition.onresult({ resultIndex: 0, results: [{ isFinal: false, 0: { transcript: "An answer before the prompt" } }] });
  recognition.end();
  const speaking = room.speech.speak("Done? Say yes or no.");
  room.fireRestartTimers();
  room.finishStopTimeouts();
  await speaking;
  assert.equal(recognition.startCalls, 1);
  assert.deepEqual(room.transcripts, ["An answer before the prompt"]);
  assert.deepEqual(room.played, ["Done? Say yes or no."]);
});

test("changing questions rejects late results and cancels the previous question's restart", async t => {
  const room = speechHarness({ answerKey: "question-1" });
  t.after(() => room.unmount());
  room.speech.start();
  const first = room.recognitions[0];
  first.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "The first answer." } }] });
  first.end();
  room.render({ answerKey: "question-2" });
  first.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "A late first-answer fragment." } }] });
  room.fireRestartTimers();
  room.finishStopTimeouts();
  await Promise.resolve();
  assert.equal(first.startCalls, 1, "A previous question cannot reopen the microphone");
  assert.deepEqual(room.transcripts, ["The first answer."]);
  room.speech.start();
  room.recognitions[1].onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "The second answer." } }] });
  assert.deepEqual(room.transcripts, ["The first answer.", "The second answer."]);
});


test("synchronous voice playback failure releases the prompt so listening can resume", async t => {
  const room = speechHarness({ synthesisThrows: true });
  t.after(() => room.unmount());
  let completed = 0;
  await room.speech.speak("Done? Answer yes or no.", () => completed++);
  assert.equal(completed, 1);
});
