import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function loader(mocks = {}) {
  const modules = new Map();
  return function load(file) {
    const path = existsSync(file) ? file : `${file}.ts`;
    if (modules.has(path)) return modules.get(path).exports;
    const compiled = { exports: {} };
    modules.set(path, compiled);
    const javascript = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    const localRequire = (name) => Object.hasOwn(mocks, name) ? mocks[name] : name.startsWith("@/") ? load(resolve(root, name.slice(2))) : name.startsWith(".") ? load(resolve(dirname(path), name)) : createRequire(path)(name);
    new Function("require", "module", "exports", javascript)(localRequire, compiled, compiled.exports);
    return compiled.exports;
  };
}
const load = loader();
const { INTERVIEW_PATHWAY, PATHWAY_TASK_IDS, PATHWAY_STORAGE_DATE, pathwayResourceIds, pathwayTaskId, sanitisePathwayProgress, derivePathwayProgress, changePathwayTask } = load(resolve(root, "utils/interviews/pathway.ts"));

test("the seven-stage curriculum resolves real guide, question and mock-station links", () => {
  const { getInterviewPathwayStations } = load(resolve(root, "app/phloemai/interviews/_data/interview-pathway.ts"));
  const { INTERVIEW_QUESTIONS } = load(resolve(root, "app/phloemai/interviews/_data/interviewQuestionBank.ts"));
  const { interviewStations } = load(resolve(root, "app/phloemai/interviews/_data/interview-stations.ts"));
  const stations = getInterviewPathwayStations();
  assert.equal(stations.length, 7);
  assert.equal(new Set(PATHWAY_TASK_IDS).size, PATHWAY_TASK_IDS.length);
  assert.ok(PATHWAY_TASK_IDS.every((id) => id.length <= 160));
  assert.equal(new Set(INTERVIEW_PATHWAY.map((station) => station.mockStation)).size, 7);
  for (const [index, station] of stations.entries()) {
    assert.ok(interviewStations.some((entry) => entry.slug === INTERVIEW_PATHWAY[index].mockStation));
    assert.ok(station.tasks.filter((task) => task.kind === "guide").length >= 2);
    assert.equal(station.tasks.filter((task) => task.kind === "question").length, 3);
    for (const task of station.tasks.filter((task) => task.kind === "question")) {
      const questionId = new URL(task.href, "https://example.test").searchParams.get("question");
      assert.equal(INTERVIEW_QUESTIONS.find((entry) => entry.id === questionId)?.text, task.title);
    }
  }
  assert.ok(stations[5].tasks.some((task) => task.href.endsWith("/bawa-garba-case")));
});

test("progress survives serialization without dates or AI scores and only unlocks mocks after all seven readiness checks", () => {
  let progress = [];
  for (const [index, station] of INTERVIEW_PATHWAY.entries()) {
    assert.equal(derivePathwayProgress(progress).currentIndex, index);
    const readyId = pathwayTaskId(station.id, "ready");
    assert.throws(() => changePathwayTask(progress, readyId, true), /guides and practise/);
    for (const id of pathwayResourceIds(station)) progress = changePathwayTask(progress, id, true).completedTaskIds;
    assert.equal(derivePathwayProgress(progress).allComplete, false);
    progress = JSON.parse(JSON.stringify(changePathwayTask(progress, readyId, true).completedTaskIds));
  }
  assert.equal(derivePathwayProgress(progress).completedCount, 7);
  assert.equal(derivePathwayProgress(progress).allComplete, true);
  assert.equal(derivePathwayProgress(progress).currentIndex, -1);
  assert.ok(!PATHWAY_TASK_IDS.some((id) => /2026|score|feedback/.test(id)));
});

test("unknown tasks, invalid values, skipped stations and forged readiness cannot advance a learner", () => {
  const first = pathwayResourceIds(INTERVIEW_PATHWAY[0])[0];
  for (const id of [undefined, {}, "unlisted", "2026-09-08:guide:why-medicine"]) assert.throws(() => changePathwayTask([], id, true));
  for (const completed of [1, "true", null]) assert.throws(() => changePathwayTask([], first, completed));
  assert.throws(() => changePathwayTask([], pathwayResourceIds(INTERVIEW_PATHWAY[1])[0], true), /previous station/);
  assert.deepEqual(sanitisePathwayProgress([first, first, "unlisted", {}]), [first]);
  assert.equal(derivePathwayProgress(INTERVIEW_PATHWAY.map((station) => pathwayTaskId(station.id, "ready"))).completedCount, 0);
});

test("reopening a task removes its readiness and preserves the learner's later work", () => {
  const first = INTERVIEW_PATHWAY[0];
  const second = INTERVIEW_PATHWAY[1];
  const task = pathwayResourceIds(first)[0];
  const change = changePathwayTask(PATHWAY_TASK_IDS, task, false);
  assert.ok(!change.completedTaskIds.includes(pathwayTaskId(first.id, "ready")));
  assert.ok(change.completedTaskIds.includes(pathwayTaskId(second.id, "ready")));
  assert.equal(derivePathwayProgress(change.completedTaskIds).allComplete, false);
  assert.equal(derivePathwayProgress(change.completedTaskIds).stations[1].unlocked, false);
  const reread = changePathwayTask(change.completedTaskIds, task, true).completedTaskIds;
  assert.equal(derivePathwayProgress(reread).allComplete, false);
  const reviewed = changePathwayTask(reread, pathwayTaskId(first.id, "ready"), true).completedTaskIds;
  assert.equal(derivePathwayProgress(reviewed).allComplete, true);
});

