import assert from "node:assert/strict";
import { parseDoneReply, ANSWER_SILENCE_MS, DONE_PROMPT, questionTransition } from "../app/phloemai/interviews/_lib/station-flow.ts";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const circuitId = "12345678-1234-4234-8234-123456789012";

// Run the real route and catalogue, substituting only account/database services.
// No credentials, writes to a real account, or AI provider are needed.
function sessionRoute({ premium = true, previous = null } = {}) {
  const reservations = [];
  const filters = [];
  const mutations = [];
  class InterviewError extends Error {
    constructor(message, status = 400) { super(message); this.status = status; }
  }
  const query = {
    select() { return this; },
    eq(key, value) { filters.push([key, value]); return this; },
    update(value) { mutations.push(value); return this; },
    async maybeSingle() { return { data: previous, error: null }; },
  };
  const server = {
    InterviewError,
    interviewContext: async () => ({ user: { id: "test-user" }, isPremium: premium, admin: {
      from: () => query,
      rpc: async (name, args) => { reservations.push({ name, ...args }); return { data: args.p_payload, error: null }; },
    } }),
    readInterviewBody: async request => request.json(),
    interviewJson: data => Response.json(data),
    interviewFailure: error => Response.json({ error: error.message }, { status: error.status || 503 }),
    databaseError: error => { throw error; },
    toInterviewAttempt: data => data,
    validId: value => typeof value === "string" && /^[0-9a-f-]{36}$/.test(value),
  };
  const modules = new Map();
  function load(filename) {
    if (!filename.endsWith(".ts")) filename += ".ts";
    if (modules.has(filename)) return modules.get(filename).exports;
    const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const compiled = { exports: {} }; modules.set(filename, compiled);
    const localRequire = specifier => {
      if (specifier === "server-only") return {};
      if (specifier === "@/utils/interviews/server") return server;
      if (specifier.startsWith("@/")) return load(resolve(root, specifier.slice(2)));
      if (specifier.startsWith(".")) return load(resolve(dirname(filename), specifier));
      return require(specifier);
    };
    new Function("require", "module", "exports", output)(localRequire, compiled, compiled.exports);
    return compiled.exports;
  }
  const route = load(resolve(root, "app/api/interviews/session/route.ts"));
  return {
    reservations, filters, mutations,
    post: body => route.POST(new Request("http://localhost/api/interviews/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })),
    patch: body => route.PATCH(new Request("http://localhost/api/interviews/session", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })),
  };
}

test("a custom circuit reserves the chosen first topic and count", async () => {
  const api = sessionRoute();
  const response = await api.post({ mode: "reference", stationCount: 3, stationSlug: "work-experience" });
  assert.equal(response.status, 200);
  const payload = api.reservations[0].p_payload;
  assert.equal(payload.station_count, 3);
  assert.equal(payload.station_slug, "work-experience");
  assert.match(payload.questions[0], /experience/);
  assert.equal(payload.break_seconds, 120);
});

test("university customisation preserves that university's practice timings", async () => {
  const api = sessionRoute();
  const response = await api.post({ mode: "university", universitySlug: "aberdeen", stationCount: 2, stationSlug: "data-analysis" });
  assert.equal(response.status, 200);
  const payload = api.reservations[0].p_payload;
  assert.equal(payload.station_slug, "data-analysis");
  assert.equal(payload.station_count, 2);
  assert.equal(payload.station_seconds, 300);
  assert.equal(payload.university_slug, "aberdeen");
});

test("legacy presets still use their original counts and topic order", async () => {
  for (const [body, count] of [[{ mode: "reference" }, 5], [{ mode: "university", universitySlug: "aberdeen" }, 6], [{ mode: "free" }, 1]]) {
    const api = sessionRoute();
    assert.equal((await api.post(body)).status, 200);
    assert.equal(api.reservations[0].p_payload.station_count, count);
    assert.equal(api.reservations[0].p_payload.station_slug, "why-medicine");
  }
});

test("empty, malformed and oversized station selections do not reserve an attempt", async () => {
  for (const stationCount of [0, -1, 10, 1.5, "3", null, {}, []]) {
    const api = sessionRoute();
    assert.equal((await api.post({ mode: "reference", stationCount })).status, 400);
    assert.equal(api.reservations.length, 0);
  }
  const api = sessionRoute();
  assert.equal((await api.post({ mode: "reference", stationCount: 1, stationSlug: "made-up-station" })).status, 404);
  assert.equal(api.reservations.length, 0);
});

const previousStation = overrides => ({ status: "completed", mode: "reference", university_slug: null, station_count: 3, completed_at: "2020-01-01T00:00:00Z", break_seconds: 120, ...overrides });

test("continuation uses the saved circuit count and the next selected topic", async () => {
  const api = sessionRoute({ previous: previousStation() });
  assert.equal((await api.post({ mode: "reference", circuitId, stationIndex: 1, stationSlug: "teamwork-group-discussion" })).status, 200);
  assert.equal(api.reservations[0].p_payload.station_count, 3);
  assert.equal(api.reservations[0].p_payload.station_slug, "teamwork-group-discussion");
  assert.ok(api.filters.some(([key, value]) => key === "user_id" && value === "test-user"));
  assert.ok(api.filters.some(([key, value]) => key === "circuit_id" && value === circuitId));
  assert.ok(api.filters.some(([key, value]) => key === "station_index" && value === 0));
});

test("a finished circuit cannot be extended or have its length changed", async () => {
  for (const body of [{ stationIndex: 3 }, { stationIndex: 1, stationCount: 5 }]) {
    const api = sessionRoute({ previous: previousStation() });
    assert.equal((await api.post({ mode: "reference", circuitId, ...body })).status, 409);
    assert.equal(api.reservations.length, 0);
  }
});

test("an older university circuit can continue beyond the custom topic limit", async () => {
  const api = sessionRoute({ previous: previousStation({ mode: "university", university_slug: "aberdeen", station_count: 12 }) });
  assert.equal((await api.post({ mode: "university", universitySlug: "aberdeen", circuitId, stationIndex: 10, stationSlug: "data-analysis" })).status, 200);
  assert.equal(api.reservations[0].p_payload.station_count, 12);
  assert.equal(api.reservations[0].p_payload.station_index, 10);
});

test("customisation retains the completion, break and membership checks", async () => {
  for (const previous of [null, previousStation({ status: "in_progress" }), previousStation({ completed_at: new Date().toISOString() }), previousStation({ mode: "university" })]) {
    const api = sessionRoute({ previous });
    assert.equal((await api.post({ mode: "reference", circuitId, stationIndex: 1, stationSlug: "data-analysis" })).status, 409);
    assert.equal(api.reservations.length, 0);
  }
  const api = sessionRoute({ premium: false });
  assert.equal((await api.post({ mode: "reference", stationCount: 2 })).status, 403);
  assert.equal(api.reservations.length, 0);
  assert.equal((await api.post({ mode: "free", stationCount: 1 })).status, 200);
});

test("an older tab's autosave preserves a probe answer it has not seen", async () => {
  const previous = { id: circuitId, status: "in_progress", started_at: new Date().toISOString(), preparation_seconds: 0, station_seconds: 480,
    questions: ["Why medicine?", "What did you learn?"],
    answers: [{ question: "Why medicine?", answer: "Original answer" }, { question: "What did you learn?", answer: "A saved reflection from another tab" }],
  };
  const api = sessionRoute({ previous });
  assert.equal((await api.patch({ attemptId: circuitId, answers: [{ question: "Why medicine?", answer: "An updated main answer" }] })).status, 200);
  assert.equal(api.mutations[0].answers[1].answer, "A saved reflection from another tab");
  assert.ok(api.filters.some(([field, value]) => field === "answers" && value === JSON.stringify(previous.answers)), "The save cannot overwrite an answer that changed after reading");
  const clear = sessionRoute({ previous });
  assert.equal((await clear.patch({ attemptId: circuitId, answers: [{ question: "What did you learn?", answer: "" }] })).status, 200);
  assert.equal(clear.mutations[0].answers[1].answer, "", "Explicitly clearing an answer still works");
});

// Exercise the actual room callbacks against delayed saves. Browser, device and
// hook lifecycle boundaries are substituted; all save scheduling stays production code.
async function autosaveRoom({ status = "in_progress", preparationSeconds = 0, hasAttempt = true, configured = true, followUps = false, permission = true, speechError = "", voiceSupported = false, delayedVoice = false, questions = ["Why medicine?"], initialDraft } = {}) {
  const cells = [];
  let cursor = 0;
  let effects = [];
  const intervals = new Map();
  const storage = new Map();
  const requests = [];
  const followUpRequests = [];
  const feedbackRequests = [];
  const spoken = [];
  let microphoneRequests = 0;
  let recognitionStarts = 0;
  let speechOptions;
  let pendingSpeech = "";
  let finishVoice;
  const attempt = {
    id: circuitId, circuitId, status, mode: "free", stationSlug: "why-medicine",
    title: "Why medicine?", startedAt: new Date().toISOString(), completedAt: null, preparationSeconds,
    stationSeconds: 480, breakSeconds: 0, questions, answers: [],
    stationIndex: 0, stationCount: 1, feedback: null, nextAvailableAt: null,
  };
  if (initialDraft) storage.set(`phloem-interview-draft:${circuitId}`, JSON.stringify(initialDraft));
  const memo = (factory, dependencies) => {
    const index = cursor++;
    const prior = cells[index];
    if (!prior || !dependencies || dependencies.some((value, i) => !Object.is(value, prior.dependencies[i]))) {
      cells[index] = { value: factory(), dependencies };
    }
    return cells[index].value;
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in cells)) cells[index] = typeof initial === "function" ? initial() : initial;
      return [cells[index], value => { cells[index] = typeof value === "function" ? value(cells[index]) : value; }];
    },
    useRef: current => memo(() => ({ current }), []),
    useMemo: memo,
    useCallback: (callback, dependencies) => memo(() => callback, dependencies),
    useEffect: (effect, dependencies) => memo(() => { effects.push(effect); }, dependencies),
  };
  const speech = { listening: false, speaking: false, error: speechError, stop: async () => {
    speech.listening = false;
    if (pendingSpeech) { const finalText = pendingSpeech; pendingSpeech = ""; speechOptions.onTranscript(finalText); }
  }, stopSpeaking() { speech.speaking = false; finishVoice = undefined; }, speak: async (text, onComplete) => {
    spoken.push(text);
    speech.speaking = true;
    const complete = () => { speech.speaking = false; finishVoice = undefined; onComplete?.(); };
    if (delayedVoice) finishVoice = complete;
    else complete();
  }, voiceSupported, supported: true, start: () => { speech.listening = true; recognitionStarts += 1; } };
  const devices = {
    stopCamera() {}, stopMicCheck() {}, cancelMicrophoneRequest() {}, microphonePermission: "idle",
    requestMicrophone: async () => { microphoneRequests += 1; devices.microphonePermission = permission ? "granted" : "denied"; return permission; },
  };
  const source = readFileSync(resolve(root, "app/phloemai/interviews/_components/AIInterviewRunner.tsx"), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const loaded = { exports: {} };
  runInNewContext(output, {
    module: loaded, exports: loaded.exports, AbortController, URLSearchParams, Date, Error,
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      if (name.endsWith("useInterviewSpeech")) return { useInterviewSpeech: options => { speechOptions = options; return speech; }, getTranscriptHints: text => ({ wordCount: text.split(/\s+/).filter(Boolean).length }) };
      if (name.endsWith("useInterviewDevices")) return { useInterviewDevices: () => devices };
      if (name.endsWith("station-flow")) return { parseDoneReply, ANSWER_SILENCE_MS, DONE_PROMPT, questionTransition, followUpsEnabled: () => followUps };
      if (name.endsWith("interview-stations")) return { findInterviewStation: () => ({ questions }), interviewStations: [] };
      if (name === "./AIInterviewCall") return { AIInterviewCall: "interview-call" };
      if (name === "./AIInterviewReview") return { AIInterviewReview: "interview-review" };
      if (name.endsWith(".module.css")) return { default: {} };
      return {};
    },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    document: { addEventListener() {}, removeEventListener() {} },
    window: {
      location: { search: "" }, setTimeout: () => 1, clearTimeout() {},
      setInterval: (callback, milliseconds) => { intervals.set(milliseconds, callback); return milliseconds; },
      clearInterval: id => intervals.delete(id), addEventListener() {}, removeEventListener() {},
    },
    fetch: (_path, options) => {
      if (options.method === "GET") return Promise.resolve(Response.json({ attempt: hasAttempt ? attempt : null, configured }));
      if (_path === "/api/interviews/follow-up") {
        return new Promise(resolve => followUpRequests.push({ body: JSON.parse(options.body), complete: (followUp, source = "ai") => {
          const index = attempt.questions.indexOf(JSON.parse(options.body).question) + 1;
          const nextQuestions = [...attempt.questions]; nextQuestions.splice(index, 0, followUp);
          attempt.questions = nextQuestions;
          resolve(Response.json({ attempt: { ...attempt }, followUp, questionIndex: index, source }));
        } }));
      }
      if (_path === "/api/interviews/feedback") {
        assert.equal(options.method, "POST");
        return new Promise(resolve => feedbackRequests.push({ body: JSON.parse(options.body), complete: feedback => {
          Object.assign(attempt, { status: "completed", feedback });
          resolve(Response.json({ attempt: { ...attempt } }));
        } }));
      }
      assert.equal(options.method, "PATCH");
      const body = JSON.parse(options.body);
      return new Promise((resolve, reject) => requests.push({
        body, reject, complete: () => {
          attempt.answers = body.answers;
          if (body.finish) Object.assign(attempt, { status: "submitted", completedAt: new Date().toISOString() });
          resolve(Response.json({ attempt: { ...attempt } }));
        },
      }));
    },
  });
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const render = () => {
    cursor = 0;
    const tree = loaded.exports.AIInterviewRunner({});
    const pendingEffects = effects; effects = [];
    pendingEffects.forEach(effect => effect());
    return tree;
  };
  render();
  await flush();
  const tree = render();
  const findComponent = (node, type) => {
    if (Array.isArray(node)) return node.map(child => findComponent(child, type)).find(Boolean) ?? null;
    if (!node || typeof node !== "object") return null;
    return node.type === type ? node.props : findComponent(node.props?.children, type);
  };
  const findCall = node => findComponent(node, "interview-call");
  const findReview = node => findComponent(node, "interview-review");
  const call = findCall(tree);
  if (hasAttempt) assert.ok(call || findReview(tree));
  return {
    requests, followUpRequests, feedbackRequests, spoken, flush, render, call, latestCall: () => findCall(render()), latestReview: () => findReview(render()), storage,
    get microphoneRequests() { return microphoneRequests; },
    get recognitionStarts() { return recognitionStarts; },
    edit: text => call.onAnswer(text), save: () => intervals.get(15_000)(), finish: () => call.onSubmit(),
    finalSpeech: text => { pendingSpeech = text; },
    completeVoice: () => finishVoice?.(),
    say: text => speechOptions.onTranscript(text), silence: () => speechOptions.onSilence(),
  };
}

