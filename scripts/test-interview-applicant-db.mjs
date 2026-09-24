import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("applicant and daily-activity migration preserves history, isolates accounts and counts London days", async () => {
  const db = new PGlite();
  const owner = randomUUID();
  const other = randomUUID();
  const sql = (name) => readFile(new URL(`../supabase/${name}.sql`, import.meta.url), "utf8");
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; grant usage on schema auth to authenticated,anon;
      create table auth.users(id uuid primary key,raw_user_meta_data jsonb not null default '{}');
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
      $$; grant execute on function auth.uid() to authenticated,anon;`);
    // PGlite has built-in gen_random_uuid; it does not ship pgcrypto's extension manifest.
    for (const name of ["medicforest_interview_platform", "medicforest_interview_question_progress", "medicforest_interview_dashboard"]) await db.exec((await sql(name)).replace('create extension if not exists "pgcrypto";', ""));
    for (const id of [owner, other]) await db.query("insert into auth.users(id) values($1)", [id]);
    await db.query("insert into interview_preparation_profiles(user_id,experience,targets) values($1,'starting',$2::jsonb)", [owner, JSON.stringify([{ universitySlug: "manchester", interviewDate: "2026-12-10" }])]);
    await db.query("insert into interview_question_progress(user_id,question_id,status,completed_at) values($1,'first','completed','2026-09-01T23:30:00Z')", [owner]);
    const migration = await sql("medicforest_interview_applicant_activity");
    await db.exec(migration);
    await db.exec(migration);
    const profile = (await db.query("select targets,applicant from interview_preparation_profiles where user_id=$1", [owner])).rows[0];
    assert.deepEqual(profile.applicant, {});
    assert.equal(profile.targets[0].interviewDate, "2026-12-10");
    assert.equal((await db.query("select practice_date::text as date from interview_daily_questions")).rows[0].date, "2026-09-02");
    await db.query("update interview_question_progress set answer='saved again' where user_id=$1", [owner]);
    assert.equal((await db.query("select * from interview_daily_questions")).rows.length, 1);
    await db.query("update interview_question_progress set completed_at='2026-09-02T23:30:00Z' where user_id=$1", [owner]);
    assert.equal((await db.query("select * from interview_daily_questions")).rows.length, 2);
    await db.query("insert into interview_question_progress(user_id,question_id,status,completed_at) values($1,'today','completed',now()),($2,'private','completed',now())", [owner, other]);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [owner]);
    await db.exec("set role authenticated");
    const visible = (await db.query("select user_id from interview_daily_questions")).rows;
    assert.ok(visible.length > 0 && visible.every((row) => row.user_id === owner));
    const activity = (await db.query("select * from interview_daily_activity()")).rows;
    assert.ok(activity.length > 0);
    await assert.rejects(db.query("insert into interview_daily_questions values($1,'fake',current_date)", [owner]), /permission denied/);
    await assert.rejects(db.query("update interview_preparation_profiles set applicant='{}'"), /permission denied/);
    await db.exec("reset role; set role anon");
    await assert.rejects(db.query("select * from interview_daily_questions"), /permission denied/);
    await db.exec("reset role");
  } finally { await db.close(); }
});
