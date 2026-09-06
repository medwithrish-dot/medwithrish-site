"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, Check, CheckCircle2, Clock3, Headphones, Mic, MonitorPlay, ShieldCheck, SlidersHorizontal, Sparkles, Video, VideoOff, Volume2 } from "lucide-react";
import { interviewUniversities } from "../_data/universities";
import { findInterviewStation, interviewStations } from "../_data/interview-stations";
import type { InterviewMode } from "../_lib/interview-types";
import type { useInterviewDevices } from "../_lib/useInterviewDevices";
import { InterviewDevicePreview } from "./InterviewDevicePreview";
import styles from "./AIInterviewRoom.module.css";

export type InterviewRoomPlan = {
  mode: InterviewMode;
  universitySlug?: string;
  stationSlugs: string[];
  preparationSeconds: number;
  stationSeconds: number;
  breakSeconds: number;
};

type Props = {
  initialUniversitySlug?: string;
  initialStationSlug?: string;
  initialPlan?: InterviewRoomPlan | null;
  devices: ReturnType<typeof useInterviewDevices>;
  readAloud: boolean;
  setReadAloud: (enabled: boolean) => void;
  voiceRate: number;
  setVoiceRate: (rate: number) => void;
  voiceSupported: boolean;
  speaking: boolean;
  onTestVoice: () => void;
  onStopVoice: () => void;
  microphoneConsent: boolean;
  setMicrophoneConsent: (enabled: boolean) => void;
  speechSupported: boolean;
  isPremium: boolean;
  busy: boolean;
  onStart: (plan: InterviewRoomPlan, preview: boolean) => void;
};

