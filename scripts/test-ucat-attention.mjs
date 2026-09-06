import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = readFileSync(new URL("../app/phloemai/_lib/useAttentionTracker.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

// Exercise the actual hook with deterministic camera/model promises and frames.
function trackerHarness({ camera, model, detect } = {}) {
  let cursor = 0;
  let effects = [];
  const slots = [];
  const frames = new Map();
  const videos = [];
  let frameId = 0;
  let stopped = 0;
  let closed = 0;
  let detections = 0;
  const stream = { getTracks: () => [{ stop: () => { stopped += 1; } }] };
  const landmarker = {
    close: () => { closed += 1; },
    detectForVideo: () => { detections += 1; return detect ? detect() : {}; },
  };
  const sameDeps = (first, second) => first && second && first.length === second.length && first.every((value, i) => Object.is(value, second[i]));
  const react = {
    useRef(value) { const index = cursor++; return slots[index] ??= { current: value }; },
    useState(value) {
      const index = cursor++;
      slots[index] ??= { value: typeof value === "function" ? value() : value };
      return [slots[index].value, next => { slots[index].value = typeof next === "function" ? next(slots[index].value) : next; }];
    },
    useMemo(callback, deps) {
      const index = cursor++;
      if (!sameDeps(slots[index]?.deps, deps)) slots[index] = { deps, value: callback() };
      return slots[index].value;
    },
    useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
    useEffect(callback, deps) {
      const index = cursor++;
      if (sameDeps(slots[index]?.deps, deps)) return;
      effects.push(() => {
        slots[index]?.cleanup?.();
        slots[index] = { deps, cleanup: callback() };
      });
    },
  };
  const compiledModule = { exports: {} };
  const fakeRequire = name => {
    if (name === "react") return react;
    if (name === "@mediapipe/tasks-vision") return {
      FilesetResolver: { forVisionTasks: async () => ({}) },
      FaceLandmarker: { createFromOptions: () => model?.promise ?? Promise.resolve(landmarker) },
    };
    return require(name);
  };
  const document = {
    body: { appendChild() {} },
    createElement() {
      const video = { currentTime: 0, readyState: 2, style: {}, play: async () => {}, remove() { this.removed = true; } };
      videos.push(video);
      return video;
    },
  };
  new Function("require", "module", "exports", "navigator", "document", "requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "clearTimeout", "setInterval", "clearInterval", compiled)(
    fakeRequire, compiledModule, compiledModule.exports,
    { mediaDevices: { getUserMedia: () => camera?.promise ?? Promise.resolve(stream) } }, document,
    callback => { frames.set(++frameId, callback); return frameId; }, id => frames.delete(id),
    () => 1, () => {}, () => 1, () => {},
  );
  const options = { zoneIds: ["question"], zoneElements: { question: { current: null } }, isActive: true };
  return {
    stream, landmarker, videos,
    render() {
      cursor = 0;
      effects = [];
      const tracker = compiledModule.exports.useAttentionTracker(options);
      effects.forEach(effect => effect());
      return tracker;
    },
    unmount() { slots.forEach(slot => slot?.cleanup?.()); },
    frame() { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); },
    get stats() { return { stopped, closed, detections, frames: frames.size }; },
  };
}

test("unmount while camera permission is pending stops the eventual stream", async () => {
  const camera = deferred();
  const harness = trackerHarness({ camera });
  const starting = harness.render().startEyeTracking();
  harness.unmount();
  camera.resolve(harness.stream);
  await starting;
  assert.equal(harness.stats.stopped, 1);
  assert.equal(harness.videos.length, 0);
  assert.equal(harness.stats.frames, 0);
});

test("switching to practice closes a model that finishes loading after cancellation", async () => {
  const model = deferred();
  const harness = trackerHarness({ model });
  const tracker = harness.render();
  const starting = tracker.startEyeTracking();
  await new Promise(resolve => setImmediate(resolve));
  tracker.startPracticeOnly();
  model.resolve(harness.landmarker);
  await starting;
  assert.equal(harness.stats.stopped, 1);
  assert.equal(harness.stats.closed, 1);
  assert.equal(harness.stats.frames, 0);
  assert.equal(harness.render().trackingMode, "none");
});

test("ending an attempt releases camera, model and animation resources", async () => {
  const harness = trackerHarness();
  const tracker = harness.render();
  await tracker.startEyeTracking();
  tracker.finishAttempt();
  assert.deepEqual(harness.stats, { stopped: 1, closed: 1, detections: 0, frames: 0 });
  assert.equal(harness.videos[0].srcObject, null);
  harness.unmount();
  assert.equal(harness.stats.closed, 1);
});

test("inference runs once per video frame, rather than once per display frame", async () => {
  const harness = trackerHarness();
  await harness.render().startEyeTracking();
  harness.render();
  harness.frame();
  harness.frame();
  assert.equal(harness.stats.detections, 1);
  harness.videos[0].currentTime += 1 / 30;
  harness.frame();
  assert.equal(harness.stats.detections, 2);
  harness.unmount();
});

test("inference errors release resources and expose a recoverable error state", async () => {
  const harness = trackerHarness({ detect: () => { throw new Error("GPU unavailable"); } });
  await harness.render().startEyeTracking();
  harness.render();
  harness.frame();
  assert.deepEqual(harness.stats, { stopped: 1, closed: 1, detections: 1, frames: 0 });
  const tracker = harness.render();
  assert.equal(tracker.error, true);
  assert.equal(tracker.trackingMode, "none");
  harness.unmount();
});