test("permission approval automatically starts the mic once and legacy reading time is respected", async () => {
  for (const preparationSeconds of [0, 60]) {
    const room = await autosaveRoom({ preparationSeconds });
    await room.flush(); room.render(); room.render();
    assert.equal(room.microphoneRequests, 1);
    assert.equal(room.recognitionStarts, preparationSeconds ? 0 : 1);
    room.render(); room.render();
    assert.equal(room.microphoneRequests, 1);
    assert.equal(room.recognitionStarts, preparationSeconds ? 0 : 1);
  }
});

test("denied microphone access leaves a usable typed station", async () => {
  const room = await autosaveRoom({ permission: false });
  await room.flush(); room.render();
  assert.equal(room.recognitionStarts, 0);
  room.edit("A typed answer");
  assert.equal(room.latestCall().answers[0].answer, "A typed answer");
});

test("the lobby and completed attempts do not automatically ask for microphone access", async () => {
  assert.equal((await autosaveRoom({ hasAttempt: false })).microphoneRequests, 0);
  assert.equal((await autosaveRoom({ status: "completed" })).microphoneRequests, 0);
});

test("manual microphone off stays off after subsequent room renders", async () => {
  const room = await autosaveRoom();
  await room.flush(); room.render();
  room.latestCall().onToggleMicrophone();
  await room.flush(); room.render(); room.render();
  assert.equal(room.recognitionStarts, 1);
  assert.equal(room.latestCall().speech.listening, false);
});

