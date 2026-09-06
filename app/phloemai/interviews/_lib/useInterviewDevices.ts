"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Device checks and self-view stay in this browser; no recording is created. */
export function useInterviewDevices() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraPending, setCameraPending] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [micChecking, setMicChecking] = useState(false);
  const [micChecked, setMicChecked] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micError, setMicError] = useState("");
  const cameraRef = useRef<MediaStream | null>(null);
  const cameraRequest = useRef(0);
  const micRequest = useRef(0);
  const cameraBusy = useRef(false);
  const micCleanup = useRef<(() => void) | null>(null);
  const mounted = useRef(true);

  const stopCamera = useCallback(() => {
    cameraRequest.current += 1;
    cameraBusy.current = false;
    cameraRef.current?.getTracks().forEach((track) => track.stop());
    cameraRef.current = null;
    if (mounted.current) { setStream(null); setCameraPending(false); }
  }, []);

  const toggleCamera = useCallback(async () => {
    if (cameraRef.current || cameraBusy.current) { stopCamera(); return; }
    const request = ++cameraRequest.current;
    cameraBusy.current = true;
    setCameraPending(true);
    setCameraError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (!mounted.current || request !== cameraRequest.current) { media.getTracks().forEach((track) => track.stop()); return; }
      cameraRef.current = media;
      setStream(media);
      media.getVideoTracks()[0]?.addEventListener("ended", stopCamera, { once: true });
    } catch {
      if (mounted.current && request === cameraRequest.current) setCameraError("Camera unavailable. Check browser permissions or continue with video off.");
    } finally {
      if (mounted.current && request === cameraRequest.current) { cameraBusy.current = false; setCameraPending(false); }
    }
  }, [stopCamera]);

  const stopMicCheck = useCallback(() => {
    micRequest.current += 1;
    micCleanup.current?.();
    micCleanup.current = null;
    if (mounted.current) { setMicChecking(false); setMicLevel(0); }
  }, []);

  const startMicCheck = useCallback(async () => {
    stopMicCheck();
    const request = ++micRequest.current;
    setMicChecking(true);
    setMicChecked(false);
    setMicError("");
    let media: MediaStream | null = null;
    let context: AudioContext | null = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      media = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (!mounted.current || request !== micRequest.current) { media.getTracks().forEach((track) => track.stop()); return; }
      context = new AudioContext();
      const source = context.createMediaStreamSource(media);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      let peak = 0;
      let animation = 0;
      const meter = () => {
        analyser.getByteTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0) / samples.length);
        peak = Math.max(peak, rms);
        setMicLevel(Math.min(1, rms * 7));
        animation = requestAnimationFrame(meter);
      };
      const timer = window.setTimeout(() => {
        setMicChecked(peak > 0.01);
        if (peak <= 0.01) setMicError("No clear input detected. Try speaking closer to your microphone, or continue by typing.");
        stopMicCheck();
      }, 8_000);
      micCleanup.current = () => {
        cancelAnimationFrame(animation);
        window.clearTimeout(timer);
        source.disconnect();
        media?.getTracks().forEach((track) => track.stop());
        void context?.close().catch(() => {});
      };
      await context.resume();
      if (mounted.current && request === micRequest.current) meter();
    } catch {
      media?.getTracks().forEach((track) => track.stop());
      if (context && context.state !== "closed") void context.close().catch(() => {});
      if (mounted.current && request === micRequest.current) {
        stopMicCheck();
        setMicError("Microphone unavailable. Check browser permissions or use typed answers.");
      }
    }
  }, [stopMicCheck]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; stopCamera(); stopMicCheck(); };
  }, [stopCamera, stopMicCheck]);

  return { stream, cameraEnabled: Boolean(stream), cameraPending, cameraError, toggleCamera, stopCamera, micChecking, micChecked, micLevel, micError, startMicCheck, stopMicCheck };
}
