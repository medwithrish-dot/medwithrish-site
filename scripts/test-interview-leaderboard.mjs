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

function harness({ signedIn = false, score = 91 } = {}) {
  const state = {
    userId: signedIn ? owner : null, authThrows: false, anonymousCalls: 0, signedInCalls: 0, reads: [], scoreFilter: null, writes: [], readError: null, writeError: null,
    rpcErrorCode: null, attemptPages: [], publicPreferences: [], adminReads: [], fallbackError: null,
  };
  const rows = [{ rank: 1, display_name: "f.u.c.k", score, completed_at: "2026-09-01T12:00:00Z", is_you: null, email: "private@example.test", user_id: "private-id" }];
  const result = () => ({ data: rows, error: state.rpcErrorCode ? { code: state.rpcErrorCode, message: "Missing RPC" } : state.readError && { code: "XX000", message: state.readError } });
  const query = table => {
    state.reads.push(table);
    const chain = {
      select: () => chain, eq: () => chain, order: () => chain, limit: () => chain,
      or: filter => { assert.equal(filter, "mode.eq.free,and(mode.eq.station,station_seconds.eq.180)"); return chain; },
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
      const chain = {
        select: fields => { state.adminReads.push([table, fields]); return chain; },
        eq: (field, value) => { if (field === "rubric_version") assert.equal(value, "why-medicine-v2"); if (field === "leaderboard_opt_in") assert.equal(value, true); return chain; },
        not: () => chain, order: () => chain,
        or: filter => { assert.equal(filter, "mode.eq.free,and(mode.eq.station,station_seconds.eq.180)"); return chain; },
        range: async start => ({ data: state.attemptPages[start / 200] ?? [], error: state.fallbackError }),
        in: async (_field, users) => ({ data: state.publicPreferences.filter(row => row.leaderboard_opt_in && users.includes(row.user_id)), error: state.fallbackError }),
        upsert: async value => { state.writes.push(value); return { error: state.writeError && { code: "XX000", message: state.writeError } }; },
      };
      return chain;
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
  assert.doesNotMatch(JSON.stringify(data), /private@example|private-id|user_id/);
  assert.deepEqual(data.entries.map(({ display_name, is_you }) => [display_name, is_you]), [["Medwithrish", false], ["Candidate", false]]);
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

test("Medwithrish's 96% benchmark ranks by score and does not displace earlier ties", async () => {
  for (const score of [99, 96, 80]) {
    const api = harness({ score });
    const { entries } = await (await api.route.GET()).json();
    assert.equal(entries.length, 2);
    assert.deepEqual(entries.map(row => row.rank), [1, 2]);
    assert.ok(entries[0].score >= entries[1].score);
    assert.equal(entries[score >= 96 ? 1 : 0].display_name, "Medwithrish");
    const benchmark = entries.find(row => row.is_benchmark);
    assert.equal(benchmark.score, 96);
    assert.equal(benchmark.completed_at, null);
    assert.equal(benchmark.is_you, false);
  }
});

test("missing retry-aware RPC includes challenge retries, uses current scores only, honours opt-in and strips private identifiers", async () => {
  const api = harness({ signedIn: true });
  api.state.rpcErrorCode = "PGRST202";
  const completed_at = "2026-10-08T09:00:00Z";
  api.state.attemptPages = [[
    { user_id: "private-user", score: 99, completed_at },
    { user_id: owner, score: 90, completed_at },
    { user_id: owner, score: 89, completed_at },
    { user_id: "other", score: 80, completed_at },
  ]];
  api.state.publicPreferences = [
    { user_id: "private-user", display_name: "Hidden", leaderboard_opt_in: false },
    { user_id: owner, display_name: "Rish", leaderboard_opt_in: true },
    { user_id: "other", display_name: "Student", leaderboard_opt_in: true },
  ];
  const response = await api.route.GET();
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.entries.map(row => [row.rank, row.display_name, row.score, row.is_you]), [[1, "Medwithrish", 96, false], [2, "Rish", 90, true], [3, "Student", 80, false]]);
  assert.doesNotMatch(JSON.stringify(data.entries), /user_id|private-user|Hidden/);
  assert.deepEqual(api.state.adminReads, [["interview_attempts", "user_id,score,completed_at"], ["interview_preferences", "user_id,display_name"]]);
});

test("compatibility paginates duplicate attempts and returns an honest empty board", async () => {
  const api = harness();
  api.state.rpcErrorCode = "42883";
  assert.deepEqual((await (await api.route.GET()).json()).entries.map(row => [row.display_name, row.score, row.is_benchmark]), [["Medwithrish", 96, true]]);
  api.state.attemptPages = [Array.from({ length: 200 }, () => ({ user_id: owner, score: 90, completed_at: "2026-10-08T09:00:00Z" })), [{ user_id: "other", score: 80, completed_at: "2026-10-08T10:00:00Z" }]];
  api.state.publicPreferences = [{ user_id: owner, display_name: "Rish", leaderboard_opt_in: true }, { user_id: "other", display_name: "Student", leaderboard_opt_in: true }];
  const data = await (await api.route.GET()).json();
  assert.equal(data.entries.length, 3);
  assert.equal(data.entries[2].rank, 3);
  api.state.fallbackError = { code: "XX000", message: "Private database detail" };
  const failed = await api.route.GET();
  assert.equal(failed.status, 503);
  assert.doesNotMatch(JSON.stringify(await failed.json()), /Private database/);
});

test("compatibility limits the board to 100 people and bounds database work", async () => {
  const api = harness();
  api.state.rpcErrorCode = "PGRST202";
  const page = Array.from({ length: 200 }, (_, index) => ({ user_id: `candidate-${index}`, score: 99 - index / 10, completed_at: "2026-10-08T09:00:00Z" }));
  api.state.attemptPages = [page];
  api.state.publicPreferences = page.map(row => ({ user_id: row.user_id, display_name: "Student", leaderboard_opt_in: true }));
  const response = await api.route.GET();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).entries.length, 100);
  api.state.publicPreferences = [];
  api.state.attemptPages = Array.from({ length: 10 }, () => page);
  api.state.adminReads = [];
  const capped = await api.route.GET();
  assert.equal(capped.status, 503);
  assert.equal(api.state.adminReads.filter(([table]) => table === "interview_attempts").length, 10);
});