test("microphone off then on during a spoken question waits for playback and preserves automatic confirmation", async () => {
  const room = await autosaveRoom({ voiceSupported: true, delayedVoice: true });
  await room.flush(); room.render();
  assert.deepEqual(room.spoken, ["Why medicine?"]);
  assert.equal(room.latestCall().speech.speaking, true);
  assert.equal(room.recognitionStarts, 0);

  room.latestCall().onToggleMicrophone();
  await room.flush(); room.render();
  assert.equal(room.latestCall().micWanted, false);
  room.latestCall().onToggleMicrophone();
  await room.flush(); room.render();
  assert.equal(room.latestCall().micWanted, true);
  assert.equal(room.recognitionStarts, 0, "The microphone cannot interrupt the spoken question");
  assert.equal(room.latestCall().speech.speaking, true);

  room.completeVoice(); room.render();
  assert.equal(room.recognitionStarts, 1, "Listening starts when the question finishes");
  room.say("I learned how listening carefully helps patients."); room.render();
  room.silence(); await room.flush(); room.render();
  assert.equal(room.latestCall().awaitingDone, true, "Microphone toggling cannot leave the prompt lock stuck");
  assert.equal(room.spoken.at(-1), DONE_PROMPT);
  assert.equal(room.recognitionStarts, 1, "The microphone also waits for the confirmation prompt");
  room.completeVoice(); room.render();
  assert.equal(room.recognitionStarts, 2, "The candidate can then answer yes or no");
});

