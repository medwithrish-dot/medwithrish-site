// Runs the actual migrations against embedded PostgreSQL. No project secrets,
// network services, Supabase account, or provider API calls are required.
// npm run test:interviews:db
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";

const { PGlite } = createRequire(import.meta.url)("@electric-sql/pglite");
const db = new PGlite();
const ids = Object.fromEntries(["owner", "friend", "outsider", "daily", "monthly", "claims", "private", "third", "ties"].map((name) => [name, randomUUID()]));
const transcript = "I want to study medicine because I value combining careful scientific reasoning with compassionate support for people. Volunteering taught me to listen and reflect on each person's priorities.";
let checks = 0;

async function check(name, run) {
  await run();
  checks += 1;
  console.log(`PASS ${name}`);
}

async function role(name, user, run) {
  assert.ok(["authenticated", "anon", "service_role"].includes(name));
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user || ""]);
  await db.exec(`set role ${name}`);
  try { return await run(); }
  finally { await db.exec("reset role"); }
}

async function group(user, action, groupId = null, payload = {}) {
  return role("authenticated", user, async () => (await db.query(
    "select public.interview_groups_action($1,$2,$3::jsonb) as value", [action, groupId, JSON.stringify(payload)],
  )).rows[0].value);
}

function station(overrides = {}) {
  return {
    mode: "free", station_slug: "why-medicine", title: "Why medicine?", circuit_id: randomUUID(),
    station_index: 0, station_count: 1, preparation_seconds: 0, station_seconds: 480,
    break_seconds: 0, questions: ["Why medicine?"], ...overrides,
  };
}

async function reserve(user, payload, daily = 20, monthly = 100) {
  return role("service_role", null, async () => (await db.query(
    "select to_jsonb(public.reserve_interview_attempt($1,$2::jsonb,$3,$4)) as value",
    [user, JSON.stringify(payload), daily, monthly],
  )).rows[0].value);
}

async function attempt(user, options = {}) {
  const id = randomUUID();
  await db.query(`insert into public.interview_attempts(
    id,user_id,mode,station_slug,title,status,circuit_id,preparation_seconds,station_seconds,break_seconds,
    questions,answers,score,completed_at,started_at,rubric_version)
    values ($1,$2,$3,$4,'Practice',$5,$6,0,480,0,'["Why medicine?"]',$7::jsonb,$8,$9,$10,$11)`, [
    id, user, options.mode || "free", options.stationSlug || "why-medicine", options.status || "completed", randomUUID(),
    JSON.stringify([{ question: "Why medicine?", answer: transcript }]), options.score ?? null,
    options.completedAt || "2026-01-02T10:00:00Z", options.startedAt || new Date().toISOString(), options.rubric || "why-medicine-v1",
  ]);
  return id;
}

async function claim(user, id, token = randomUUID()) {
  return role("service_role", null, async () => (await db.query(
    "select to_jsonb(public.claim_interview_grading($1,$2,$3)) as value", [user, id, token],
  )).rows[0].value);
}

