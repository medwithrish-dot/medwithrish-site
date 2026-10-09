import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
function load(file, cache = new Map()) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const compiled = { exports: {} }; cache.set(path, compiled.exports);
  const output = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  new Function("require", "module", "exports", output)(name => {
    if (name === "server-only") return {};
    return name.startsWith(".") ? load(resolve(dirname(path), `${name}.ts`), cache) : require(name);
  }, compiled, compiled.exports);
  return compiled.exports;
}
const storage = load("app/medicforest/interview/_lib/question-bank-storage.ts");
function browser() {
  const data = new Map();
  globalThis.window = { localStorage: {
    get length() { return data.size; }, key: index => [...data.keys()][index],
    getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key),
  } };
}
const empty = () => ({ statusById: new Map(), savedResponsesByQuestionId: new Map() });
const response = answer => ({ questionId: "q1", answer, completedAt: "2026-10-04T12:00:00Z", elapsedSeconds: 60, suggestedSeconds: 120, mode: "text", completionReason: "manual", wordCount: 2 });
function database(onWrite = async () => {}) {
  const writes = [];
  const supabase = { from: () => ({
    async upsert(rows, options) { writes.push({ rows, options }); await onWrite(); return { error: null }; },
    delete() { return { eq() { return this; }, then(resolve) { writes.push({ deleted: true }); return onWrite().then(() => resolve({ error: null })); } }; },
  }) };
  return { supabase, writes };
}
test("failed saves stay recoverable; retries preserve newer answers over old cloud rows", async () => {
  browser(); const saved = response("New answer");
  storage.writeBrowserQuestionProgress("q1", "completed", saved, "owner");
  const failing = database(async () => { throw new Error("offline"); });
  await assert.rejects(storage.writeSupabaseQuestionProgress({ supabase: failing.supabase, userId: "owner", questionId: "q1", status: "completed", response: saved }));
  assert.equal(storage.hasPendingQuestionProgress("owner"), true);
  const remote = { statusById: new Map([["q1", "review"]]), savedResponsesByQuestionId: new Map([["q1", response("Old answer")]]) };
  assert.equal(storage.mergeQuestionProgressSnapshots(remote, storage.readBrowserQuestionProgress("owner"), "owner").savedResponsesByQuestionId.get("q1").answer, "New answer");
  const db = database();
  await storage.syncBrowserProgressToSupabase({ supabase: db.supabase, userId: "owner", browserSnapshot: storage.readBrowserQuestionProgress("owner"), remoteSnapshot: remote });
  assert.equal(db.writes[0].rows.answer, "New answer"); assert.equal(storage.hasPendingQuestionProgress("owner"), false);
});
test("offline reset tombstones survive refresh and remove stale cloud results", async () => {
  browser(); storage.writeBrowserQuestionProgress("q1", "not-attempted", undefined, "owner");
  const remote = { statusById: new Map([["q1", "completed"]]), savedResponsesByQuestionId: new Map([["q1", response("Old answer")]]) };
  const local = storage.readBrowserQuestionProgress("owner");
  const merged = storage.mergeQuestionProgressSnapshots(remote, local, "owner");
  assert.equal(merged.statusById.has("q1"), false); assert.equal(merged.savedResponsesByQuestionId.has("q1"), false);
  const db = database();
  await storage.syncBrowserProgressToSupabase({ supabase: db.supabase, userId: "owner", browserSnapshot: local, remoteSnapshot: remote });
  assert.equal(db.writes[0].deleted, true); assert.equal(storage.hasPendingQuestionProgress("owner"), false);
});
test("an old acknowledgement cannot erase a newer local edit", async () => {
  browser(); let release;
  const db = database(() => new Promise(resolve => { release = resolve; })); const old = response("Old answer");
  storage.writeBrowserQuestionProgress("q1", "completed", old, "owner");
  const write = storage.writeSupabaseQuestionProgress({ supabase: db.supabase, userId: "owner", questionId: "q1", status: "completed", response: old });
  await new Promise(resolve => setImmediate(resolve));
  storage.writeBrowserQuestionProgress("q1", "review", response("Latest answer"), "owner"); release(); await write;
  assert.equal(storage.hasPendingQuestionProgress("owner"), true);
  assert.equal(storage.readBrowserQuestionProgress("owner").savedResponsesByQuestionId.get("q1").answer, "Latest answer");
});
test("writes for the same owner are serialised even after an earlier failure", async () => {
  browser(); let active = 0; let maxActive = 0; let calls = 0;
  const db = database(async () => {
    active++; maxActive = Math.max(active, maxActive); await new Promise(resolve => setImmediate(resolve)); active--;
    if (++calls === 1) throw new Error("offline");
  });
  const writes = ["completed", "review", "not-attempted"].map(status => {
    storage.writeBrowserQuestionProgress("q1", status, response(status), "owner");
    return storage.writeSupabaseQuestionProgress({ supabase: db.supabase, userId: "owner", questionId: "q1", status, response: response(status) });
  });
  const results = await Promise.allSettled(writes);
  assert.equal(results[0].status, "rejected"); assert.equal(results[2].status, "fulfilled");
  assert.equal(maxActive, 1); assert.equal(storage.hasPendingQuestionProgress("owner"), false);
});
test("legacy imports use bounded batches and do not overwrite another device", async () => {
  browser(); const local = empty();
  for (let index = 0; index < 250; index++) local.statusById.set(`q${index}`, "completed");
  const db = database();
  await storage.syncBrowserProgressToSupabase({ supabase: db.supabase, userId: "owner", browserSnapshot: local, remoteSnapshot: empty() });
  assert.deepEqual(db.writes.map(write => write.rows.length), [100, 100, 50]);
  assert.ok(db.writes.every(write => write.options.ignoreDuplicates));
});
test("50 separate owners save without leaking drafts across accounts", async () => {
  browser(); const db = database();
  await Promise.all(Array.from({ length: 50 }, async (_, index) => {
    const userId = `owner-${index}`; const saved = response(`Private answer ${index}`);
    storage.writeBrowserQuestionProgress("q1", "completed", saved, userId);
    assert.equal(storage.readBrowserQuestionProgress(userId).savedResponsesByQuestionId.get("q1").answer, saved.answer);
    await storage.writeSupabaseQuestionProgress({ supabase: db.supabase, userId, questionId: "q1", status: "completed", response: saved });
    assert.equal(storage.hasPendingQuestionProgress(userId), false);
  }));
  assert.equal(new Set(db.writes.map(write => write.rows.user_id)).size, 50);
  assert.equal(storage.readBrowserQuestionProgress(null).savedResponsesByQuestionId.size, 0);
});
test("blocked browser storage does not prevent completing a response", () => {
  globalThis.window = { localStorage: { getItem() { throw new Error("disabled"); }, setItem() { throw new Error("disabled"); }, removeItem() { throw new Error("disabled"); } } };
  assert.doesNotThrow(() => storage.writeBrowserQuestionProgress("q1", "completed", response("Answer"), "owner"));
  assert.equal(storage.readBrowserQuestionProgress("owner").statusById.size, 0);
});
const { createInterviewProviderLoad, InterviewAiBusyError } = load("utils/interviews/provider-load.ts");
test("50 simultaneous AI requests have bounded admission and release safely", () => {
  const gate = createInterviewProviderLoad(); const releases = []; let rejected = 0;
  for (let index = 0; index < 50; index++) {
    try { releases.push(gate.acquire()); } catch (error) { assert.ok(error instanceof InterviewAiBusyError); rejected++; }
  }
  assert.equal(releases.length, 20); assert.equal(rejected, 30);
  releases.forEach(release => { release(); release(); }); gate.acquire()();
});
test("rate limits cool down and automatically recover without provider retries", () => {
  let now = 0; const gate = createInterviewProviderLoad(() => now); gate.unavailable(429, "30");
  assert.throws(gate.acquire, InterviewAiBusyError); now = 29_999; assert.throws(gate.acquire, InterviewAiBusyError);
  now = 30_000; gate.acquire()(); gate.unavailable(503, "invalid"); now += 15_000; gate.acquire()();
  gate.unavailable(400, "60"); gate.acquire()();
});

