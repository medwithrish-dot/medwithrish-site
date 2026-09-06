import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("standalone account setup protects plans and credits and reruns preserve used credits", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role authenticated;
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
    const base = await readSql("phloemai_setup.sql");
    const practice = await readSql("phloemai_practice_setup.sql");
    await db.exec(base);
    await db.exec("insert into auth.users(id,email) values ('11111111-1111-4111-8111-111111111111','student@example.test')");
    await db.exec("set role authenticated");
    await db.exec("update public.profiles set full_name='Student'");
    await assert.rejects(db.exec("update public.profiles set current_plan='premium'"), /permission denied/);
    await assert.rejects(db.exec("update public.profiles set diagnostic_credits=100"), /permission denied/);
    await assert.rejects(db.exec("delete from public.profiles"), /permission denied/);
    await assert.rejects(db.exec("insert into public.profiles(id,current_plan) values ('11111111-1111-4111-8111-111111111111','premium')"), /permission denied/);
    await db.exec("reset role");
    await db.exec("update public.profiles set diagnostic_credits=0");
    await db.exec(practice); await db.exec(base); await db.exec(practice);
    assert.equal((await db.query("select diagnostic_credits from public.profiles")).rows[0].diagnostic_credits, 0);
  } finally {
    await db.close();
  }
});
