// Real PostgreSQL migrations, isolated in memory. Does not use a Supabase
// account, network connection, project credentials, or an AI provider.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const { PGlite } = createRequire(import.meta.url)("@electric-sql/pglite");
const db = new PGlite();
const owner = randomUUID();
const friend = randomUUID();
const newcomer = randomUUID();
const claimant = randomUUID();
const legacyUser = randomUUID();
const transcript = "I want to study medicine because combining scientific reasoning with compassionate patient support interests me. During volunteering I learned to listen carefully and reflect on how people experience care.";
let checks = 0;

async function check(name, run) {
  await run(); checks += 1; console.log(`PASS ${name}`);
}

async function role(name, user, run) {
  assert.ok(["authenticated", "anon", "service_role"].includes(name));
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user || ""]);
  await db.exec(`set role ${name}`);
  try { return await run(); } finally { await db.exec("reset role"); }
}

async function totals(user) {
  return role("authenticated", user, async () => (await db.query("select public.interview_dashboard_totals() as value")).rows[0].value);
}

async function seedAttempt(user, values = {}) {
  const id = randomUUID();
  await db.query(`insert into public.interview_attempts(
    id,user_id,mode,station_slug,title,status,circuit_id,preparation_seconds,station_seconds,break_seconds,
    questions,answers,score,started_at,completed_at,answer_submitted_at,rubric_version)
    values($1,$2,$3,$4,'Interview practice',$5,$6,$7,$8,0,'["Why medicine?"]',$9::jsonb,$10,$11,$12,$13,$14)`, [
    id, user, values.mode || "free", values.stationSlug || "why-medicine", values.status || "completed", randomUUID(),
    values.preparationSeconds ?? 60, values.stationSeconds ?? 480,
    JSON.stringify([{ question: "Why medicine?", answer: transcript }]), values.score ?? null,
    values.startedAt || "2026-01-01T10:00:00Z", values.completedAt === undefined ? "2026-01-01T10:40:00Z" : values.completedAt,
    values.submittedAt ?? null, values.rubric || "why-medicine-v1",
  ]);
  return id;
}

