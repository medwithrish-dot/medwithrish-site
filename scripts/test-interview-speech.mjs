import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = readFileSync(new URL("../app/phloemai/interviews/_lib/useInterviewSpeech.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

// Exercise the production hook with a delayed browser recognition service.
// Each harness has isolated browser globals; no microphone or real timers run.
function speechHarness() {
  const effects = [];
  const timers = [];
  const played = [];
  const recognitions = [];
  let cancellations = 0;
  const react = {
    useCallback: callback => callback,
    useEffect: effect => effects.push(effect),
    useRef: current => ({ current }),
    useState: initial => [initial, () => {}],
    useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
  };
  class Recognition {
    constructor() { this.stopCalls = 0; this.abortCalls = 0; recognitions.push(this); }
    start() {}
    stop() { this.stopCalls += 1; }
    abort() { this.abortCalls += 1; }
    end() { this.onend?.(); }
  }
  class Utterance {
    constructor(text) { this.text = text; }
  }
  const loaded = { exports: {} };
  runInNewContext(compiled, {
    module: loaded, exports: loaded.exports,
    require: name => {
      assert.equal(name, "react", "Only the React hook lifecycle is substituted");
      return react;
    },
    SpeechSynthesisUtterance: Utterance,
    window: {
      SpeechRecognition: Recognition,
      setTimeout: callback => { timers.push(callback); return timers.length; },
      speechSynthesis: {
        cancel: () => { cancellations += 1; },
        getVoices: () => [],
        speak: utterance => played.push(utterance.text),
      },
    },
  });
  const speech = loaded.exports.useInterviewSpeech({ onTranscript() {} });
  const cleanups = effects.map(effect => effect()).filter(Boolean);
  let unmounted = false;
  return {
    speech, played, recognitions,
    get cancellations() { return cancellations; },
    finishStopTimeouts() {
      while (timers.length) timers.shift()();
    },
    unmount() {
      if (unmounted) return;
      unmounted = true;
      for (const cleanup of cleanups) cleanup();
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
