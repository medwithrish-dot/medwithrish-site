import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("standalone account setup protects plans and credits and reruns preserve used credits", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role authenticated;
      create role anon;
      create schema auth;
      grant usage on schema auth to authenticated;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$
        select '11111111-1111-4111-8111-111111111111'::uuid
      $$;
    `);
    // PGlite provides gen_random_uuid in core; the pgcrypto extension is unnecessary here.
    const readSql = async (file) => (await readFile(new URL(`../supabase/${file}`, import.meta.url), "utf8"))
      .replace(/create extension if not exists "pgcrypto";/g, "");
    const base = await readSql("medicforest_setup.sql");
    const practice = await readSql("medicforest_practice_setup.sql");
    await db.exec(base);
    await db.exec("insert into auth.users(id,email) values ('11111111-1111-4111-8111-111111111111','student@example.test')");
    await db.exec("insert into auth.users(id,email) values ('22222222-2222-4222-8222-222222222222','other@example.test')");
    await db.exec("set role authenticated");
    const ownProfiles = (await db.query("select id,email from public.profiles")).rows;
    assert.equal(ownProfiles.length, 1);
    assert.equal(ownProfiles[0].email, "student@example.test");
    assert.equal((await db.query("select email from public.profiles where id='22222222-2222-4222-8222-222222222222'")).rows.length, 0);
    assert.equal((await db.query("update public.profiles set full_name='Intruder' where id='22222222-2222-4222-8222-222222222222' returning id")).rows.length, 0);
    await assert.rejects(db.query("select * from auth.users"), /permission denied/);
    await db.exec("update public.profiles set full_name='Student'");
    await assert.rejects(db.exec("update public.profiles set current_plan='premium'"), /permission denied/);
    await assert.rejects(db.exec("update public.profiles set diagnostic_credits=100"), /permission denied/);
    await assert.rejects(db.exec("delete from public.profiles"), /permission denied/);
    await assert.rejects(db.exec("insert into public.profiles(id,current_plan) values ('11111111-1111-4111-8111-111111111111','premium')"), /permission denied/);
    await db.exec("reset role");
    await db.exec("set role anon");
    await assert.rejects(db.query("select email from public.profiles"), /permission denied/);
    await assert.rejects(db.query("select * from auth.users"), /permission denied/);
    await db.exec("reset role");
    await db.exec("update public.profiles set diagnostic_credits=0");
    await db.exec(practice); await db.exec(base); await db.exec(practice);
    assert.equal((await db.query("select diagnostic_credits from public.profiles")).rows[0].diagnostic_credits, 0);
  } finally {
    await db.close();
  }
});

test("complete Supabase scripts install current interview functions and preserve existing data on rerun", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role authenticated; create role anon; create role service_role bypassrls;
      create schema auth; grant usage on schema auth to authenticated, anon;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}');
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
    `);
    const readSql = async file => (await readFile(new URL(`../supabase/${file}`, import.meta.url), "utf8"))
      .replace(/create extension if not exists "pgcrypto";/g, "");
    const complete = await readSql("RUN_ALL_MEDICFOREST_SETUP.sql");
    const interviews = await readSql("RUN_ALL_INTERVIEW_SETUP.sql");
    await db.exec(complete);
    await db.exec(`
      insert into auth.users(id,email) values ('11111111-1111-4111-8111-111111111111','student@example.test');
      update public.profiles set current_plan='premium',diagnostic_credits=0;
      insert into public.interview_attempts(user_id,mode,station_slug,title,circuit_id,preparation_seconds,station_seconds,break_seconds,questions,answers,metrics)
        values ('11111111-1111-4111-8111-111111111111','free','why-medicine','Saved interview',gen_random_uuid(),0,180,0,'["Why medicine?"]','[{"question":"Why medicine?","answer":"Keep my saved answer"}]','{"pausedAt":1792321200000}');
    `);
    await db.exec(complete);
    await db.exec(interviews);
    const profile = (await db.query("select current_plan,diagnostic_credits from public.profiles")).rows[0];
    assert.deepEqual(profile, { current_plan: "premium", diagnostic_credits: 0 });
    const attempts = (await db.query("select answers,metrics from public.interview_attempts")).rows;
    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].answers[0].answer, "Keep my saved answer");
    assert.equal(attempts[0].metrics.pausedAt, 1792321200000);
    const functions = (await db.query(`select
      to_regprocedure('public.interview_leaderboard_v3()') is not null as leaderboard,
      to_regprocedure('public.interview_leaderboard_v2()') is not null as scoring,
      to_regprocedure('public.acquire_interview_ai_capacity(uuid)') is not null as capacity,
      has_function_privilege('anon','public.interview_leaderboard_v3()','EXECUTE') as public_scores,
      has_function_privilege('authenticated','public.reserve_interview_attempt(uuid,jsonb,integer,integer)','EXECUTE') as client_starts`)).rows[0];
    assert.deepEqual(functions, { leaderboard: true, scoring: true, capacity: true, public_scores: true, client_starts: false });
    const reservation = (await db.query("select pg_get_functiondef('public.reserve_interview_attempt(uuid,jsonb,integer,integer)'::regprocedure) as definition")).rows[0].definition;
    assert.match(reservation, /free Why Medicine\? attempt has already been used/);
  } finally { await db.close(); }
});
