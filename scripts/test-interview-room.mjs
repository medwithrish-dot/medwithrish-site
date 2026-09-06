import assert from "node:assert/strict";
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
  class InterviewError extends Error {
    constructor(message, status = 400) { super(message); this.status = status; }
  }
  const query = {
    select() { return this; },
    eq(key, value) { filters.push([key, value]); return this; },
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
    reservations, filters,
    post: body => route.POST(new Request("http://localhost/api/interviews/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })),
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

// Exercise the actual room callbacks against delayed saves. Browser, device and
// hook lifecycle boundaries are substituted; all save scheduling stays production code.
async function autosaveRoom() {
  const cells = [];
  let cursor = 0;
  let effects = [];
  const intervals = new Map();
  const storage = new Map();
  const requests = [];
  const attempt = {
    id: circuitId, circuitId, status: "in_progress", mode: "free", stationSlug: "why-medicine",
    title: "Why medicine?", startedAt: new Date().toISOString(), preparationSeconds: 0,
    stationSeconds: 480, breakSeconds: 0, questions: ["Why medicine?"], answers: [],
    stationIndex: 0, stationCount: 1, feedback: null, nextAvailableAt: null,
  };
  const memo = (factory, dependencies) => {
    const index = cursor++;
    const prior = cells[index];
    if (!prior || dependencies.some((value, i) => !Object.is(value, prior.dependencies[i]))) {
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
  const speech = { stop: async () => {}, stopSpeaking() {}, speak: async () => {}, voiceSupported: false };
  const devices = { stopCamera() {}, stopMicCheck() {} };
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
      if (name.endsWith("useInterviewSpeech")) return { useInterviewSpeech: () => speech, getTranscriptHints: text => ({ wordCount: text.split(/\s+/).filter(Boolean).length }) };
      if (name.endsWith("useInterviewDevices")) return { useInterviewDevices: () => devices };
      if (name === "./AIInterviewCall") return { AIInterviewCall: "interview-call" };
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
      if (options.method === "GET") return Promise.resolve(Response.json({ attempt }));
      assert.equal(options.method, "PATCH");
      const body = JSON.parse(options.body);
      return new Promise((resolve, reject) => requests.push({
        body, reject, complete: () => resolve(Response.json({ attempt: { ...attempt, answers: body.answers } })),
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
  const findCall = node => {
    if (Array.isArray(node)) return node.map(findCall).find(Boolean);
    if (!node || typeof node !== "object") return null;
    return node.type === "interview-call" ? node.props : findCall(node.props?.children);
  };
  const call = findCall(tree);
  assert.ok(call);
  return { requests, flush, edit: text => call.onAnswer(text), save: () => intervals.get(15_000)() };
}

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
      if (name === "react") return {
        useState: initial => [typeof initial === "function" ? initial() : initial, () => {}],
        useRef: current => ({ current }), useCallback: callback => callback,
        useEffect: effect => effects.push(effect), useMemo: callback => callback(),
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