test("multiple queued autosaves never overlap or replace the newest transcript", async () => {
  const room = await autosaveRoom();
  room.edit("First answer"); room.save();
  room.edit("The newest answer"); room.save(); room.save();
  assert.equal(room.requests.length, 1);
  room.requests[0].complete();
  await room.flush();
  assert.equal(room.requests.length, 2, "Only one waiter starts the next save");
  assert.equal(room.requests[1].body.answers[0].answer, "The newest answer");
  room.requests[1].complete();
  await room.flush();
  assert.equal(room.requests.length, 2, "The remaining waiter sees the latest text is already saved");
});

test("a queued autosave retries the latest transcript after an earlier request fails", async () => {
  const room = await autosaveRoom();
  room.edit("Earlier answer"); room.save();
  room.edit("Latest answer to preserve"); room.save();
  room.requests[0].reject(new Error("Temporary connection failure"));
  await room.flush();
  assert.equal(room.requests.length, 2);
  assert.equal(room.requests[1].body.answers[0].answer, "Latest answer to preserve");
  room.requests[1].complete();
  await room.flush();
});

test("finishing empty or short answers opens a saved review without generating feedback", async () => {
  for (const answer of ["", "I enjoy caring for others."]) {
    const room = await autosaveRoom({ configured: false });
    room.edit(answer);
    room.finish(); room.finish();
    await room.flush();
    assert.equal(room.requests.length, 1, "Repeated finish clicks cannot submit twice");
    assert.equal(room.requests[0].body.finish, true);
    assert.equal(room.requests[0].body.answers[0].answer, answer);
    assert.equal(room.feedbackRequests.length, 0);
    room.requests[0].complete();
    await room.flush();
    const review = room.latestReview();
    assert.equal(room.latestCall(), null, "The call room is replaced after finishing");
    assert.equal(review.attempt.status, "submitted");
    assert.equal(review.attempt.answers[0].answer, answer);
    assert.ok(review.attempt.completedAt);
    assert.equal(review.attempt.feedback, null);
    assert.equal(review.configured, false);
    assert.equal(review.busy, false);
    assert.equal(room.storage.has(`phloem-interview-draft:${circuitId}`), false, "Remove the browser draft only after the server confirms saving");
    assert.equal(room.feedbackRequests.length, 0);
  }
});