try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; grant usage on schema auth to authenticated,anon;
    create table auth.users(id uuid primary key,raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
    $$; grant execute on function auth.uid() to authenticated,anon;`);
  const platformSql = await readFile(new URL("../supabase/phloemai_interview_platform.sql", import.meta.url), "utf8");
  const dashboardSql = await readFile(new URL("../supabase/phloemai_interview_dashboard.sql", import.meta.url), "utf8");
  await db.exec(platformSql);
  for (const id of [owner, friend, newcomer, claimant, legacyUser]) await db.query("insert into auth.users(id) values($1)", [id]);
  const beforeMigration = randomUUID();
  await db.query(`insert into public.interview_attempts(id,user_id,mode,station_slug,title,status,circuit_id,
    preparation_seconds,station_seconds,break_seconds,questions,score,started_at,completed_at)
    values($1,$2,'free','why-medicine','Existing interview','completed',$3,60,480,0,'[]',75,
      '2026-01-01T10:00:00Z','2026-01-01T10:03:00Z')`, [beforeMigration, legacyUser, randomUUID()]);
  await check("dashboard migration is additive and can be rerun", async () => {
    await db.exec(dashboardSql); await db.exec(dashboardSql);
    const row = (await db.query("select title,score,answer_submitted_at from public.interview_attempts where id=$1", [beforeMigration])).rows[0];
    assert.equal(row.title, "Existing interview"); assert.equal(Number(row.score), 75); assert.equal(row.answer_submitted_at, null);
  });

  const initialTargets = [{ universitySlug: "oxford", interviewDate: "2026-12-10" }, { universitySlug: "aberdeen", interviewDate: null }];
  await role("service_role", null, async () => {
    await db.query(`insert into public.interview_preparation_profiles(user_id,experience,focus_themes,weekly_target,targets)
      values($1,'practising',array['motivation','ethics'],4,$2::jsonb),($3,'starting','{}',2,'[]')`, [owner, JSON.stringify(initialTargets), friend]);
    await db.query(`insert into public.interview_dashboard_tasks(user_id,task_id,date) values
      ($1,'2026-09-06:station:why-medicine','2026-09-06'),($2,'2026-09-06:guide:ethics','2026-09-06')`, [owner, friend]);
  });

  await check("preparation preferences and task completion are readable only by their owner", async () => {
    await role("authenticated", owner, async () => {
      const profiles = await db.query("select user_id,experience,weekly_target,targets from public.interview_preparation_profiles");
      assert.deepEqual(profiles.rows, [{ user_id: owner, experience: "practising", weekly_target: 4, targets: initialTargets }]);
      const tasks = await db.query("select user_id,task_id from public.interview_dashboard_tasks");
      assert.deepEqual(tasks.rows, [{ user_id: owner, task_id: "2026-09-06:station:why-medicine" }]);
      assert.equal((await db.query("select user_id from public.interview_preparation_profiles where user_id=$1", [friend])).rows.length, 0);
      assert.equal((await db.query("select user_id from public.interview_dashboard_tasks where user_id=$1", [friend])).rows.length, 0);
    });
  });
  await check("authenticated clients cannot directly create, change or delete plans and tasks", async () => {
    await role("authenticated", owner, async () => {
      await assert.rejects(db.query("update public.interview_preparation_profiles set weekly_target=14"), /permission denied/);
      await assert.rejects(db.query("delete from public.interview_preparation_profiles"), /permission denied/);
      await assert.rejects(db.query("insert into public.interview_preparation_profiles(user_id,experience) values($1,'starting')", [newcomer]), /permission denied/);
      await assert.rejects(db.query("update public.interview_dashboard_tasks set date='2026-10-01'"), /permission denied/);
      await assert.rejects(db.query("delete from public.interview_dashboard_tasks"), /permission denied/);
      await assert.rejects(db.query("insert into public.interview_dashboard_tasks(user_id,task_id,date) values($1,'spoofed','2026-09-06')", [owner]), /permission denied/);
      await assert.rejects(db.query("update public.interview_attempts set answer_submitted_at=now()"), /permission denied/);
    });
  });
  await check("anonymous roles cannot read plans, tasks or aggregate statistics", async () => {
    await role("anon", null, async () => {
      await assert.rejects(db.query("select * from public.interview_preparation_profiles"), /permission denied/);
      await assert.rejects(db.query("select * from public.interview_dashboard_tasks"), /permission denied/);
      await assert.rejects(db.query("select public.interview_dashboard_totals()"), /permission denied/);
    });
  });
  await check("database bounds experience, focus themes, target count and weekly goals", async () => {
    await role("service_role", null, async () => {
      for (const value of [0, 15]) await assert.rejects(db.query("update public.interview_preparation_profiles set weekly_target=$1 where user_id=$2", [value, owner]), /check constraint/);
      await assert.rejects(db.query("update public.interview_preparation_profiles set experience='expert' where user_id=$1", [owner]), /check constraint/);
      await assert.rejects(db.query("update public.interview_preparation_profiles set focus_themes=array['motivation','ethics','teamwork','nhs'] where user_id=$1", [owner]), /check constraint/);
      await assert.rejects(db.query("update public.interview_preparation_profiles set focus_themes=array['unknown'] where user_id=$1", [owner]), /check constraint/);
      await assert.rejects(db.query("update public.interview_preparation_profiles set targets='{}' where user_id=$1", [owner]), /check constraint|non-array/);
      await assert.rejects(db.query("update public.interview_preparation_profiles set targets=$1::jsonb where user_id=$2", [JSON.stringify(Array.from({ length: 11 }, () => initialTargets[0])), owner]), /check constraint/);
      await db.query("update public.interview_preparation_profiles set weekly_target=1 where user_id=$1", [owner]);
      await db.query("update public.interview_preparation_profiles set weekly_target=14 where user_id=$1", [owner]);
    });
  });
  await check("service writes can explicitly clear dates, remove targets and undo tasks", async () => {
    const editedTargets = [{ universitySlug: "oxford", interviewDate: null }];
    await role("service_role", null, async () => {
      await db.query("update public.interview_preparation_profiles set targets=$1::jsonb where user_id=$2", [JSON.stringify(editedTargets), owner]);
      await db.query("delete from public.interview_dashboard_tasks where user_id=$1 and task_id=$2", [owner, "2026-09-06:station:why-medicine"]);
    });
    await role("authenticated", owner, async () => {
      assert.deepEqual((await db.query("select targets from public.interview_preparation_profiles")).rows[0].targets, editedTargets);
      assert.equal((await db.query("select * from public.interview_dashboard_tasks")).rows.length, 0);
    });
  });

  let submittedAt;
  const gradingId = await seedAttempt(claimant, { status: "in_progress", completedAt: null, startedAt: new Date(Date.now() - 180_000).toISOString() });
  await check("the first locked feedback claim captures a submission timestamp", async () => {
    const before = Date.now();
    const claimed = await role("service_role", null, async () => (await db.query(
      "select to_jsonb(public.claim_interview_grading($1,$2,$3)) as value", [claimant, gradingId, randomUUID()],
    )).rows[0].value);
    submittedAt = claimed.answer_submitted_at;
    assert.ok(submittedAt);
    assert.ok(Math.abs(Date.parse(submittedAt) - before) < 5000);
    assert.equal(claimed.grading_tries, 1);
  });
  await check("submission time survives failure, retries and later completion", async () => {
    await db.query("update public.interview_attempts set status='failed',grading_started_at=now()-interval '2 minutes',answer_submitted_at=now()+interval '2 hours' where id=$1", [gradingId]);
    const retry = await role("service_role", null, async () => (await db.query(
      "select to_jsonb(public.claim_interview_grading($1,$2,$3)) as value", [claimant, gradingId, randomUUID()],
    )).rows[0].value);
    assert.equal(retry.answer_submitted_at, submittedAt); assert.equal(retry.grading_tries, 2);
    await db.query("update public.interview_attempts set status='completed',score=83,completed_at=now()+interval '1 day' where id=$1", [gradingId]);
    const row = (await db.query("select answer_submitted_at from public.interview_attempts where id=$1", [gradingId])).rows[0];
    assert.equal(new Date(row.answer_submitted_at).getTime(), Date.parse(submittedAt));
    const total = await totals(claimant);
    assert.ok(total.practiceSeconds >= 119 && total.practiceSeconds <= 125);
    assert.equal(total.practiceTimeEstimated, false);
  });

  await seedAttempt(owner, { score: 90, submittedAt: "2026-01-01T10:04:00Z" }); // 180s after prep.
  await seedAttempt(owner, { score: 70, submittedAt: "2026-01-01T10:20:00Z" }); // Capped to 480s.
  await seedAttempt(owner, { score: 80, submittedAt: "2026-01-01T10:00:30Z" }); // Before prep ends: 0s.
  await seedAttempt(owner, { score: 50, completedAt: "2026-01-01T10:12:00Z" }); // Legacy, capped to 480s.
  await seedAttempt(owner, { score: 60, completedAt: "2026-01-01T10:02:00Z" }); // Legacy, 60s after prep.
  await seedAttempt(owner, { score: 99, status: "failed" });
  await seedAttempt(owner, { status: "in_progress", completedAt: null });
  await seedAttempt(friend, { score: 99, submittedAt: "2026-01-01T10:05:00Z" });
  await check("lifetime totals exclude preparation and AI wait time and cap at station duration", async () => {
    const actual = await totals(owner);
    assert.deepEqual(actual, {
      attemptCount: 7, completedCount: 5, scoredCount: 5, averageScore: 70,
      bestFreeScore: 90, practiceSeconds: 1200, practiceTimeEstimated: true,
    });
  });
  await check("aggregate totals are scoped to the caller and disclose no attempt data", async () => {
    const result = await totals(friend);
    assert.equal(result.attemptCount, 1); assert.equal(result.bestFreeScore, 99); assert.equal(result.practiceSeconds, 240);
    assert.equal(result.practiceTimeEstimated, false);
    assert.equal(JSON.stringify(result).includes(transcript), false);
    assert.equal(JSON.stringify(result).includes(owner), false);
    assert.deepEqual(Object.keys(result).sort(), ["attemptCount", "averageScore", "bestFreeScore", "completedCount", "practiceSeconds", "practiceTimeEstimated", "scoredCount"]);
  });
  await check("empty accounts get honest zero totals and null scores", async () => {
    const result = await totals(newcomer);
    assert.deepEqual(result, { attemptCount: 0, completedCount: 0, scoredCount: 0, averageScore: null, bestFreeScore: null, practiceSeconds: 0, practiceTimeEstimated: false });
  });
  await check("pre-migration results keep their duration labelled as an estimate", async () => {
    const result = await totals(legacyUser);
    assert.equal(result.practiceSeconds, 120); assert.equal(result.practiceTimeEstimated, true); assert.equal(result.completedCount, 1);
  });
  await check("deleting an account cascades its preparation and task records", async () => {
    await db.query("delete from auth.users where id=$1", [friend]);
    assert.equal((await db.query("select * from public.interview_preparation_profiles where user_id=$1", [friend])).rows.length, 0);
    assert.equal((await db.query("select * from public.interview_dashboard_tasks where user_id=$1", [friend])).rows.length, 0);
  });
  console.log(`\n${checks} dashboard PostgreSQL checks passed. No provider calls were made.`);
} finally {
  await db.close();
}