test("signed-in members see their own preference and save only their own validated name", async () => {
  const api = harness({ signedIn: true });
  const data = await (await api.route.GET()).json();
  assert.equal(data.entries[0].is_benchmark, true);
  assert.equal(data.entries[1].is_you, true);
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

test("free challenge links recover the lifetime attempt and preserve Premium retries", async () => {
  for (const premium of [false, true]) for (const status of ["completed", "failed", "grading", "in_progress"]) {
    let reads = 0;
    const query = {
      select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
      maybeSingle: async () => { reads++; return { data: { id: "saved-answer", status }, error: null }; },
    };
    const service = load("utils/interviews/challenge-access.ts", {
      "@/utils/medicforest/premium-access": { getMedicForestEntitlements: async () => ({ userId: owner, isPremium: premium }) },
      "@/utils/supabase/server": { createClient: async () => ({ from: () => query }) },
      "./server": { databaseError: error => { throw error; } },
    });
    assert.equal(await service.freeChallengeDestination(), premium ? null : status === "in_progress"
      ? "/medicforest/interview/ai-interviews?attempt=saved-answer" : "/medicforest/interview/reports/saved-answer");
    assert.equal(reads, premium ? 0 : 1);
  }
});

async function leaderboardView({ failed = false, boardData = { entries: [], preference: null, bestScore: null }, challengeDestination = null } = {}) {
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
  const requests = [];
  new Function("require", "module", "exports", "fetch", output)(name => {
    if (name === "@/utils/medicforest/feature-access") return { requestFeatureAccess: () => true };
      if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name === "@/app/medicforest/_components/MedicForestLink") return { __esModule: true, default: "link" };
    if (name === "lucide-react") return new Proxy({}, { get: () => "icon" });
    if (name === "@/utils/interviews/public-name") return { publicNameError: () => null };
    throw new Error(`Unexpected leaderboard dependency: ${name}`);
  }, loaded, loaded.exports, async (url, options = {}) => {
    requests.push({ url, ...options });
    return failed ? Response.json({ error: "Please retry." }, { status: 503 }) : Response.json(boardData);
  });
  const render = () => {
    cursor = 0;
    const tree = loaded.exports.InterviewLeaderboard({ challengeDestination });
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
  return { tree: render(), render, find, requests };
}

function viewText(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(viewText).join(" ");
  return node && typeof node === "object" ? viewText(node.props?.children) : "";
}

for (const failed of [false, true]) test(failed ? "a failed personal-score load keeps the paused notice and benchmark available" : "the guest leaderboard shows a sign-in action instead of editable preferences", async () => {
  const { tree: guest, find } = await leaderboardView({ failed });
  assert.match(viewText(guest), /Public rankings are temporarily paused/);
  assert.match(viewText(guest), /The challenge is still open/);
  assert.match(viewText(guest), /Your benchmark to beat/);
  assert.equal(find(guest, node => node.type === "table"), undefined);
  if (failed) {
    assert.ok(find(guest, node => node.props?.role === "alert"));
    assert.doesNotMatch(viewText(guest), /A fresh start for everyone/);
    return;
  }
  assert.ok(find(guest, node => node.type === "link" && node.props?.href === "/medicforest/account"));
  assert.equal(find(guest, node => node.type === "input" && node.props?.id === "leaderboard-name"), undefined);
});

for (const signedIn of [false, true]) test(`paused rankings hide participant entries for ${signedIn ? "members" : "guests"} while keeping challenge access`, async () => {
  const { tree, find } = await leaderboardView({ boardData: {
    entries: [
      { rank: 1, display_name: "Participant Alice", score: 97.5, is_you: false },
      { rank: 2, display_name: "Medwithrish", score: 96, is_benchmark: true },
      { rank: 3, display_name: "Participant Bob", score: 89, is_you: signedIn },
    ],
    preference: signedIn ? { display_name: "My nickname", leaderboard_opt_in: true } : null,
    bestScore: signedIn ? 89 : null,
  } });
  const text = viewText(tree);
  assert.doesNotMatch(text, /Participant Alice|Participant Bob|97\.5%|A fresh start for everyone/);
  assert.match(text, /Medwithrish/);
  assert.match(text, /96%/);
  assert.match(text, /Your scores are still saved as usual/);
  assert.equal(find(tree, node => node.type === "table"), undefined);
  assert.ok(find(tree, node => node.type === "link" && node.props?.href === "/medicforest/interview/ai-interviews?station=why-medicine"));
  if (signedIn) {
    assert.match(text, /89%/);
    assert.match(text, /Show my best score when the leaderboard reopens/);
    assert.equal(find(tree, node => node.type === "input" && node.props?.type === "checkbox").props.checked, true);
  }
});

test("sharing preferences still save through the existing API while rankings are paused", async () => {
  const view = await leaderboardView({ boardData: {
    entries: [], preference: { display_name: "My nickname", leaderboard_opt_in: false }, bestScore: 89,
  } });
  view.find(view.tree, node => node.props?.id === "leaderboard-name").props.onChange({ target: { value: "Future nickname" } });
  let tree = view.render();
  view.find(tree, node => node.type === "input" && node.props?.type === "checkbox").props.onChange({ target: { checked: true } });
  tree = view.render();
  await view.find(tree, node => node.type === "button" && viewText(node).trim() === "Save preferences").props.onClick();
  await new Promise(resolve => setImmediate(resolve));
  const request = view.requests.find(item => item.method === "PATCH");
  assert.equal(request.url, "/api/interviews/leaderboard");
  assert.deepEqual(JSON.parse(request.body), { displayName: "Future nickname", optIn: true });
  assert.match(viewText(view.render()), /Preferences saved/);
});

test("paused rankings retain the saved challenge review link", async () => {
  const destination = "/medicforest/interview/reports/saved-attempt";
  const { tree, find } = await leaderboardView({ challengeDestination: destination });
  assert.ok(find(tree, node => node.type === "link" && node.props?.href === destination && viewText(node).includes("Review your answer")));
});