test("finishing waits for queued autosaves and includes the final speech in the review", async () => {
  const room = await autosaveRoom();
  room.edit("Earlier answer"); room.save();
  room.edit("My latest reflection"); room.save();
  room.finalSpeech("changed how I listen to patients.");
  room.finish();
  await room.flush();
  assert.equal(room.requests.length, 1, "Finishing must wait for the outstanding autosave");
  room.requests[0].complete();
  await room.flush();
  assert.equal(room.requests.length, 2);
  assert.equal(room.requests[1].body.finish, undefined, "The existing queued autosave finishes first");
  room.requests[1].complete();
  await room.flush();
  assert.equal(room.requests.length, 3);
  const finalText = "My latest reflection changed how I listen to patients.";
  assert.equal(room.requests[2].body.finish, true);
  assert.equal(room.requests[2].body.answers[0].answer, finalText);
  room.requests[2].complete();
  await room.flush();
  assert.equal(room.latestReview().attempt.answers[0].answer, finalText);
  assert.equal(room.latestReview().attempt.status, "submitted");
  assert.equal(room.feedbackRequests.length, 0);
});

test("feedback is requested explicitly from review and does not resubmit the transcript", async () => {
  const room = await autosaveRoom();
  room.edit("I learnt to listen carefully and reflect on each person's needs.");
  room.finish();
  await room.flush();
  room.requests[0].complete();
  await room.flush();
  const review = room.latestReview();
  assert.equal(room.feedbackRequests.length, 0);
  review.onGenerate(); review.onGenerate();
  await room.flush();
  assert.equal(room.feedbackRequests.length, 1, "Repeated clicks cannot request multiple assessments");
  assert.equal(room.feedbackRequests[0].body.attemptId, circuitId);
  assert.equal(room.requests.length, 1, "Feedback uses the already saved attempt");
  const feedback = { score: 76, summary: "Clear reflection", strengths: ["Listening"], improvements: ["More detail"], rubric: [] };
  room.feedbackRequests[0].complete(feedback);
  await room.flush();
  assert.deepEqual(room.latestReview().attempt.feedback, feedback);
  assert.equal(room.latestReview().attempt.status, "completed");
  assert.equal(room.latestCall(), null);
});

test("a failed finish keeps the transcript in review and retains the recoverable browser draft", async () => {
  const room = await autosaveRoom();
  room.edit("Keep this final answer safe.");
  room.finish();
  await room.flush();
  room.requests[0].reject(new Error("Temporary connection failure"));
  await room.flush();
  const review = room.latestReview();
  assert.equal(review.attempt.answers[0].answer, "Keep this final answer safe.");
  assert.equal(review.attempt.status, "in_progress");
  assert.equal(review.busy, false);
  const draft = JSON.parse(room.storage.get(`phloem-interview-draft:${circuitId}`));
  assert.equal(draft.answers[0].answer, "Keep this final answer safe.");
  assert.equal(room.feedbackRequests.length, 0);
});

