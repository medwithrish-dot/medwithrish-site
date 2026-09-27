import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const groupId = "a1234567-1234-4234-8234-123456789012";
const roomId = "b1234567-1234-4234-8234-123456789012";

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

function harness({ signedIn = true } = {}) {
  const state = { signedIn, calls: [], rpcError: null };
  const supabase = {
    auth: { getUser: async () => ({ data: { user: state.signedIn ? { id: "owner" } : null }, error: null }) },
    rpc: async (name, args) => {
      state.calls.push({ name, args });
      return { data: { userId: "owner", groups: [] }, error: state.rpcError };
    },
  };
  const route = load("app/api/interviews/groups/route.ts", {
    "@/utils/supabase/server": { createClient: async () => supabase },
  });
  const get = query => route.GET(new Request(`https://example.test/api/interviews/groups${query}`));
  const post = (body, headers = {}) => route.POST(new Request("https://example.test/api/interviews/groups", {
    method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body),
  }));
  return { state, get, post, route };
}

test("group reads and writes require a signed-in account", async () => {
  const api = harness({ signedIn: false });
  assert.equal((await api.get("")).status, 401);
  assert.equal((await api.post({ action: "create", name: "Study circle" })).status, 401);
  assert.deepEqual(api.state.calls, []);
});

test("group requests validate IDs, origin, actions and byte limits before the RPC", async () => {
  const api = harness();
  assert.equal((await api.get("?groupId=bad")).status, 400);
  assert.equal((await api.get(`?roomId=${roomId}`)).status, 400);
  assert.equal((await api.post({ action: "unknown" })).status, 400);
  assert.equal((await api.post({ action: "remove", groupId, userId: "bad" })).status, 400);
  assert.equal((await api.post({ action: "create", name: "Study circle" }, { Origin: "https://another.test" })).status, 403);
  assert.equal((await api.post({ action: "create", name: "a".repeat(33_000) })).status, 413);
  assert.equal((await api.route.POST(new Request("https://example.test/api/interviews/groups", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }))).status, 400);
  assert.equal((await api.route.POST(new Request("https://example.test/api/interviews/groups", {
    method: "POST", headers: { "Content-Type": "text/plain" }, body: "hello" }))).status, 415);
  assert.deepEqual(api.state.calls, []);
  assert.equal((await api.get("")).status, 200);
  assert.equal((await api.get(`?groupId=${groupId}&roomId=${roomId}`)).status, 200);
  assert.equal((await api.post({ action: "create", name: "Study circle" })).status, 200);
  assert.deepEqual(api.state.calls.map(({ args }) => args.p_action), ["list", "details", "create"]);
  assert.deepEqual(api.state.calls[1].args, { p_action: "details", p_group_id: groupId, p_payload: { roomId } });
});

test("group errors expose expected validation but hide unexpected database details", async () => {
  const api = harness();
  api.state.rpcError = { code: "P0001", message: "This group already has 12 members." };
  const full = await api.post({ action: "join", code: "a".repeat(32) });
  assert.equal(full.status, 400);
  assert.match((await full.json()).error, /12 members/);
  api.state.rpcError = { code: "42501", message: "private role detail" };
  const denied = await api.get(`?groupId=${groupId}`);
  assert.equal(denied.status, 403);
  assert.doesNotMatch((await denied.json()).error, /private role detail/);
  api.state.rpcError = { code: "XX000", message: "private database diagnostic" };
  const failed = await api.get("");
  assert.equal(failed.status, 500);
  assert.doesNotMatch((await failed.json()).error, /private database diagnostic/);
});