function apiHarness() {
  const rows = [];
  const mutations = [];
  const state = { userId: "owner", failStorage: false };
  const admin = { from(table) {
    assert.equal(table, "interview_dashboard_tasks");
    let action = "read";
    let values;
    const filters = [];
    const query = {
      select() { return query; },
      eq(key, value) { filters.push((row) => row[key] === value); return query; },
      in(key, values) { filters.push((row) => values.includes(row[key])); return query; },
      upsert(value) { action = "upsert"; values = value; return query; },
      delete() { action = "delete"; return query; },
      then(resolve) {
        if (state.failStorage) return Promise.resolve(resolve({ data: null, error: { code: "42P01", message: "storage unavailable" } }));
        const matches = (row) => filters.every((filter) => filter(row));
        if (action === "upsert") {
          mutations.push(values);
          const existing = rows.findIndex((row) => row.user_id === values.user_id && row.task_id === values.task_id);
          if (existing < 0) rows.push(values); else rows[existing] = values;
        } else if (action === "delete") {
          for (let i = rows.length - 1; i >= 0; i--) if (matches(rows[i])) rows.splice(i, 1);
        }
        return Promise.resolve(resolve({ data: rows.filter(matches).map(({ task_id }) => ({ task_id })), error: null }));
      },
    };
    return query;
  } };
  class InterviewError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
  const server = {
    InterviewError,
    interviewContext: async () => { if (!state.userId) throw new InterviewError("Sign in", 401); return { user: { id: state.userId }, admin }; },
    readInterviewBody: (request) => request.json(),
    databaseError: () => { throw new InterviewError("Storage unavailable", 503); },
    interviewJson: (data) => Response.json(data),
    interviewFailure: (error) => Response.json({ error: error.message }, { status: error.status ?? 503 }),
  };
  const handlers = loader({ "next/cache": { revalidatePath() {} }, "@/utils/interviews/server": server })(resolve(root, "app/api/interviews/preparation/pathway/route.ts"));
  const post = (taskId, completed, extra = {}) => handlers.POST(new Request("https://example.test/api/interviews/preparation/pathway", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, completed, expectedUserId: state.userId, ...extra }) }));
  return { rows, mutations, state, handlers, post };
}

test("the real API saves bounded tasks against the authenticated owner, restores them and is idempotent", async () => {
  const api = apiHarness();
  const taskId = pathwayResourceIds(INTERVIEW_PATHWAY[0])[0];
  api.rows.push({ user_id: "friend", task_id: taskId, date: PATHWAY_STORAGE_DATE });
  api.rows.push({ user_id: "owner", task_id: "daily-guide", date: "2026-09-08" });
  assert.deepEqual((await (await api.handlers.GET()).json()).completedTaskIds, []);
  assert.equal((await api.post(taskId, true, { userId: "friend", date: "2029-01-01", score: 100 })).status, 200);
  assert.equal((await api.post(taskId, true)).status, 200);
  assert.equal(api.rows.filter((row) => row.user_id === "owner" && row.task_id === taskId).length, 1);
  assert.deepEqual((await (await api.handlers.GET()).json()).completedTaskIds, [taskId]);
  assert.equal(api.mutations[0].user_id, "owner");
  assert.equal(api.mutations[0].date, PATHWAY_STORAGE_DATE);
  assert.equal((await api.post(taskId, false)).status, 200);
  assert.ok(api.rows.some((row) => row.user_id === "friend" && row.task_id === taskId));
  assert.ok(api.rows.some((row) => row.task_id === "daily-guide"));
  api.state.userId = "different-owner";
  assert.deepEqual((await (await api.handlers.GET()).json()).completedTaskIds, []);
});

test("the API denies skipped stages, unauthenticated reads/writes and never reports a successful save during a storage failure", async () => {
  const api = apiHarness();
  const first = pathwayResourceIds(INTERVIEW_PATHWAY[0])[0];
  assert.equal((await api.post("invented-task", true)).status, 400);
  assert.equal((await api.post(first, true, { expectedUserId: "a-previous-login" })).status, 409);
  assert.equal((await api.post(pathwayResourceIds(INTERVIEW_PATHWAY[1])[0], true)).status, 400);
  assert.equal((await api.post(pathwayTaskId(INTERVIEW_PATHWAY[0].id, "ready"), true)).status, 400);
  assert.equal(api.mutations.length, 0);
  api.state.userId = null;
  assert.equal((await api.handlers.GET()).status, 401);
  assert.equal((await api.post(first, true)).status, 401);
  api.state.userId = "owner";
  api.state.failStorage = true;
  assert.equal((await api.post(first, true)).status, 503);
  assert.equal((await api.handlers.GET()).status, 503);
  assert.equal(api.mutations.length, 0);
});