test("a follow-up saves the answer first, inserts the probe, and preserves later answers", async () => {
  const room = await autosaveRoom({ followUps: true, questions: ["Why medicine?", "Why this role?"], initialDraft: {
    answers: [{ question: "Why medicine?", answer: "" }, { question: "Why this role?", answer: "An existing answer to preserve" }], questionIndex: 0,
  } });
  const answer = "Volunteering in a care home showed me how listening carefully and working together can help people feel understood and supported when they are worried.";
  room.edit(answer);
  room.latestCall().onConfirmDone();
  room.latestCall().onConfirmDone();
  await room.flush();
  assert.equal(room.requests.length, 1);
  assert.equal(room.followUpRequests.length, 0, "Generation waits for the saved answer");
  room.requests[0].complete();
  await room.flush();
  assert.equal(room.followUpRequests.length, 1, "Double clicks cannot spend extra quota");
  room.followUpRequests[0].complete("How did you adapt your listening?", "practice");
  await room.flush();
  const call = room.latestCall();
  assert.equal(call.questionIndex, 1);
  assert.equal(call.answers[0].answer, answer);
  assert.equal(call.answers[1].answer, "");
  assert.equal(call.answers[2].answer, "An existing answer to preserve");
  assert.equal(call.onFollowUp, undefined, "Follow-ups have no manual trigger");
  assert.match(call.followUpNotice, /guided practice/);
  assert.equal(call.followUpBusy, false);
});

test("draft recovery matches questions after a probe was inserted on the server", async () => {
  const room = await autosaveRoom({ questions: ["Why medicine?", "What did you learn?", "Why this role?"], initialDraft: {
    answers: [{ question: "Why medicine?", answer: "First draft" }, { question: "Why this role?", answer: "Later draft" }], questionIndex: 1,
  } });
  assert.equal(room.call.questionIndex, 2);
  assert.equal(room.call.answers[0].answer, "First draft");
  assert.equal(room.call.answers[1].answer, "");
  assert.equal(room.call.answers[2].answer, "Later draft");
});