export function AIInterviewSetup(props: Props) {
  const initialStation = findInterviewStation(props.initialStationSlug ?? "why-medicine");
  const [preset, setPreset] = useState<"free" | "custom" | "university">(props.initialPlan ? props.initialPlan.mode === "university" ? "university" : props.initialPlan.mode === "free" ? "free" : "custom" : props.initialUniversitySlug ? "university" : initialStation?.slug !== "why-medicine" ? "custom" : "free");
  const [universitySlug, setUniversitySlug] = useState(props.initialPlan?.universitySlug ?? props.initialUniversitySlug ?? interviewUniversities[0].slug);
  const [selected, setSelected] = useState<string[]>(props.initialPlan?.stationSlugs ?? (props.initialUniversitySlug ? interviewStations.slice(0, Math.min(9, interviewUniversities.find((item) => item.slug === props.initialUniversitySlug)?.stationCount ?? 5)).map((item) => item.slug) : [initialStation?.slug ?? "why-medicine"]));
  const university = interviewUniversities.find((item) => item.slug === universitySlug) ?? interviewUniversities[0];
  const stationSlugs = interviewStations.filter((item) => selected.includes(item.slug)).map((item) => item.slug);
  const plan: InterviewRoomPlan = {
    mode: preset === "free" ? "free" : preset === "university" ? "university" : stationSlugs.length === 1 ? (stationSlugs[0] === "why-medicine" ? "free" : "station") : "reference",
    universitySlug: preset === "university" ? universitySlug : undefined,
    stationSlugs,
    preparationSeconds: preset === "university" ? university.preparationSeconds : stationSlugs.length > 1 ? 0 : 60,
    stationSeconds: preset === "university" ? university.stationSeconds : 480,
    breakSeconds: preset === "university" ? university.breakSeconds : stationSlugs.length > 1 ? 120 : 0,
  };
  const duration = Math.ceil((stationSlugs.length * (plan.preparationSeconds + plan.stationSeconds) + Math.max(0, stationSlugs.length - 1) * plan.breakSeconds) / 60);
  const changePreset = (value: typeof preset) => {
    setPreset(value);
    setSelected(value === "free" ? ["why-medicine"] : interviewStations.slice(0, value === "university" ? Math.min(9, university.stationCount) : 5).map((item) => item.slug));
  };
  const device = props.devices;

  return <div className={styles.setup}>
    <div className={styles.setupHeading}><div><p className={styles.eyebrow}><span className={styles.greenDot} /> YOUR INTERVIEW LOBBY</p><h1>Make this practice yours.</h1><p>Choose your stations, find your voice, and settle in. We’ll take it one question at a time.</p></div><span className={styles.softBadge}><ShieldCheck size={15} /> A little space to build confidence</span></div>
    <div className={styles.setupGrid}>
      <section className={styles.setupCard} aria-labelledby="stations-heading">
        <div className={styles.cardHeading}><span className={styles.sectionIcon}><SlidersHorizontal size={19} /></span><div><h2 id="stations-heading">Build your interview</h2><p>Keep what you need. Skip what you don’t.</p></div></div>
        <div className={styles.presetPicker} aria-label="Interview format">{([['free', 'Free station'], ['custom', 'Custom circuit'], ['university', 'University']] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={preset === value} onClick={() => changePreset(value)}>{label}</button>)}</div>
        {preset === "university" && <div className={styles.universityChoice}><label htmlFor="room-university">Your university</label><select id="room-university" value={universitySlug} onChange={(event) => { setUniversitySlug(event.target.value); const entry = interviewUniversities.find((item) => item.slug === event.target.value)!; setSelected(interviewStations.slice(0, Math.min(9, entry.stationCount)).map((item) => item.slug)); }}>{interviewUniversities.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}</select><p>{university.format} practice · {plan.stationSeconds / 60} min per station. You can customise the topics below.</p><details><summary>About these practice timings</summary><p>{university.timingNote} Your selected topics form a custom rehearsal.</p><a href={university.sourceUrl} target="_blank" rel="noreferrer">View format source ↗</a></details></div>}
        <div className={styles.stationListHeading}><span>{selected.length} {selected.length === 1 ? "station" : "stations"} included</span>{preset !== "free" && <div><button type="button" onClick={() => setSelected(interviewStations.map((item) => item.slug))}>Select all</button><span>·</span><button type="button" onClick={() => setSelected([])}>Clear</button></div>}</div>
        <div className={styles.stationList}>{interviewStations.map((station, index) => {
          const included = selected.includes(station.slug);
          const locked = preset === "free" && index !== 0;
          return <label key={station.slug} className={`${styles.stationOption} ${included ? styles.stationSelected : ""} ${locked ? styles.stationLocked : ""}`}>
            <input type="checkbox" checked={included} disabled={locked || preset === "free"} onChange={() => setSelected((current) => current.includes(station.slug) ? current.filter((slug) => slug !== station.slug) : [...current, station.slug])} />
            <span className={styles.stationNumber}>{String(index + 1).padStart(2, "0")}</span><span className={styles.stationName}><strong>{station.title}</strong><span>{station.theme} <span>·</span> 3 prompts</span></span><span className={styles.stationState}>{included ? <Check size={15} /> : locked ? "Custom" : "Skip"}</span>
          </label>;
        })}</div>
        <p className={styles.smallNote}><Sparkles size={14} /> Original practice questions. Feedback focuses on the content of your answers.</p>
      </section>

      <section className={styles.setupCard} aria-labelledby="devices-heading">
        <div className={styles.cardHeading}><span className={styles.sectionIcon}><Headphones size={19} /></span><div><h2 id="devices-heading">Your sound. Your space.</h2><p>A quick check before you join.</p></div></div>
        <InterviewDevicePreview stream={device.stream} />
        <div className={styles.deviceActions}><button type="button" className={styles.secondaryButton} onClick={() => void device.toggleCamera()} disabled={device.cameraPending} aria-pressed={device.cameraEnabled}>{device.cameraEnabled ? <Video size={16} /> : <VideoOff size={16} />}{device.cameraPending ? "Connecting…" : device.cameraEnabled ? "Turn camera off" : "Turn camera on"}</button><span>Optional · local preview only</span></div>
        {device.cameraError && <p role="status" className={styles.deviceError}>{device.cameraError}</p>}
        <div className={styles.deviceSection}><div className={styles.rowBetween}><h3><Mic size={16} /> Microphone check</h3>{device.micChecked && <span className={styles.successLabel}><CheckCircle2 size={13} /> Input detected</span>}</div><p>Say: “I’m ready to practise my interview.”</p><div className={styles.micCheck}><div className={styles.levelMeter} role="meter" aria-label="Microphone input level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(device.micLevel * 100)}>{Array.from({ length: 24 }, (_, i) => <span key={i} style={{ background: device.micLevel * 24 > i ? "#178c78" : undefined }} />)}</div><button type="button" className={styles.textButton} onClick={() => { props.onStopVoice(); if (device.micChecking) device.stopMicCheck(); else void device.startMicCheck(); }}>{device.micChecking ? "Stop test" : device.micChecked ? "Test again" : "Test mic"}</button></div><p className={styles.smallNote}>{device.micChecking ? "Listening for 8 seconds… this check isn’t recorded." : "Checks input volume. You can always type instead."}</p>{device.micError && <p role="status" className={styles.deviceError}>{device.micError}</p>}</div>
        <div className={styles.deviceSection}><div className={styles.rowBetween}><h3><AudioLines size={16} /> Interviewer voice</h3><button type="button" role="switch" aria-checked={props.readAloud} aria-label="Read questions aloud" className={styles.toggle} onClick={() => props.setReadAloud(!props.readAloud)}><span /></button></div><p>Questions appear in your transcript as they’re read aloud.</p><div className={styles.voiceControls}><label>Speaking pace<select value={props.voiceRate} onChange={(event) => props.setVoiceRate(Number(event.target.value))}><option value={0.8}>Relaxed</option><option value={0.95}>Natural</option><option value={1.1}>Brisk</option></select></label><button type="button" className={styles.secondaryButton} disabled={!props.voiceSupported} onClick={props.onTestVoice}><Volume2 size={15} />{props.speaking ? "Stop voice" : "Try voice"}</button></div>{!props.voiceSupported && <p className={styles.smallNote}>Read-aloud is unavailable here. All questions remain on screen.</p>}</div>
        <label className={styles.consent}><input type="checkbox" checked={props.microphoneConsent} disabled={!props.speechSupported} onChange={(event) => props.setMicrophoneConsent(event.target.checked)} /><span>Enable spoken answers<span>Your browser’s speech service may process audio. Phloem saves your transcript, never an audio or video recording.</span></span></label>
        {!props.speechSupported && <p className={styles.smallNote}>Speech recognition isn’t supported in this browser. Typed answers work throughout.</p>}
      </section>
    </div>
    <div className={styles.joinBar}><div><strong>{stationSlugs.length ? `${stationSlugs.length} ${stationSlugs.length === 1 ? "station" : "stations"}. Your next step forward.` : "Choose at least one station"}</strong><p><Clock3 size={14} /> About {duration} min <span>·</span> {plan.preparationSeconds ? `${plan.preparationSeconds / 60} min reading time` : "Start with your first question"} <span>·</span> Feedback after each station</p>{!props.isPremium && plan.mode !== "free" && <p>Scored custom and university interviews require <Link href="/phloemai/pricing">membership</Link>. Preview is free.</p>}</div><div className={styles.joinActions}><button type="button" className={styles.secondaryButton} disabled={props.busy || !stationSlugs.length} onClick={() => props.onStart(plan, true)}><MonitorPlay size={17} /> Preview room</button><button type="button" className={styles.primaryButton} disabled={props.busy || !stationSlugs.length} onClick={() => props.onStart(plan, false)}>Join interview <ArrowRight size={17} /></button></div></div>
    <p className={styles.lobbyFootnote}>Your timer only starts when you join. Camera off is completely fine.</p>
  </div>;
}
