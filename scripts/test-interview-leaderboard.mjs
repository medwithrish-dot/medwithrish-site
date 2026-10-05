import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const owner = "a1234567-1234-4234-8234-123456789012";
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://example.test";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-public-key";

function load(file, mocks, cache = new Map()) {
  const filename = resolve(root, file);
  if (cache.has(filename)) return cache.get(filename);
  const loaded = { exports: {} };
  cache.set(filename, loaded.exports);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const localRequire = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks, cache);
    if (name.startsWith(".")) return load(resolve(dirname(filename), `${name}.ts`), mocks, cache);
    return require(name);
  };
  new Function("require", "module", "exports", output)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

function harness({ signedIn = false } = {}) {
  const state = {
    userId: signedIn ? owner : null, authThrows: false, anonymousCalls: 0, signedInCalls: 0, reads: [], scoreFilter: null, writes: [], readError: null, writeError: null,
  };
  const rows = [{ rank: 1, display_name: "f.u.c.k", score: 91, completed_at: "2026-09-01T12:00:00Z", is_you: null }];
  const result = () => ({ data: rows, error: state.readError && { code: "XX000", message: state.readError } });
  const query = table => {
    state.reads.push(table);
    const chain = {
      select: () => chain, eq: () => chain, order: () => chain, limit: () => chain,
      not: (column, operator, value) => { state.scoreFilter = [column, operator, value]; return chain; },
      maybeSingle: async () => ({ data: table === "interview_preferences"
        ? { display_name: "Rish", leaderboard_opt_in: true } : { score: 88.5 }, error: state.readError && { code: "XX000", message: state.readError } }),
    };
    return chain;
  };
  const signedClient = {
    auth: { getUser: async () => {
      if (state.authThrows) throw new Error("Auth temporarily unavailable");
      return { data: { user: state.userId ? { id: state.userId } : null }, error: null };
    } },
    rpc: async () => { state.signedInCalls += 1; return { ...result(), data: rows.map(row => ({ ...row, is_you: true })) }; },
    from: query,
  };
  const anonymousClient = {
    rpc: async () => { state.anonymousCalls += 1; return result(); },
  };
  const admin = {
    from(table) {
      assert.equal(table, "interview_preferences");
      return { upsert: async value => { state.writes.push(value); return { error: state.writeError && { code: "XX000", message: state.writeError } }; } };
    },
  };
  class InterviewError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
  const mocks = {
    "@/utils/supabase/server": { createClient: async () => signedClient },
    "@/utils/supabase/admin": { createAdminClient: () => admin },
    "@supabase/supabase-js": { createClient: () => anonymousClient },
    "@/utils/interviews/server": {
      InterviewError,
      readInterviewBody: request => request.json(),
      interviewJson: data => Response.json(data),
      interviewFailure: error => Response.json({ error: error instanceof InterviewError ? error.message : "Service unavailable" }, { status: error.status ?? 503 }),
    },
  };
  const route = load("app/api/interviews/leaderboard/route.ts", mocks);
  const patch = body => route.PATCH(new Request("https://example.test/api/interviews/leaderboard", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  }));
  return { state, route, patch };
}

test("guests see only opted-in public scores and cannot save preferences", async () => {
  const api = harness();
  const response = await api.route.GET();
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(data.entries.map(({ display_name, is_you }) => [display_name, is_you]), [["Candidate", false]]);
  assert.equal(data.preference, null);
  assert.equal(data.bestScore, null);
  assert.equal(api.state.anonymousCalls, 1);
  assert.equal(api.state.signedInCalls, 0);
  assert.deepEqual(api.state.reads, []);
  assert.equal((await api.patch({ displayName: "Rish", optIn: true })).status, 401);
  assert.deepEqual(api.state.writes, []);
  api.state.authThrows = true;
  assert.equal((await api.route.GET()).status, 200);
  assert.equal(api.state.anonymousCalls, 2);
});