function questionRecordingRoom({ recorderFails = false } = {}) {
  const effects = [];
  const recorders = [];
  let grantPermission;
  let trackStops = 0;
  const stream = { getTracks: () => [{ stop: () => { trackStops += 1; } }] };
  class Recognition { start() {} stop() {} }
  class Recorder {
    constructor() {
      if (recorderFails) throw new Error("Recording format unavailable");
      this.state = "inactive";
      recorders.push(this);
    }
    start() { this.state = "recording"; }
    stop() { this.state = "inactive"; }
  }
  const source = readFileSync(resolve(root, "app/phloemai/interviews/_components/InterviewQuestionBankDashboard.tsx"), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const loaded = { exports: {} };
  runInNewContext(`${output}\nexports.testPracticeView = QuestionPracticeView;`, {
    module: loaded, exports: loaded.exports, MediaRecorder: Recorder,
    require(name) {
      if (name.endsWith("speech-delivery") || name.endsWith("question-review")) {
        const delivery = { exports: {} };
        new Function("module", "exports", ts.transpileModule(readFileSync(resolve(root, `app/phloemai/interviews/_lib/${name.split("/").at(-1)}.ts`), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(delivery, delivery.exports);
        return delivery.exports;
      }
      if (name === "react") return {
        useState: initial => [typeof initial === "function" ? initial() : initial, () => {}],
        useRef: current => ({ current }), useCallback: callback => callback,
        useEffect: effect => effects.push(effect), useMemo: callback => callback(),
        useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
      };
      if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      return {};
    },
    navigator: { mediaDevices: { getUserMedia: () => new Promise(resolve => { grantPermission = () => resolve(stream); }) } },
    window: {
      SpeechRecognition: Recognition, MediaRecorder: Recorder,
      setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
    },
  });
  const tree = loaded.exports.testPracticeView({
    category: { title: "Personal & Motivation", colour: "#fff" },
    selectedSubcategory: "Motivation for Medicine", questionNumber: 1,
    question: { id: "question", text: "Why medicine?", category: "Personal & Motivation", subcategory: "Motivation for Medicine", difficulty: "standard" },
    initialSavedResponse: null, onBackToQuestions() {}, onQuestionResponseSaved() {}, onQuestionReset() {}, onQuestionStatusChange() {},
  });
  const cleanups = effects.map(effect => effect()).filter(Boolean);
  const findButton = (node, label) => {
    if (Array.isArray(node)) return node.map(child => findButton(child, label)).find(Boolean);
    if (!node || typeof node !== "object") return null;
    if (node.type === "button" && node.props.children?.includes?.(label)) return node.props;
    return findButton(node.props?.children, label);
  };
  const voice = findButton(tree, "Voice");
  assert.ok(voice);
  voice.onClick();
  return {
    recorders, get trackStops() { return trackStops; },
    switchToText: () => findButton(tree, "Text").onClick(),
    unmount: () => cleanups.forEach(cleanup => cleanup()),
    grant: async () => { grantPermission(); await new Promise(resolve => setImmediate(resolve)); },
  };
}

test("leaving a question releases microphone permission that arrives after unmount", async () => {
  const room = questionRecordingRoom();
  room.unmount();
  await room.grant();
  assert.equal(room.recorders.length, 0, "Leaving must not start an orphan recording");
  assert.equal(room.trackStops, 1);
});

test("switching to text cancels an outstanding question recording request", async () => {
  const room = questionRecordingRoom();
  room.switchToText();
  await room.grant();
  assert.equal(room.recorders.length, 0);
  assert.equal(room.trackStops, 1);
  room.unmount();
});

test("recorder construction failures release the newly granted microphone", async () => {
  const room = questionRecordingRoom({ recorderFails: true });
  await room.grant();
  assert.equal(room.trackStops, 1);
  room.unmount();
});

// Exercise device permission lifecycle with delayed native browser responses.
function microphoneDevices({ supported = true } = {}) {
  const cells = [];
  const effects = [];
  const requests = [];
  let cursor = 0;
  let stateWrites = 0;
  let cleanups = [];
  const memo = (factory, dependencies) => {
    const index = cursor++;
    const prior = cells[index];
    if (!prior || !dependencies || dependencies.some((value, i) => !Object.is(value, prior.dependencies[i]))) cells[index] = { value: factory(), dependencies };
    return cells[index].value;
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in cells)) cells[index] = initial;
      return [cells[index], value => { stateWrites += 1; cells[index] = typeof value === "function" ? value(cells[index]) : value; }];
    },
    useRef: current => memo(() => ({ current }), []),
    useCallback: (callback, dependencies) => memo(() => callback, dependencies),
    useEffect: (effect, dependencies) => memo(() => { effects.push(effect); }, dependencies),
  };
  const loaded = { exports: {} };
  runInNewContext(ts.transpileModule(readFileSync(resolve(root, "app/phloemai/interviews/_lib/useInterviewDevices.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, {
    module: loaded, exports: loaded.exports,
    require: name => { assert.equal(name, "react"); return react; },
    navigator: { mediaDevices: supported ? {
      getUserMedia: constraints => new Promise((resolve, reject) => {
        const request = {
          constraints, stoppedTracks: 0,
          grant: () => resolve({ getTracks: () => [{ stop: () => { request.stoppedTracks += 1; } }] }),
          deny: () => reject({ name: "NotAllowedError" }),
        };
        requests.push(request);
      }),
    } : undefined },
  });
  const render = () => { cursor = 0; return loaded.exports.useInterviewDevices(); };
  const initial = render();
  const mount = () => { cleanups = effects.map(effect => effect()).filter(Boolean); };
  const unmount = () => { cleanups.forEach(cleanup => cleanup()); cleanups = []; };
  mount();
  return { initial, render, requests, unmount, replayEffects: () => { unmount(); mount(); }, get stateWrites() { return stateWrites; } };
}

test("native interview microphone permission requests audio only and immediately releases granted tracks", async () => {
  const browser = microphoneDevices();
  const pending = browser.initial.requestMicrophone();
  assert.equal(browser.render().microphonePermission, "requesting");
  assert.equal(browser.requests[0].constraints.audio, true);
  assert.equal(browser.requests[0].constraints.video, false);
  browser.requests[0].grant();
  assert.equal(await pending, true);
  assert.equal(browser.render().microphonePermission, "granted");
  assert.equal(browser.requests[0].stoppedTracks, 1);
  browser.unmount();
});

test("denied microphone access stays off without a prompt loop and supports an explicit retry", async () => {
  const browser = microphoneDevices();
  const denied = browser.initial.requestMicrophone();
  browser.requests[0].deny();
  assert.equal(await denied, false);
  assert.equal(browser.render().microphonePermission, "denied");
  assert.match(browser.render().microphoneError, /type your answer/);
  assert.equal(browser.requests.length, 1);
  const retry = browser.render().requestMicrophone();
  browser.requests[1].grant();
  assert.equal(await retry, true);
  assert.equal(browser.render().microphoneError, "");
  browser.unmount();
});

test("cancelling pending permission prevents activation and releases a late grant", async () => {
  const browser = microphoneDevices();
  const pending = browser.initial.requestMicrophone();
  browser.initial.cancelMicrophoneRequest();
  browser.requests[0].grant();
  assert.equal(await pending, false);
  assert.equal(browser.render().microphonePermission, "idle");
  assert.equal(browser.requests[0].stoppedTracks, 1);
  browser.unmount();
});

test("unmounting releases late microphone permission without changing component state", async () => {
  const browser = microphoneDevices();
  const pending = browser.initial.requestMicrophone();
  browser.unmount();
  const stateWrites = browser.stateWrites;
  browser.requests[0].grant();
  assert.equal(await pending, false);
  assert.equal(browser.requests[0].stoppedTracks, 1);
  assert.equal(browser.stateWrites, stateWrites);
});

test("React effect replay reuses the pending native microphone prompt", async () => {
  const browser = microphoneDevices();
  const previous = browser.initial.requestMicrophone();
  browser.replayEffects();
  const current = browser.render().requestMicrophone();
  assert.equal(browser.requests.length, 1);
  browser.requests[0].grant();
  assert.equal(await previous, false);
  assert.equal(await current, true);
  assert.equal(browser.requests[0].stoppedTracks, 1);
  browser.unmount();
});

test("unavailable browser microphone APIs preserve a typed-answer fallback", async () => {
  const browser = microphoneDevices({ supported: false });
  assert.equal(await browser.initial.requestMicrophone(), false);
  assert.equal(browser.render().microphonePermission, "unavailable");
  assert.match(browser.render().microphoneError, /Type your answer/);
  assert.equal(browser.requests.length, 0);
  browser.unmount();
});


test("silence asks once, no and continued speech keep the same answer, yes moves only forward", async () => {
  const room = await autosaveRoom({ questions: ["Why medicine?", "What did you learn?"] });
  await room.flush(); room.render();
  room.say("Listening taught me to understand each patient."); room.render();
  room.silence(); room.silence(); await room.flush();
  assert.equal(room.latestCall().awaitingDone, true);
  room.say("No."); room.render();
  assert.equal(room.latestCall().awaitingDone, false);
  assert.equal(room.latestCall().questionIndex, 0);
  room.silence(); await room.flush(); room.render();
  room.say("I also learned to ask for support."); room.render();
  assert.match(room.latestCall().answers[0].answer, /ask for support/);
  room.silence(); await room.flush(); room.render();
  room.say("Yes."); await room.flush();
  const call = room.latestCall();
  assert.equal(call.questionIndex, 1);
  assert.doesNotMatch(call.answers[0].answer, /\b(?:yes|no)\b/i);
  assert.equal(call.answers[1].answer, "");
  assert.equal(call.onQuestion, undefined);
  assert.equal(room.followUpRequests.length, 0, "Disabled stations never ask for a follow-up");
});

test("a final yes finishes the station and is excluded from the saved answer", async () => {
  const room = await autosaveRoom();
  await room.flush(); room.render();
  room.say("I learned to listen."); room.render();
  room.silence(); await room.flush(); room.render();
  room.say("Yes."); await room.flush();
  assert.equal(room.requests.length, 1);
  assert.equal(room.requests[0].body.finish, true);
  assert.equal(room.requests[0].body.answers[0].answer, "I learned to listen.");
  room.requests[0].complete(); await room.flush();
  assert.equal(room.latestReview().attempt.status, "submitted");
});


test("a read-aloud failure does not block the approved microphone", async () => {
  const room = await autosaveRoom({ speechError: "Read-aloud could not play. You can read the question on screen." });
  await room.flush(); room.render();
  assert.equal(room.recognitionStarts, 1);
});

test("natural confirmation variants advance without treating an ongoing answer as yes", () => {
  for (const reply of ["Yes, I'm done.", "Yeah, I’m finished.", "Yes please!", "That's everything.", "Yes, thank you."]) {
    assert.equal(parseDoneReply(reply).done, true, reply);
  }
  for (const reply of ["No.", "Not yet.", "Yes, and I also learned to listen."]) {
    assert.equal(parseDoneReply(reply).done, false, reply);
  }
  assert.equal(parseDoneReply("No, I have another example.").continuation, "I have another example.");
});

test("an interim-only confirmation is flushed after its pause and advances without a click", async () => {
  const room = await autosaveRoom({ questions: ["Why medicine?", "What did you learn?"] });
  await room.flush(); room.render();
  room.say("I learned to listen to patients."); room.render();
  room.silence(); await room.flush(); room.render();
  room.finalSpeech("Yes.");
  room.silence(); await room.flush();
  assert.equal(room.latestCall().questionIndex, 1);
  assert.equal(room.latestCall().answers[0].answer, "I learned to listen to patients.");
});

test("spoken questions use varied transitions and late confirmation words cannot enter either answer", async () => {
  const room = await autosaveRoom({ voiceSupported: true, questions: ["Why medicine?", "What did you learn?", "Why this role?"] });
  await room.flush(); room.render();
  assert.deepEqual(room.spoken, ["Why medicine?"]);
  room.say("I learned to listen to patients."); room.render();
  room.silence(); await room.flush(); room.render();
  assert.equal(room.spoken.at(-1), DONE_PROMPT);
  room.finalSpeech("Yes, I'm done.");
  room.latestCall().onConfirmDone(); await room.flush(); room.render();
  assert.equal(room.latestCall().answers[0].answer, "I learned to listen to patients.");
  assert.equal(room.latestCall().answers[1].answer, "");
  assert.equal(room.spoken.at(-1), `${questionTransition(1)} What did you learn?`);
  assert.notEqual(questionTransition(1), questionTransition(2));
  assert.notEqual(questionTransition(1), questionTransition(1, true));
});
