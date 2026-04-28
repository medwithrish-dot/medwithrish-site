"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type TrackingMode = "none" | "mouse" | "eye";
export type ActiveRegion<ZoneId extends string> = ZoneId | "unknown";
export type RegionTransition<ZoneId extends string> = {
  from: ZoneId;
  to: ZoneId;
  at: number;
};

export type TrackingProfile = {
  smoothingSampleCount: number;
  intentWindowMs: number;
  minRegionDwellMs: number;
  fuzzyPaddingRatio: number;
  fuzzyMinPaddingPx: number;
  intentScoreThreshold: number;
  maxDetectSpeedPxPerMs: number | null;
  settleAfterTransitMs: number;
};

export type AttentionTrackingSnapshot<ZoneId extends string> = {
  dataReceived: boolean;
  earlyZoneTimes: Record<ZoneId, number>;
  firstPrimaryRegion: ZoneId | null;
  regionSwitchCount: number;
  regionTransitions: RegionTransition<ZoneId>[];
  trackingMode: TrackingMode;
};

type ZoneScores<ZoneId extends string> = Record<ZoneId, number>;
type GazeSample = { x: number; y: number; at: number };
type Landmark = { x: number; y: number; z: number };
type FaceLandmarkerInstance = {
  detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks?: Landmark[][] };
  close: () => void;
};

export type UseAttentionTrackerOptions<ZoneId extends string> = {
  zoneIds: readonly ZoneId[];
  zoneElements: Record<ZoneId, RefObject<Element | null>>;
  isActive: boolean;
  earlyFocusWindowMs?: number;
  profiles?: Partial<Record<TrackingMode, Partial<TrackingProfile>>>;
};

const L_IRIS = 468;
const R_IRIS = 473;

export const CALIB_PHASES = [
  { label: "the top of the screen", y: 10 },
  { label: "the centre", y: 50 },
  { label: "the bottom", y: 90 },
] as const;

const BASE_TRACKING_PROFILES: Record<TrackingMode, TrackingProfile> = {
  none: {
    smoothingSampleCount: 8,
    intentWindowMs: 650,
    minRegionDwellMs: 400,
    fuzzyPaddingRatio: 0.18,
    fuzzyMinPaddingPx: 18,
    intentScoreThreshold: 0.2,
    maxDetectSpeedPxPerMs: null,
    settleAfterTransitMs: 0,
  },
  eye: {
    smoothingSampleCount: 8,
    intentWindowMs: 650,
    minRegionDwellMs: 400,
    fuzzyPaddingRatio: 0.18,
    fuzzyMinPaddingPx: 18,
    intentScoreThreshold: 0.2,
    maxDetectSpeedPxPerMs: null,
    settleAfterTransitMs: 0,
  },
  mouse: {
    smoothingSampleCount: 1,
    intentWindowMs: 90,
    minRegionDwellMs: 70,
    fuzzyPaddingRatio: 0.04,
    fuzzyMinPaddingPx: 4,
    intentScoreThreshold: 0.08,
    maxDetectSpeedPxPerMs: 0.67,
    settleAfterTransitMs: 90,
  },
};

function createZoneRecord<ZoneId extends string>(
  zoneIds: readonly ZoneId[],
  value = 0
) {
  return Object.fromEntries(zoneIds.map((id) => [id, value])) as Record<ZoneId, number>;
}

function isPrimaryRegion<ZoneId extends string>(
  region: ActiveRegion<ZoneId>
): region is ZoneId {
  return region !== "unknown";
}

function scoreRectIntent(
  x: number,
  y: number,
  rect: DOMRectReadOnly,
  profile: TrackingProfile
) {
  const padX = Math.max(profile.fuzzyMinPaddingPx, rect.width * profile.fuzzyPaddingRatio);
  const padY = Math.max(profile.fuzzyMinPaddingPx, rect.height * profile.fuzzyPaddingRatio);
  const outsideX = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
  const outsideY = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
  const outsideScore = Math.max(outsideX / padX, outsideY / padY);

  if (outsideScore > 1) return 0;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const centerDistance = Math.hypot(x - centerX, y - centerY);
  const maxCenterDistance = Math.max(1, Math.hypot(rect.width / 2 + padX, rect.height / 2 + padY));
  const centerScore = Math.max(0, 1 - centerDistance / maxCenterDistance);

  return (1 - outsideScore) * 0.85 + centerScore * 0.15;
}