test("signed-in members see their own preference and save only their own validated name", async () => {
  const api = harness({ signedIn: true });
  const data = await (await api.route.GET()).json();
  assert.equal(data.entries[0].is_you, true);
  assert.deepEqual(data.preference, { display_name: "Rish", leaderboard_opt_in: true });
  assert.equal(data.bestScore, 88.5);
  assert.deepEqual(api.state.scoreFilter, ["score", "is", null]);
  assert.equal(api.state.anonymousCalls, 0);
  assert.deepEqual(api.state.reads, ["interview_preferences", "interview_attempts"]);
  assert.equal((await api.patch({ displayName: "f.u.c.k", optIn: true })).status, 400);
  assert.equal((await api.patch({ displayName: " Rish ", optIn: false, userId: "another-user" })).status, 200);
  assert.equal(api.state.writes.length, 1);
  assert.equal(api.state.writes[0].user_id, owner);
  assert.equal(api.state.writes[0].display_name, "Rish");
  assert.equal(api.state.writes[0].leaderboard_opt_in, false);
});

test("leaderboard read and write failures never expose database details", async () => {
  const api = harness({ signedIn: true });
  api.state.readError = "Private database diagnostic";
  const read = await api.route.GET();
  assert.equal(read.status, 503);
  assert.doesNotMatch((await read.json()).error, /Private database diagnostic/);
  api.state.writeError = "Private database diagnostic";
  const write = await api.patch({ displayName: "Rish", optIn: true });
  assert.equal(write.status, 503);
  assert.doesNotMatch((await write.json()).error, /Private database diagnostic/);
});

test("the guest leaderboard shows a sign-in action instead of editable preferences", async () => {
  const source = readFileSync(resolve(root, "app/medicforest/interview/_components/InterviewLeaderboard.tsx"), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const cells = [];
  let cursor = 0;
  let effects = [];
  const changed = (previous, dependencies) => !previous || dependencies.some((value, index) => !Object.is(value, previous.dependencies[index]));
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in cells)) cells[index] = typeof initial === "function" ? initial() : initial;
      return [cells[index], next => { cells[index] = typeof next === "function" ? next(cells[index]) : next; }];
    },
    useCallback(callback, dependencies) {
      const index = cursor++;
      if (changed(cells[index], dependencies)) cells[index] = { callback, dependencies };
      return cells[index].callback;
    },
    useEffect(callback, dependencies) {
      const index = cursor++;
      if (changed(cells[index], dependencies)) { cells[index] = { dependencies }; effects.push(callback); }
    },
  };
  const loaded = { exports: {} };
  new Function("require", "module", "exports", "fetch", output)(name => {
    if (name === "@/utils/medicforest/feature-access") return { requestFeatureAccess: () => true };
      if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name === "next/link") return { __esModule: true, default: "link" };
    if (name === "lucide-react") return new Proxy({}, { get: () => "icon" });
    if (name === "@/utils/interviews/public-name") return { publicNameError: () => null };
    throw new Error(`Unexpected leaderboard dependency: ${name}`);
  }, loaded, loaded.exports, async () => Response.json({ entries: [], preference: null, bestScore: null }));
  const render = () => {
    cursor = 0;
    const tree = loaded.exports.InterviewLeaderboard();
    const pendingEffects = effects; effects = [];
    pendingEffects.forEach(effect => effect());
    return tree;
  };
  const find = (node, predicate) => {
    if (Array.isArray(node)) return node.map(item => find(item, predicate)).find(Boolean);
    if (!node || typeof node !== "object") return undefined;
    return predicate(node) ? node : find(node.props?.children, predicate);
  };
  render();
  await new Promise(resolve => setImmediate(resolve));
  const guest = render();
  assert.ok(find(guest, node => node.type === "link" && node.props?.href === "/medicforest/account"));
  assert.equal(find(guest, node => node.type === "input" && node.props?.id === "leaderboard-name"), undefined);
});
