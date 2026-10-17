import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sql = readFileSync(resolve(root, "supabase/medicforest_interview_ai_capacity.sql"), "utf8");

function instance(rpc) {
  const cache = new Map();
  function load(file) {
    const path = resolve(root, file);
    if (cache.has(path)) return cache.get(path);
    const mod = { exports: {} };
    cache.set(path, mod.exports);
    const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    new Function("require", "module", "exports", code)(name => {
      if (name === "server-only") return {};
      if (name === "@/utils/supabase/admin") return { createAdminClient: () => ({ rpc: (name, args) => ({ abortSignal: () => rpc(name, args) }) }) };
      if (name.startsWith(".")) return load(resolve(dirname(path), `${name}.ts`));
      return require(name);
    }, mod, mod.exports);
    return mod.exports;
  }
  return load("utils/interviews/provider-capacity.ts");
}

test("shared AI capacity bounds independent instances and recovers safely", async () => {
  const previous = process.env.INTERVIEW_AI_SHARED_LIMITS;
  process.env.INTERVIEW_AI_SHARED_LIMITS = "true";
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
    await db.exec(sql); await db.exec(sql);
    await db.exec("update interview_ai_capacity_config set max_concurrent=7, requests_per_minute=12");
    const calls = [];
    const rpc = async (name, args) => {
      assert.ok(["acquire_interview_ai_capacity", "release_interview_ai_capacity", "pause_interview_ai_capacity"].includes(name));
      calls.push(name);
      const result = await db.query(`select public.${name}($1) as value`, [args.p_token ?? args.p_seconds]);
      return { data: result.rows[0].value, error: null };
    };
    const servers = Array.from({ length: 10 }, () => instance(rpc));
    let active = 0, peak = 0, started = 0, release;
    const blocked = new Promise(resolve => { release = resolve; });
    const burst = Array.from({ length: 200 }, (_, index) => servers[index % servers.length].withInterviewProviderCapacity(async () => {
      started++; active++; peak = Math.max(peak, active);
      await blocked; active--;
    }).then(() => "admitted", error => error.name));
    // Drain all admission RPCs while admitted work remains blocked.
    await db.query("select 1");
    assert.equal(started, 7); assert.equal(peak, 7);
    release();
    const outcomes = await Promise.all(burst);
    assert.equal(outcomes.filter(value => value === "admitted").length, 7);
    assert.equal(outcomes.filter(value => value === "InterviewAiBusyError").length, 193);
    assert.equal((await db.query("select count(*)::int n from interview_ai_capacity_leases where not released")).rows[0].n, 0);

    // Feedback's nested provider call must reuse its lease, not double charge it.
    const before = calls.filter(name => name === "acquire_interview_ai_capacity").length;
    await servers[0].withInterviewProviderCapacity(() => servers[0].withInterviewProviderCapacity(async () => 42));
    assert.equal(calls.filter(name => name === "acquire_interview_ai_capacity").length, before + 1);
    for (let i = 0; i < 4; i++) await servers[0].withInterviewProviderCapacity(async () => {});
    await assert.rejects(servers[1].withInterviewProviderCapacity(async () => assert.fail("RPM overflow")), { name: "InterviewAiBusyError" });

    // Expired leases and old rolling-window entries are reclaimed without a cron.
    await db.exec("update interview_ai_capacity_leases set released=false, started_at=now()-interval '3 minutes', expires_at=now()-interval '1 minute'");
    await servers[0].withInterviewProviderCapacity(async () => {});
    assert.equal((await db.query("select count(*)::int n from interview_ai_capacity_leases")).rows[0].n, 1);

    // Provider throttling on one process stops another, including Retry-After >60s.
    await servers[0].recordInterviewProviderFailure(429, "120");
    await assert.rejects(servers[1].withInterviewProviderCapacity(async () => assert.fail("shared cooldown bypass")), error => error.retryAfter > 60);
    await db.exec("update interview_ai_capacity_config set paused_until=now()-interval '1 second'");
    await servers[1].withInterviewProviderCapacity(async () => {});

    // Even a thrown provider error returns capacity; releases do not erase RPM use.
    await assert.rejects(servers[1].withInterviewProviderCapacity(async () => { throw new Error("provider failed"); }), /provider failed/);
    assert.equal((await db.query("select count(*)::int n from interview_ai_capacity_leases where not released")).rows[0].n, 0);

    const token = randomUUID();
    assert.equal((await rpc("acquire_interview_ai_capacity", { p_token: token })).data.admitted, true);
    await rpc("release_interview_ai_capacity", { p_token: token });
    assert.equal((await rpc("acquire_interview_ai_capacity", { p_token: token })).data.admitted, false);

    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      try {
        await assert.rejects(db.query("select public.acquire_interview_ai_capacity($1)", [randomUUID()]), /permission denied/);
        await assert.rejects(db.query("select public.release_interview_ai_capacity($1)", [token]), /permission denied/);
        await assert.rejects(db.query("select public.pause_interview_ai_capacity(15)"), /permission denied/);
        await assert.rejects(db.query("select * from public.interview_ai_capacity_config"), /permission denied/);
      } finally { await db.exec("reset role"); }
    }
    await db.exec("set role service_role");
    assert.equal((await rpc("acquire_interview_ai_capacity", { p_token: randomUUID() })).data.admitted, true);
    await db.exec("reset role");
  } finally {
    await db.close();
    if (previous === undefined) delete process.env.INTERVIEW_AI_SHARED_LIMITS; else process.env.INTERVIEW_AI_SHARED_LIMITS = previous;
  }
});

test("capacity storage failure fails closed; release failure preserves the successful result", async () => {
  const previous = process.env.INTERVIEW_AI_SHARED_LIMITS;
  process.env.INTERVIEW_AI_SHARED_LIMITS = "true";
  try {
    const unavailable = instance(async () => ({ data: null, error: { code: "PGRST202" } }));
    await assert.rejects(unavailable.withInterviewProviderCapacity(async () => assert.fail("no unprotected AI call")), { name: "InterviewAiBusyError" });
    const releaseFailure = instance(async name => name === "acquire_interview_ai_capacity"
      ? { data: { admitted: true }, error: null } : { data: null, error: { code: "timeout" } });
    assert.equal(await releaseFailure.withInterviewProviderCapacity(async () => "saved report"), "saved report");
  } finally {
    if (previous === undefined) delete process.env.INTERVIEW_AI_SHARED_LIMITS; else process.env.INTERVIEW_AI_SHARED_LIMITS = previous;
  }
});
