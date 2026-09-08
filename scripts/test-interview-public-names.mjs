import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { containsPublicNameProfanity, publicNameError, safePublicName } from "../utils/interviews/public-name.ts";

const offensive = [
  "fuck", "FUCK", "f.u.c.k", "f_u_c_k", "f-u-c-k", "f u c k", "fuuuck", "fuсk", "fück", "ｆｕｃｋ", "f\u200Buck", "fυck", "fuϲk",
  "sh1t", "s.h.i.t", "shiiiiit", "b1tch", "a55hole", "cu.nt", "w4nker", "tw4t", "b0ll0cks", "bastard",
  "dickhead", "cocksucker", "slut", "wh0re", "n1gg3r", "n.i.g.g.a", "f4gg0t", "r3t4rd", "paki",
  "a s s", "d.i.c.k", "user.shit.99", "CoolFuckDoctor", "Scunthorpe fuck", "Shital_shit", "f@ggot",
];
const legitimate = [
  "Rish", "Medwithrish", "Candidate 123", "Scunthorpe", "Shital Shah", "Shitara", "Slutsky", "Slutskaya",
  "Cassidy", "Cassandra", "Hassan", "Hassaan", "Jessica", "Dickson", "Dickens", "Hancock", "Cockburn",
  "Penistone", "Essex", "Sussex", "Passion for medicine", "Hardik", "Poonam", "Gayatri", "José", "Jose\u0301",
  "Māori", "O'Connor", "D’Arcy", "Anne-Marie", "李明", "Ayesha_99",
];

test("name moderation catches profanity and common disguises while preserving real names", () => {
  for (const name of offensive) assert.equal(containsPublicNameProfanity(name), true, name);
  for (const name of legitimate) {
    assert.equal(containsPublicNameProfanity(name), false, name);
    assert.equal(publicNameError(name), null, name);
  }
  for (const name of ["", " ", "A", "123", "_._", "A".repeat(33), "<script>", "Rish\u200B"]) assert.ok(publicNameError(name), name);
  assert.equal(safePublicName("f.u.c.k"), "Candidate");
  assert.equal(safePublicName("Rish"), "Rish");
});

test("real SQL blocks bypasses, sanitizes existing names and matches JavaScript moderation", async () => {
  const db = new PGlite();
  const userId = randomUUID();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
      grant usage on schema auth to authenticated,service_role;
      grant execute on function auth.uid() to authenticated,service_role;
    `);
    await db.exec(await readFile(new URL("../supabase/phloemai_interview_platform.sql", import.meta.url), "utf8"));
    await db.query("insert into auth.users(id) values ($1)", [userId]);
    await db.query("insert into public.interview_preferences(user_id,display_name,leaderboard_opt_in) values ($1,'f.u.c.k',true)", [userId]);
    await db.query(`insert into public.interview_attempts(user_id,mode,station_slug,title,status,circuit_id,preparation_seconds,station_seconds,break_seconds,questions,score,completed_at)
      values ($1,'free','why-medicine','Why medicine?','completed',$2,0,480,0,'[]',88.5,now())`, [userId, randomUUID()]);
    const migration = await readFile(new URL("../supabase/phloemai_interview_name_moderation.sql", import.meta.url), "utf8");
    await db.exec(migration);
    await db.exec(migration);
    const legacy = (await db.query("select display_name,leaderboard_opt_in from public.interview_preferences")).rows[0];
    assert.equal(legacy.display_name, `Candidate ${userId.slice(0, 6)}`);
    assert.equal(legacy.leaderboard_opt_in, true);

    for (const name of [...offensive, ...legitimate]) {
      const actual = (await db.query("select public.interview_name_has_profanity($1) as blocked", [name])).rows[0].blocked;
      assert.equal(actual, containsPublicNameProfanity(name), `SQL/JS parity: ${name}`);
    }
    await db.exec("set role service_role");
    for (const name of offensive) {
      await assert.rejects(db.query("update public.interview_preferences set display_name=$1 where user_id=$2", [name, userId]), /interview_preferences_name_moderated/, name);
    }
    await db.query("update public.interview_preferences set display_name='Shital Shah' where user_id=$1", [userId]);
    await db.exec("reset role; set role authenticated");
    await assert.rejects(db.query("update public.interview_preferences set display_name='fuck' where user_id=$1", [userId]), /permission denied/);
    const board = (await db.query("select * from public.interview_leaderboard()")).rows;
    assert.equal(board[0].display_name, "Shital Shah");
    assert.equal(Number(board[0].score), 88.5);
    await db.exec("reset role");

    // Simulate a legacy row while retaining the read guard in the real RPC.
    await db.exec("alter table public.interview_preferences drop constraint interview_preferences_name_moderated");
    await db.query("update public.interview_preferences set display_name='shit' where user_id=$1", [userId]);
    await db.exec("set role authenticated");
    assert.equal((await db.query("select display_name from public.interview_leaderboard()")).rows[0].display_name, "Candidate");
  } finally { await db.close(); }
});
