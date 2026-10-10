"""Scan fixed interview audio for decoding errors, clipping and isolated spikes.

Requires numpy and imageio-ffmpeg. Writes measurements, not a listening verdict.
Usage: python scripts/audit-interview-audio.py --output <report.json>
"""
import argparse
import json
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import imageio_ffmpeg
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def measure(path):
    decoded = subprocess.run(
        [FFMPEG, "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
        capture_output=True,
    )
    samples = np.frombuffer(decoded.stdout, dtype="<f4")
    row = {"file": str(path.relative_to(ROOT)).replace("\\", "/")}
    if decoded.returncode or not len(samples):
        return {**row, "flags": ["decode-error"]}
    absolute = np.abs(samples)
    frames = samples[:len(samples) // 320 * 320].reshape(-1, 320)
    rms = np.sqrt(np.mean(frames ** 2, axis=1))
    voiced = rms[rms > 0.01]
    median = float(np.median(voiced)) if len(voiced) else 0
    clip = float(np.mean(absolute >= 0.99))
    spike = float(np.max(rms) / max(median, 0.00001))
    flags = []
    if clip > 0.001:
        flags.append("clipping")
    if spike > 6:
        flags.append("volume-spike")
    if median == 0:
        flags.append("silent")
    return {**row, "seconds": round(len(samples) / 16000, 3),
            "peak": round(float(absolute.max()), 4), "clippedFraction": round(clip, 6),
            "spikeRatio": round(spike, 2), "flags": flags}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True)
    parser.add_argument("--tame-spikes", action="store_true", help="Compress only flagged volume spikes, then measure again. Regenerate distorted speech first.")
    args = parser.parse_args()
    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(measure, sorted((ROOT / "public/audio").glob("*/*.mp3"))))
    if args.tame_spikes:
        for row in rows:
            if "volume-spike" not in row["flags"]:
                continue
            target = ROOT / row["file"]
            with tempfile.TemporaryDirectory(prefix="interview-audio-") as directory:
                output = Path(directory) / "limited.mp3"
                subprocess.run([FFMPEG, "-v", "error", "-i", str(target), "-af",
                                "acompressor=threshold=0.1:ratio=4:attack=1:release=50:makeup=1,alimiter=limit=0.85:level=false",
                                "-b:a", "128k", str(output)], check=True)
                target.write_bytes(output.read_bytes())
            row.update(measure(target))
    Path(args.output).write_text(json.dumps(rows, indent=2), encoding="utf-8")
    flagged = [row for row in rows if row["flags"]]
    print(json.dumps({"scanned": len(rows), "flagged": flagged}, indent=2))