try {
  // Supabase supplies these roles and auth objects in production. The fixture
  // substitutes JWT claims only; application tables/functions come from disk.
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; grant usage on schema auth to authenticated, anon;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    grant execute on function auth.uid() to authenticated, anon;
  `);
  const platformSql = await readFile(new URL("../supabase/phloemai_interview_platform.sql", import.meta.url), "utf8");
  const groupsSql = await readFile(new URL("../supabase/phloemai_interview_groups.sql", import.meta.url), "utf8");
  await check("actual platform and groups migrations install and can be rerun", async () => {
    await db.exec(platformSql); await db.exec(groupsSql);
    await db.exec(platformSql); await db.exec(groupsSql);
  });
  for (const [name, id] of Object.entries(ids)) {
    await db.query("insert into auth.users(id,raw_user_meta_data) values ($1,$2::jsonb)", [id, JSON.stringify({ full_name: name })]);
  }

  const ownAttempt = await attempt(ids.owner, { score: 80 });
  const friendAttempt = await attempt(ids.friend, { score: 88.5 });
  await check("RLS restricts attempt reads to the current account", async () => {
    const rows = await role("authenticated", ids.owner, () => db.query("select id,user_id from public.interview_attempts"));
    assert.deepEqual(rows.rows, [{ id: ownAttempt, user_id: ids.owner }]);
    const foreign = await role("authenticated", ids.owner, () => db.query("select id from public.interview_attempts where id=$1", [friendAttempt]));
    assert.equal(foreign.rows.length, 0);
  });
  await check("authenticated clients cannot insert, edit, or delete their scores", async () => {
    await role("authenticated", ids.owner, async () => {
      await assert.rejects(db.query("update public.interview_attempts set score=99 where id=$1", [ownAttempt]), /permission denied/);
      await assert.rejects(db.query("delete from public.interview_attempts where id=$1", [ownAttempt]), /permission denied/);
      await assert.rejects(db.query("insert into public.interview_attempts(user_id) values ($1)", [ids.owner]), /permission denied/);
      await assert.rejects(db.query("select public.reserve_interview_attempt($1,$2,20,100)", [ids.owner, JSON.stringify(station())]), /permission denied/);
      await assert.rejects(db.query("select public.claim_interview_grading($1,$2,$3)", [ids.owner, ownAttempt, randomUUID()]), /permission denied/);
    });
  });
  await check("anonymous clients cannot read attempts, call groups, or see leaderboard", async () => {
    await role("anon", null, async () => {
      await assert.rejects(db.query("select * from public.interview_attempts"), /permission denied/);
      await assert.rejects(db.query("select public.interview_groups_action('list')"), /permission denied/);
      await assert.rejects(db.query("select * from public.interview_leaderboard()"), /permission denied/);
    });
    await assert.rejects(group(null, "list"), /Sign in/);
  });

  await check("parallel reservation replays reuse one active attempt", async () => {
    const payload = station();
    // PGlite queues these queries. This checks replay/duplicate behavior; real
    // multi-connection lock contention still requires a deployed Postgres test.
    const records = await role("service_role", null, async () => Promise.all(Array.from({ length: 8 }, () => db.query(
      "select to_jsonb(public.reserve_interview_attempt($1,$2::jsonb,2,30)) as value", [ids.daily, JSON.stringify(payload)],
    ))));
    assert.equal(new Set(records.map((result) => result.rows[0].value.id)).size, 1);
    assert.equal((await db.query("select count(*) as n from public.interview_attempts where user_id=$1", [ids.daily])).rows[0].n, 1);
    assert.equal((await reserve(ids.daily, station(), 2, 30)).id, records[0].rows[0].value.id);
  });
  await check("completed duplicate circuits are idempotent and daily quota is durable", async () => {
    const old = (await db.query("select * from public.interview_attempts where user_id=$1", [ids.daily])).rows[0];
    await db.query("update public.interview_attempts set status='completed' where id=$1", [old.id]);
    const duplicate = await reserve(ids.daily, station({ circuit_id: old.circuit_id }), 2, 30);
    assert.equal(duplicate.id, old.id);
    const second = await reserve(ids.daily, station(), 2, 30);
    await db.query("update public.interview_attempts set status='completed' where id=$1", [second.id]);
    await assert.rejects(reserve(ids.daily, station(), 2, 30), /Daily interview limit reached/);
    assert.equal((await reserve(ids.daily, station({ circuit_id: old.circuit_id }), 2, 30)).id, old.id);
  });
  await check("monthly quota counts older stations outside the daily window", async () => {
    await attempt(ids.monthly, { startedAt: new Date(Date.now() - 2 * 86400_000).toISOString() });
    await attempt(ids.monthly, { startedAt: new Date(Date.now() - 3 * 86400_000).toISOString() });
    await assert.rejects(reserve(ids.monthly, station(), 20, 2), /Monthly interview limit reached/);
  });

  const gradeId = await attempt(ids.claims, { status: "in_progress" });
  const token1 = randomUUID();
  const token2 = randomUUID();
  await check("grading validates the locked transcript before spending a retry", async () => {
    const changed = await attempt(ids.claims, { status: "in_progress" });
    // Simulate an autosave replacing a valid preflight snapshot just before claim.
    await db.query("update public.interview_attempts set answers='[]' where id=$1", [changed]);
    await assert.rejects(claim(ids.claims, changed), /at least 20 words/);
    const current = (await db.query("select status,grading_tries,grading_token from public.interview_attempts where id=$1", [changed])).rows[0];
    assert.deepEqual(current, { status: "in_progress", grading_tries: 0, grading_token: null });
    await db.query("update public.interview_attempts set answers=$2::jsonb where id=$1", [changed, JSON.stringify([{ question: "Why medicine?", answer: " \n\t " }])]);
    await assert.rejects(claim(ids.claims, changed), /at least 20 words/);
  });
  await check("grading claim checks ownership and blocks a concurrent fresh claim", async () => {
    await assert.rejects(claim(ids.outsider, gradeId), /Interview not found/);
    const first = await claim(ids.claims, gradeId, token1);
    assert.equal(first.status, "grading"); assert.equal(first.grading_tries, 1);
    await assert.rejects(claim(ids.claims, gradeId, token2), /already being generated/);
  });
  await check("stale grading can be reclaimed and an older token cannot complete it", async () => {
    await db.query("update public.interview_attempts set grading_started_at=now()-interval '100 seconds' where id=$1", [gradeId]);
    const reclaimed = await claim(ids.claims, gradeId, token2);
    assert.equal(reclaimed.grading_tries, 2); assert.equal(reclaimed.grading_token, token2);
    const staleWrite = await role("service_role", null, () => db.query(
      "update public.interview_attempts set status='completed',score=99 where id=$1 and user_id=$2 and grading_token=$3 and status='grading' returning id",
      [gradeId, ids.claims, token1],
    ));
    assert.equal(staleWrite.rows.length, 0);
  });
  await check("failed grading retry is bounded to three claims", async () => {
    await db.query("update public.interview_attempts set status='failed' where id=$1", [gradeId]);
    const finalTry = await claim(ids.claims, gradeId);
    assert.equal(finalTry.grading_tries, 3);
    await db.query("update public.interview_attempts set status='failed' where id=$1", [gradeId]);
    await assert.rejects(claim(ids.claims, gradeId), /retry limit reached/);
  });
  await check("abandoned attempts cannot be graded, completed attempts never regrade", async () => {
    const abandoned = await attempt(ids.claims, { status: "failed" });
    await db.query("update public.interview_attempts set last_error='abandoned' where id=$1", [abandoned]);
    await assert.rejects(claim(ids.claims, abandoned), /was ended/);
    const completed = await claim(ids.owner, ownAttempt);
    assert.equal(completed.status, "completed"); assert.equal(completed.grading_tries, 0);
  });
  await check("submitted snapshots reject later autosaves and score constraint caps at 99", async () => {
    const lockedId = await attempt(ids.claims, { status: "in_progress" });
    await claim(ids.claims, lockedId);
    const lateSave = await role("service_role", null, () => db.query(
      "update public.interview_attempts set answers='[]' where id=$1 and user_id=$2 and status='in_progress' returning id", [lockedId, ids.claims],
    ));
    assert.equal(lateSave.rows.length, 0);
    await assert.rejects(db.query("update public.interview_attempts set score=100 where id=$1", [ownAttempt]), /check constraint/);
    await assert.rejects(db.query("update public.interview_attempts set score=-1 where id=$1", [ownAttempt]), /check constraint/);
  });

  for (const [key, optIn] of [["owner", true], ["friend", true], ["private", false], ["third", true], ["ties", true]]) {
    await db.query("insert into public.interview_preferences(user_id,display_name,leaderboard_opt_in) values ($1,$2,$3)", [ids[key], `Public ${key}`, optIn]);
  }
  await attempt(ids.owner, { score: 91, completedAt: "2026-01-03T10:00:00Z" });
  await attempt(ids.owner, { score: 91, completedAt: "2026-01-04T10:00:00Z" });
  await attempt(ids.friend, { score: 99, mode: "station" });
  await attempt(ids.friend, { score: 99, rubric: "other-rubric" });
  await attempt(ids.friend, { score: 99, stationSlug: "ethics" });
  await attempt(ids.friend, { score: 99, status: "failed" });
  await attempt(ids.private, { score: 99 });
  await attempt(ids.third, { score: 99 });
  await attempt(ids.ties, { score: 91, completedAt: "2026-01-01T10:00:00Z" });
  await check("leaderboard uses one best valid free attempt per opted-in account", async () => {
    const { rows } = await role("authenticated", ids.owner, () => db.query("select * from public.interview_leaderboard()"));
    assert.deepEqual(rows.map((row) => row.display_name), ["Public third", "Public ties", "Public owner", "Public friend"]);
    assert.deepEqual(rows.map((row) => Number(row.score)), [99, 91, 91, 88.5]);
    assert.deepEqual(rows.map((row) => row.is_you), [false, false, true, false]);
    assert.equal(new Date(rows[2].completed_at).toISOString(), "2026-01-03T10:00:00.000Z");
    assert.deepEqual(Object.keys(rows[0]).sort(), ["completed_at", "display_name", "is_you", "rank", "score"]);
  });
  await check("preference RLS hides other accounts and opt-out removes board results", async () => {
    const ownPrefs = await role("authenticated", ids.owner, () => db.query("select user_id from public.interview_preferences"));
    assert.deepEqual(ownPrefs.rows, [{ user_id: ids.owner }]);
    await role("authenticated", ids.owner, async () => {
      await assert.rejects(db.query("update public.interview_preferences set leaderboard_opt_in=true"), /permission denied/);
    });
    await db.query("update public.interview_preferences set leaderboard_opt_in=false where user_id=$1", [ids.third]);
    const { rows } = await role("authenticated", ids.owner, () => db.query("select * from public.interview_leaderboard()"));
    assert.equal(rows.some((row) => row.display_name === "Public third"), false);
  });

  let created;
  await check("groups create atomically with hashed invites and private membership", async () => {
    assert.deepEqual((await group(ids.outsider, "list")).groups, []);
    created = await group(ids.owner, "create", null, { name: "Study circle" });
    assert.match(created.inviteCode, /^[a-f0-9]{32}$/);
    const stored = (await db.query("select invite_hash from public.interview_study_groups where id=$1", [created.groupId])).rows[0];
    assert.notEqual(stored.invite_hash, created.inviteCode);
    await assert.rejects(group(ids.outsider, "details", created.groupId), /unavailable/);
    await assert.rejects(group(ids.friend, "join", null, { code: "invalid" }), /invalid or expired/);
  });
  const groupId = created.groupId;
  await check("group joins are idempotent; members see best free score without transcripts", async () => {
    await group(ids.friend, "join", null, { code: created.inviteCode });
    await group(ids.friend, "join", null, { code: created.inviteCode });
    const detail = await group(ids.friend, "details", groupId);
    assert.equal(detail.members.length, 2);
    assert.equal(detail.members.find((member) => member.userId === ids.friend).whyMedicineScore, 88.5);
    assert.equal(detail.members[0].groupScore, null);
    assert.equal(JSON.stringify(detail).includes(transcript), false);
    assert.equal(JSON.stringify(detail).includes("invite_hash"), false);
    await assert.rejects(group(ids.friend, "invite", groupId), /Only the group owner/);
  });
  let roomId;
  await check("only hosts create/start stations; answers need the shared timer", async () => {
    await assert.rejects(group(ids.friend, "create_room", groupId, { stationId: "motivation" }), /Only the group owner/);
    roomId = (await group(ids.owner, "create_room", groupId, { stationId: "motivation" })).roomId;
    await assert.rejects(group(ids.owner, "create_room", groupId, { stationId: "motivation" }), /Finish the current station/);
    await assert.rejects(group(ids.friend, "answer", groupId, { roomId, text: transcript }), /only be saved/);
    await assert.rejects(group(ids.friend, "start_room", groupId, { roomId }), /Only the group owner/);
    await group(ids.owner, "start_room", groupId, { roomId });
    const detail = await group(ids.friend, "details", groupId);
    assert.equal(detail.room.status, "active");
    assert.equal(new Date(detail.room.endsAt) - new Date(detail.room.startedAt), 480000);
  });
  await check("group answers/chat persist, writes are bounded, outsiders are rejected", async () => {
    await group(ids.friend, "answer", groupId, { roomId, text: transcript });
    await assert.rejects(group(ids.friend, "answer", groupId, { roomId, text: "Immediate duplicate" }), /wait a moment/);
    await group(ids.friend, "message", groupId, { roomId, text: "Your turn!" });
    await assert.rejects(group(ids.friend, "message", groupId, { roomId, text: "Immediate duplicate" }), /wait a moment/);
    await assert.rejects(group(ids.owner, "answer", groupId, { roomId, text: "x".repeat(6001) }), /6,000/);
    await assert.rejects(group(ids.owner, "message", groupId, { roomId, text: "x".repeat(1001) }), /1,000/);
    const detail = await group(ids.owner, "details", groupId);
    assert.equal(detail.answers[0].text, transcript); assert.equal(detail.messages[0].text, "Your turn!");
    await assert.rejects(group(ids.outsider, "message", groupId, { roomId, text: "Intrusion" }), /unavailable/);
  });
  await check("removal revokes membership and old invites; rotated invites restore access", async () => {
    await group(ids.owner, "remove", groupId, { userId: ids.friend });
    await assert.rejects(group(ids.friend, "details", groupId), /unavailable/);
    await assert.rejects(group(ids.friend, "answer", groupId, { roomId, text: "Removed" }), /unavailable/);
    await assert.rejects(group(ids.friend, "join", null, { code: created.inviteCode }), /invalid or expired/);
    const replacement = await group(ids.owner, "invite", groupId);
    await group(ids.friend, "join", null, { code: replacement.inviteCode });
  });
  await check("expired rooms close without browser activity and reject late answers", async () => {
    await db.query("update public.interview_study_group_rooms set ends_at=now()-interval '1 second' where id=$1", [roomId]);
    assert.equal((await group(ids.friend, "details", groupId)).room.status, "completed");
    await assert.rejects(group(ids.friend, "answer", groupId, { roomId, text: "Too late" }), /only be saved/);
    assert.ok((await group(ids.owner, "create_room", groupId, { stationId: "ethics-edi" })).roomId);
  });
  await check("group tables reject direct client access and delete cascades room data", async () => {
    await role("authenticated", ids.owner, async () => {
      await assert.rejects(db.query("select * from public.interview_study_groups"), /permission denied/);
      await assert.rejects(db.query("insert into public.interview_study_group_answers(room_id,user_id,display_name,answer) values ($1,$2,'Hack','Hack')", [roomId, ids.owner]), /permission denied/);
    });
    await assert.rejects(group(ids.owner, "leave", groupId), /owner must delete/);
    await group(ids.friend, "leave", groupId);
    assert.equal((await group(ids.friend, "list")).groups.length, 0);
    await group(ids.owner, "delete", groupId);
    const counts = await db.query(`select
      (select count(*) from public.interview_study_group_rooms) as rooms,
      (select count(*) from public.interview_study_group_answers) as answers,
      (select count(*) from public.interview_study_group_messages) as messages`);
    assert.deepEqual(counts.rows[0], { rooms: 0, answers: 0, messages: 0 });
  });
  await check("a group cannot exceed 12 members and an account cannot exceed 10 groups", async () => {
    const crowded = await group(ids.owner, "create", null, { name: "Capacity check" });
    const friends = Array.from({ length: 12 }, () => randomUUID());
    for (const id of friends) await db.query("insert into auth.users(id) values ($1)", [id]);
    for (const id of friends.slice(0, 11)) await group(id, "join", null, { code: crowded.inviteCode });
    await assert.rejects(group(friends[11], "join", null, { code: crowded.inviteCode }), /already has 12 members/);
    assert.equal((await group(ids.owner, "details", crowded.groupId)).members.length, 12);
    for (let index = 0; index < 10; index += 1) await group(ids.outsider, "create", null, { name: `Group ${index}` });
    await assert.rejects(group(ids.outsider, "create", null, { name: "One too many" }), /up to 10 study groups/);
    const invitation = await group(ids.friend, "create", null, { name: "Invited group" });
    await assert.rejects(group(ids.outsider, "join", null, { code: invitation.inviteCode }), /up to 10 study groups/);
  });
  await check("membership in one group does not permit reading or writing another group's rooms", async () => {
    const first = await group(ids.owner, "create", null, { name: "First group" });
    const second = await group(ids.friend, "create", null, { name: "Second group" });
    const foreignRoom = (await group(ids.friend, "create_room", second.groupId, { stationId: "work-experience" })).roomId;
    await assert.rejects(group(ids.owner, "details", first.groupId, { roomId: foreignRoom }), /room is unavailable/);
    await assert.rejects(group(ids.owner, "message", first.groupId, { roomId: foreignRoom, text: "Wrong room" }), /room is unavailable/);
    await assert.rejects(group(ids.owner, "start_room", first.groupId, { roomId: foreignRoom }), /room is unavailable/);
  });
  await check("group station creation has a durable daily cap", async () => {
    const limited = await group(ids.owner, "create", null, { name: "Room limit" });
    await db.query(`insert into public.interview_study_group_rooms(group_id,station_id,title,questions,status)
      select $1,'motivation','Why medicine?','[]','completed' from generate_series(1,20)`, [limited.groupId]);
    await assert.rejects(group(ids.owner, "create_room", limited.groupId, { stationId: "motivation" }), /daily limit of 20 stations/);
  });
  console.log(`\n${checks} PostgreSQL integration checks passed. No external AI calls were made.`);
  console.log("PGlite serializes query execution; this suite does not simulate separate-connection lock contention.");
} finally {
  await db.close();
}
