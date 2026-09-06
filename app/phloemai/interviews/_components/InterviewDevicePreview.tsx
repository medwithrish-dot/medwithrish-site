"use client";

import { useEffect, useRef } from "react";
import { VideoOff } from "lucide-react";
import styles from "./AIInterviewRoom.module.css";

export function InterviewDevicePreview({ stream, compact = false }: { stream: MediaStream | null; compact?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (element) element.srcObject = stream;
    return () => { if (element) element.srcObject = null; };
  }, [stream]);
  return <div className={`${styles.selfPreview} ${compact ? styles.compactPreview : ""}`}>
    {stream ? <video ref={video} autoPlay muted playsInline aria-label="Your local camera preview" /> : <div className={styles.cameraPlaceholder}><span className={styles.selfAvatar}>Y</span>{!compact && <p>Get comfortable. This is your space.</p>}</div>}
    <span className={styles.previewLabel}>You <span>· {stream ? "Only visible to you" : "Camera off"}</span></span>
    {!stream && <VideoOff size={15} className={styles.previewIcon} aria-hidden="true" />}
  </div>;
}