export function useAttentionTracker<ZoneId extends string>({
  zoneIds,
  zoneElements,
  isActive,
  earlyFocusWindowMs = 10000,
  profiles,
}: UseAttentionTrackerOptions<ZoneId>) {
  const trackingProfiles = useMemo(
    () =>
      ({
        none: { ...BASE_TRACKING_PROFILES.none, ...profiles?.none },
        eye: { ...BASE_TRACKING_PROFILES.eye, ...profiles?.eye },
        mouse: { ...BASE_TRACKING_PROFILES.mouse, ...profiles?.mouse },
      }) satisfies Record<TrackingMode, TrackingProfile>,
    [profiles]
  );

  const [activeZone, setActiveZone] = useState<ActiveRegion<ZoneId>>("unknown");
  const [zoneTimes, setZoneTimes] = useState<Record<ZoneId, number>>(() =>
    createZoneRecord(zoneIds)
  );
  const [calibPhase, setCalibPhase] = useState(0);
  const [calibCountdown, setCalibCountdown] = useState(2);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("none");
  const [dataReceived, setDataReceived] = useState(false);
  const [error, setError] = useState(false);
  const [showRing, setShowRing] = useState(true);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [eyeStatus, setEyeStatus] = useState<"idle" | "enabling" | "calibrating">("idle");

  const activeRef = useRef(isActive);
  const dataReceivedRef = useRef(false);
  const activeRegionRef = useRef<ActiveRegion<ZoneId>>("unknown");
  const candidateRegionRef = useRef<ActiveRegion<ZoneId>>("unknown");
  const candidateRegionSinceRef = useRef<number>(0);
  const zoneTimesRef = useRef<Record<ZoneId, number>>(createZoneRecord(zoneIds));
  const gazeSamplesRef = useRef<GazeSample[]>([]);
  const intentSamplesRef = useRef<{ at: number; scores: ZoneScores<ZoneId> }[]>([]);
  const questionStartTimeRef = useRef<number>(0);
  const earlyZoneTimesRef = useRef<Record<ZoneId, number>>(createZoneRecord(zoneIds));
  const firstPrimaryRegionRef = useRef<ZoneId | null>(null);
  const regionTransitionsRef = useRef<RegionTransition<ZoneId>[]>([]);
  const regionSwitchCountRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const neutralRef = useRef<number | null>(null);
  const neutralHorizRef = useRef<number | null>(null);
  const gainVRef = useRef<number>(60);
  const calibPhaseRef = useRef(0);
  const calibPhaseSamples = useRef<[number[], number[], number[]]>([[], [], []]);
  const calibHorizSamplesRef = useRef<number[]>([]);
  const afterEyeCalibrationRef = useRef<(() => void) | null>(null);

  const trackingProfile = trackingProfiles[trackingMode];

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  const zonePcts = useMemo(() => {
    const total = (Object.values(zoneTimes) as number[]).reduce(
      (sum, value) => sum + value,
      0
    );
    if (total === 0) return createZoneRecord(zoneIds);

    return Object.fromEntries(
      zoneIds.map((id) => [id, Math.round((zoneTimes[id] / total) * 100)])
    ) as Record<ZoneId, number>;
  }, [zoneIds, zoneTimes]);

  const recordEarlyDwell = useCallback(
    (region: ZoneId, from: number, to: number) => {
      const sessionStart = questionStartTimeRef.current;
      if (!sessionStart || to <= from) return;

      const earlyWindowEnd = sessionStart + earlyFocusWindowMs;
      const overlap = Math.max(0, Math.min(to, earlyWindowEnd) - Math.max(from, sessionStart));
      if (overlap > 0) {
        earlyZoneTimesRef.current[region] += overlap;
      }
    },
    [earlyFocusWindowMs]
  );

  const scoreRegions = useCallback(
    (x: number, y: number): ZoneScores<ZoneId> => {
      const scores = createZoneRecord(zoneIds);

      for (const id of zoneIds) {
        const rect = zoneElements[id].current?.getBoundingClientRect();
        if (rect) scores[id] = scoreRectIntent(x, y, rect, trackingProfile);
      }

      return scores;
    },
    [trackingProfile, zoneElements, zoneIds]
  );

  const detectIntentRegion = useCallback(
    (x: number, y: number, now: number): ActiveRegion<ZoneId> => {
      gazeSamplesRef.current.push({ x, y, at: now });
      if (gazeSamplesRef.current.length > trackingProfile.smoothingSampleCount) {
        gazeSamplesRef.current.shift();
      }

      const smoothed = gazeSamplesRef.current.reduce(
        (acc, sample) => ({ x: acc.x + sample.x, y: acc.y + sample.y }),
        { x: 0, y: 0 }
      );
      const sampleCount = Math.max(1, gazeSamplesRef.current.length);
      const scores = scoreRegions(smoothed.x / sampleCount, smoothed.y / sampleCount);

      intentSamplesRef.current.push({ at: now, scores });
      intentSamplesRef.current = intentSamplesRef.current.filter(
        (sample) => now - sample.at <= trackingProfile.intentWindowMs
      );

      const totals = createZoneRecord(zoneIds);
      let totalWeight = 0;
      for (const sample of intentSamplesRef.current) {
        const ageRatio = Math.min(1, (now - sample.at) / trackingProfile.intentWindowMs);
        const weight = 1 - ageRatio * 0.55;
        totalWeight += weight;
        for (const id of zoneIds) totals[id] += sample.scores[id] * weight;
      }

      if (totalWeight <= 0 || zoneIds.length === 0) return "unknown";

      let bestRegion = zoneIds[0];
      let bestScore = totals[bestRegion] / totalWeight;
      for (const id of zoneIds) {
        const score = totals[id] / totalWeight;
        if (score > bestScore) {
          bestRegion = id;
          bestScore = score;
        }
      }

      return bestScore >= trackingProfile.intentScoreThreshold ? bestRegion : "unknown";
    },
    [scoreRegions, trackingProfile, zoneIds]
  );

  const commitStableRegion = useCallback(
    (nextRegion: ActiveRegion<ZoneId>, now: number) => {
      const currentRegion = activeRegionRef.current;

      if (trackingMode === "mouse") {
        if (nextRegion === currentRegion) return currentRegion;

        if (nextRegion === "unknown") {
          candidateRegionRef.current = "unknown";
          candidateRegionSinceRef.current = now;
          activeRegionRef.current = "unknown";
          setActiveZone("unknown");
          return "unknown";
        }

        if (currentRegion !== "unknown") {
          if (candidateRegionRef.current !== nextRegion) {
            candidateRegionRef.current = nextRegion;
            candidateRegionSinceRef.current = now;
            return currentRegion;
          }

          if (now - candidateRegionSinceRef.current < trackingProfile.minRegionDwellMs) {
            return currentRegion;
          }
        }

        if (!firstPrimaryRegionRef.current) {
          firstPrimaryRegionRef.current = nextRegion;
        }

        if (isPrimaryRegion(currentRegion)) {
          regionSwitchCountRef.current += 1;
          regionTransitionsRef.current.push({
            from: currentRegion,
            to: nextRegion,
            at: now,
          });
        }

        candidateRegionRef.current = nextRegion;
        candidateRegionSinceRef.current = now;
        activeRegionRef.current = nextRegion;
        setActiveZone(nextRegion);
        return nextRegion;
      }

      if (nextRegion === currentRegion) {
        candidateRegionRef.current = nextRegion;
        candidateRegionSinceRef.current = now;
        return currentRegion;
      }

      if (candidateRegionRef.current !== nextRegion) {
        candidateRegionRef.current = nextRegion;
        candidateRegionSinceRef.current = now;
        return currentRegion;
      }

      if (now - candidateRegionSinceRef.current < trackingProfile.minRegionDwellMs) {
        return currentRegion;
      }

      if (isPrimaryRegion(nextRegion)) {
        if (!firstPrimaryRegionRef.current) {
          firstPrimaryRegionRef.current = nextRegion;
        }

        if (isPrimaryRegion(currentRegion) && currentRegion !== nextRegion) {
          regionSwitchCountRef.current += 1;
          regionTransitionsRef.current.push({
            from: currentRegion,
            to: nextRegion,
            at: now,
          });
        }
      }

      activeRegionRef.current = nextRegion;
      setActiveZone(nextRegion);
      return nextRegion;
    },
    [trackingMode, trackingProfile]
  );

  const recordPoint = useCallback(
    (x: number, y: number) => {
      if (!activeRef.current) return;

      setPointer({ x, y });
      dataReceivedRef.current = true;
      setDataReceived(true);
      const now = Date.now();
      const previousTime = lastTimeRef.current > 0 ? lastTimeRef.current : now;
      const elapsed = now - previousTime;
      const elapsedRegion = activeRegionRef.current;
      if (elapsed > 0 && isPrimaryRegion(elapsedRegion)) {
        const nextZoneTimes = {
          ...zoneTimesRef.current,
          [elapsedRegion]: zoneTimesRef.current[elapsedRegion] + elapsed,
        };
        zoneTimesRef.current = nextZoneTimes;
        setZoneTimes(nextZoneTimes);
        recordEarlyDwell(elapsedRegion, previousTime, now);
      }
      lastTimeRef.current = now;
      const intentRegion = detectIntentRegion(x, y, now);
      commitStableRegion(intentRegion, now);
    },
    [commitStableRegion, detectIntentRegion, recordEarlyDwell]
  );

  const recordMouseTransit = useCallback(
    (x: number, y: number) => {
      if (!activeRef.current) return;

      setPointer({ x, y });
      dataReceivedRef.current = true;
      setDataReceived(true);
      const now = Date.now();
      lastTimeRef.current = now;
      gazeSamplesRef.current = [];
      intentSamplesRef.current = [];
      commitStableRegion("unknown", now);
    },
    [commitStableRegion]
  );

  useEffect(() => {
    if (!isActive || trackingMode !== "mouse") return;

    let frameId: number | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    let latestPoint: { x: number; y: number; transit: boolean } | null = null;
    let previousPoint: { x: number; y: number; at: number } | null = null;

    const flushPoint = () => {
      frameId = null;
      if (!latestPoint) return;
      if (latestPoint.transit) {
        recordMouseTransit(latestPoint.x, latestPoint.y);
      } else {
        recordPoint(latestPoint.x, latestPoint.y);
      }
    };

    const scheduleSettleCheck = (delayMs: number) => {
      if (settleTimer !== null) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        settleTimer = null;
        if (!latestPoint) return;
        recordPoint(latestPoint.x, latestPoint.y);
      }, delayMs);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      const now = Date.now();
      const x = event.clientX;
      const y = event.clientY;
      const elapsed = previousPoint ? Math.max(1, now - previousPoint.at) : 0;
      const distance = previousPoint ? Math.hypot(x - previousPoint.x, y - previousPoint.y) : 0;
      const speed = elapsed > 0 ? distance / elapsed : 0;
      const transit =
        trackingProfile.maxDetectSpeedPxPerMs !== null &&
        speed > trackingProfile.maxDetectSpeedPxPerMs;

      latestPoint = { x, y, transit };
      previousPoint = { x, y, at: now };
      if (frameId === null) {
        frameId = requestAnimationFrame(flushPoint);
      }

      scheduleSettleCheck(
        transit
          ? trackingProfile.settleAfterTransitMs
          : trackingProfile.minRegionDwellMs + 15
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameId !== null) cancelAnimationFrame(frameId);
      if (settleTimer !== null) clearTimeout(settleTimer);
    };
  }, [isActive, recordMouseTransit, recordPoint, trackingMode, trackingProfile]);

  const runLoopRef = useRef<() => void>(() => {});
  const runLoop = useCallback(() => {
    const video = videoRef.current;
    const lmRef = faceLandmarkerRef.current;
    if (!video || !lmRef || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(runLoopRef.current);
      return;
    }

    const results = lmRef.detectForVideo(video, performance.now());
    if (results.faceLandmarks?.[0]) {
      const lm = results.faceLandmarks[0];
      const headRefY = (lm[133].y + lm[362].y) / 2;
      const headRefX = (lm[133].x + lm[362].x) / 2;
      const gazeY = (lm[L_IRIS].y + lm[R_IRIS].y) / 2 - headRefY;
      const gazeX = (lm[L_IRIS].x + lm[R_IRIS].x) / 2 - headRefX;

      if (eyeStatus === "calibrating") {
        const ph = calibPhaseRef.current;
        calibPhaseSamples.current[ph]?.push(gazeY);
        if (ph === 1) calibHorizSamplesRef.current.push(gazeX);
      } else if (activeRef.current) {
        const neutralY = neutralRef.current ?? 0;
        const neutralX = neutralHorizRef.current ?? 0;
        const gainV = gainVRef.current * 1.32;
        const gainH = 25;
        const screenY = Math.max(
          0,
          Math.min(
            window.innerHeight - 1,
            window.innerHeight * 0.5 + (gazeY - neutralY) * gainV * window.innerHeight
          )
        );
        const screenX = Math.max(
          0,
          Math.min(
            window.innerWidth - 1,
            window.innerWidth * 0.5 - (gazeX - neutralX) * gainH * window.innerWidth
          )
        );
        recordPoint(screenX, screenY);
      }
    }

    animFrameRef.current = requestAnimationFrame(runLoopRef.current);
  }, [eyeStatus, recordPoint]);

  useEffect(() => {
    runLoopRef.current = runLoop;
  }, [runLoop]);

  const startEyeTracking = useCallback(
    async (onReady?: () => void) => {
      setEyeStatus("enabling");
      afterEyeCalibrationRef.current = onReady ?? null;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });
        const video = document.createElement("video");
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.style.cssText =
          "position:fixed;bottom:12px;right:12px;width:120px;height:90px;border-radius:10px;z-index:9000;opacity:0.85;transform:scaleX(-1);object-fit:cover;border:1px solid rgba(6,182,212,0.4)";
        document.body.appendChild(video);
        videoRef.current = video;
        await video.play();

        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
        faceLandmarkerRef.current = landmarker as FaceLandmarkerInstance;

        calibPhaseSamples.current = [[], [], []];
        calibHorizSamplesRef.current = [];
        animFrameRef.current = requestAnimationFrame(runLoop);
        setTrackingMode("eye");
        setCalibCountdown(3);
        setError(false);
        setEyeStatus("calibrating");
      } catch {
        setError(true);
        setTrackingMode("none");
        setEyeStatus("idle");
        afterEyeCalibrationRef.current = null;
        if (videoRef.current) {
          (videoRef.current.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
          videoRef.current.remove();
          videoRef.current = null;
        }
      }
    },
    [runLoop]
  );

  useEffect(() => {
    if (eyeStatus !== "calibrating") return;

    calibPhaseSamples.current = [[], [], []];
    calibHorizSamplesRef.current = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b) / arr.length : null;

    const finish = () => {
      const topG = avg(calibPhaseSamples.current[0]);
      const centerG = avg(calibPhaseSamples.current[1]);
      const bottomG = avg(calibPhaseSamples.current[2]);
      neutralRef.current = centerG ?? 0;
      if (topG !== null && bottomG !== null && bottomG - topG > 0.0005) {
        gainVRef.current = Math.min(200, Math.max(30, 0.8 / (bottomG - topG)));
      } else {
        gainVRef.current = 60;
      }
      neutralHorizRef.current = avg(calibHorizSamplesRef.current) ?? 0;
      setEyeStatus("idle");
      afterEyeCalibrationRef.current?.();
      afterEyeCalibrationRef.current = null;
    };

    const runPhase = (phase: number) => {
      calibPhaseRef.current = phase;
      setCalibPhase(phase);
      setCalibCountdown(2);
      const ci = setInterval(() => setCalibCountdown((c) => Math.max(0, c - 1)), 1000);
      intervals.push(ci);
      const t = setTimeout(() => {
        clearInterval(ci);
        if (phase < 2) runPhase(phase + 1);
        else finish();
      }, 2600);
      timers.push(t);
    };

    runPhase(0);
    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [eyeStatus]);

  const startMouseTracking = useCallback(() => {
    setTrackingMode("mouse");
    setError(false);
  }, []);

  const startPracticeOnly = useCallback(() => {
    setTrackingMode("none");
    dataReceivedRef.current = false;
    setDataReceived(false);
  }, []);

  const resetAttempt = useCallback(
    (now = Date.now()) => {
      const emptyTimes = createZoneRecord(zoneIds);
      zoneTimesRef.current = emptyTimes;
      setZoneTimes(emptyTimes);
      activeRegionRef.current = "unknown";
      candidateRegionRef.current = "unknown";
      candidateRegionSinceRef.current = now;
      questionStartTimeRef.current = now;
      earlyZoneTimesRef.current = createZoneRecord(zoneIds);
      firstPrimaryRegionRef.current = null;
      regionTransitionsRef.current = [];
      regionSwitchCountRef.current = 0;
      gazeSamplesRef.current = [];
      intentSamplesRef.current = [];
      setPointer(null);
      dataReceivedRef.current = false;
      setDataReceived(false);
      setActiveZone("unknown");
      lastTimeRef.current = now;
    },
    [zoneIds]
  );

  const finishAttempt = useCallback(
    (now = Date.now()) => {
      const previousTime = lastTimeRef.current > 0 ? lastTimeRef.current : now;
      const elapsed = now - previousTime;
      const elapsedRegion = activeRegionRef.current;
      let finalZoneTimes = zoneTimesRef.current;

      if (elapsed > 0 && isPrimaryRegion(elapsedRegion)) {
        finalZoneTimes = {
          ...zoneTimesRef.current,
          [elapsedRegion]: zoneTimesRef.current[elapsedRegion] + elapsed,
        };
        zoneTimesRef.current = finalZoneTimes;
        setZoneTimes(finalZoneTimes);
        recordEarlyDwell(elapsedRegion, previousTime, now);
      }

      lastTimeRef.current = now;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      return finalZoneTimes;
    },
    [recordEarlyDwell]
  );

  const stopTracking = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current) {
      (videoRef.current.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
      videoRef.current.remove();
      videoRef.current = null;
    }
    faceLandmarkerRef.current?.close();
    faceLandmarkerRef.current = null;
    neutralRef.current = null;
    neutralHorizRef.current = null;
    gainVRef.current = 60;
    calibPhaseSamples.current = [[], [], []];
    calibHorizSamplesRef.current = [];
    gazeSamplesRef.current = [];
    intentSamplesRef.current = [];
    activeRegionRef.current = "unknown";
    candidateRegionRef.current = "unknown";
    candidateRegionSinceRef.current = 0;
    questionStartTimeRef.current = 0;
    earlyZoneTimesRef.current = createZoneRecord(zoneIds);
    firstPrimaryRegionRef.current = null;
    regionTransitionsRef.current = [];
    regionSwitchCountRef.current = 0;
    setPointer(null);
    setEyeStatus("idle");
  }, [zoneIds]);

  const resetTracker = useCallback(() => {
    stopTracking();
    resetAttempt(0);
    setTrackingMode("none");
    dataReceivedRef.current = false;
    setDataReceived(false);
    setError(false);
    setActiveZone("unknown");
  }, [resetAttempt, stopTracking]);

  const getSnapshot = useCallback(
    (): AttentionTrackingSnapshot<ZoneId> => ({
      dataReceived: dataReceivedRef.current,
      earlyZoneTimes: { ...earlyZoneTimesRef.current },
      firstPrimaryRegion: firstPrimaryRegionRef.current,
      regionSwitchCount: regionSwitchCountRef.current,
      regionTransitions: [...regionTransitionsRef.current],
      trackingMode,
    }),
    [trackingMode]
  );

  return {
    activeZone,
    calibCountdown,
    calibPhase,
    dataReceived,
    error,
    eyeStatus,
    finishAttempt,
    getSnapshot,
    pointer,
    resetAttempt,
    resetTracker,
    setShowRing,
    showRing,
    startEyeTracking,
    startMouseTracking,
    startPracticeOnly,
    stopTracking,
    trackingActive: trackingMode !== "none",
    trackingMode,
    zonePcts,
    zoneTimes,
  };
}