test("account profile requests cannot restore an earlier user's data after switching accounts", async () => {
  const states = []; const effects = []; const timers = []; let authChanged; let resolveInitial;
  const pendingProfiles = new Map();
  const client = {
    auth: {
      getSession: () => new Promise(resolve => { resolveInitial = resolve; }),
      onAuthStateChange: callback => { authChanged = callback; return { data: { subscription: { unsubscribe() {} } } }; },
    },
    from: () => ({ select() { return this; }, eq(_key, id) { this.id = id; return this; }, maybeSingle() {
      return new Promise(resolve => pendingProfiles.set(this.id, resolve));
    } }),
  };
  const react = {
    useState(initial) { const index = states.length; states.push(typeof initial === "function" ? initial() : initial); return [states[index], value => { states[index] = typeof value === "function" ? value(states[index]) : value; }]; },
    useRef: current => ({ current }), useMemo: callback => callback(), useCallback: callback => callback,
    useEffect: callback => effects.push(callback),
  };
  const file = resolve(root, "app/medicforest/account/_client.tsx");
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const compiled = { exports: {} };
  new Function("require", "module", "exports", "window", output)(name => {
    if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name === "next/navigation") return { useRouter: () => ({}) };
    if (name === "@/utils/supabase/client") return { hasSupabaseConfig: () => true, createClient: () => client };
    return {};
  }, compiled, compiled.exports, {
    location: { search: "", pathname: "/medicforest/account", hash: "" },
    history: { replaceState() {} },
    setTimeout: callback => timers.push(callback),
    clearTimeout() {},
  });
  compiled.exports.ManageAccountClient({});
  const cleanup = effects[0]();
  authChanged("SIGNED_IN", { user: { id: "first" } }); timers.shift()();
  authChanged("SIGNED_IN", { user: { id: "second" } }); timers.shift()();
  pendingProfiles.get("second")({ data: { full_name: "Second student" }, error: null });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(states[1].full_name, "Second student");
  pendingProfiles.get("first")({ data: { full_name: "First student" }, error: null });
  resolveInitial({ data: { session: { user: { id: "first" } } } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(states[0].id, "second"); assert.equal(states[1].full_name, "Second student");
  authChanged("SIGNED_IN", { user: { id: "third" } }); timers.shift()(); cleanup();
  pendingProfiles.get("third")({ data: { full_name: "Unmounted student" }, error: null });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(states[1], null, "the late profile cannot update an unmounted account view");
});

test("verification waits for browser auth initialization without exchanging the one-use code again", async () => {
  const states = []; const effects = []; const timers = [];
  let authChanged; let resolveSession; let reads = 0; let exchanges = 0; let cleanedUrl;
  const client = {
    auth: {
      getSession: () => { reads++; return new Promise(resolve => { resolveSession = resolve; }); },
      exchangeCodeForSession: async () => { exchanges++; throw new Error("code already consumed"); },
      onAuthStateChange: callback => { authChanged = callback; return { data: { subscription: { unsubscribe() {} } } }; },
    },
    from: () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { full_name: "Verified student" }, error: null }) }),
  };
  const react = {
    useState(initial) { const index = states.length; states.push(typeof initial === "function" ? initial() : initial); return [states[index], value => { states[index] = typeof value === "function" ? value(states[index]) : value; }]; },
    useRef: current => ({ current }), useMemo: callback => callback(), useCallback: callback => callback,
    useEffect: callback => effects.push(callback),
  };
  const output = ts.transpileModule(readFileSync(resolve(root, "app/medicforest/account/_client.tsx"), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const compiled = { exports: {} };
  new Function("require", "module", "exports", "window", output)(name => {
    if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name === "next/navigation") return { useRouter: () => ({}) };
    if (name === "@/utils/supabase/client") return { hasSupabaseConfig: () => true, createClient: () => client };
    return {};
  }, compiled, compiled.exports, {
    location: { search: "?code=one-use&next=%2Finterviews%2Fdashboard", pathname: "/account", hash: "" },
    history: { replaceState(_state, _title, url) { cleanedUrl = url; } },
    setTimeout: callback => timers.push(callback), clearTimeout() {},
  });
  compiled.exports.ManageAccountClient({});
  const cleanup = effects[0]();
  authChanged("INITIAL_SESSION", { user: { id: "verified" } });
  resolveSession({ data: { session: { user: { id: "verified" } } }, error: null });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(reads, 1);
  assert.equal(exchanges, 0);
  assert.equal(states[0].id, "verified");
  assert.equal(states[1].full_name, "Verified student");
  assert.equal(states[2], false, "INITIAL_SESSION must not leave the account stuck loading");
  assert.equal(cleanedUrl, "/account?next=%2Finterviews%2Fdashboard", "keep the signup origin but remove the consumed code");
  cleanup();
});
