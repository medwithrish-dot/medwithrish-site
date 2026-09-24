import argparse
import csv
import random
import time
from pathlib import Path
from google.cloud import texttospeech

SCRIPT_FOLDER = Path(__file__).resolve().parent
PROJECT_FOLDER = SCRIPT_FOLDER.parent

CSV_FILE = SCRIPT_FOLDER / "questions.csv"
AUDIO_FOLDER = PROJECT_FOLDER / "public" / "audio"

VOICES = {
    "male": "en-GB-Chirp3-HD-Charon",
    "female": "en-GB-Chirp3-HD-Aoede",
}

LANGUAGE = "en-GB"

def parse_args():
    parser = argparse.ArgumentParser(description="Generate missing interview MP3s with Google Chirp 3 HD.")
    parser.add_argument("--force", action="store_true", help="Replace audio files that already exist.")
    parser.add_argument("--dry-run", action="store_true", help="List work without calling Google Cloud.")
    parser.add_argument("--ids", nargs="*", type=int, help="Generate only these numeric CSV IDs.")
    parser.add_argument("--limit", type=int, help="Stop after this many CSV rows (useful for a voice test).")
    return parser.parse_args()


def read_questions():
    with open(CSV_FILE, newline="", encoding="utf-8-sig") as file:
        rows = list(csv.DictReader(file))
    expected = list(range(1, len(rows) + 1))
    actual = [int(row["id"].strip()) for row in rows]
    if actual != expected:
        raise ValueError("questions.csv IDs must be unique and contiguous from 1")
    if any(not row["question"].strip() for row in rows):
        raise ValueError("questions.csv contains an empty question or prompt")
    return rows


def generate_audio(client, question_id, question, voice_type, voice_name, *, force=False, dry_run=False):
    folder = AUDIO_FOLDER / voice_type
    folder.mkdir(parents=True, exist_ok=True)

    filename = folder / f"q{int(question_id):03d}.mp3"

    if filename.exists() and not force:
        print(f"Skipping: {filename.name}")
        return

    if dry_run:
        print(f"Would create {voice_type}: {filename.name} — {question}")
        return

    synthesis_input = texttospeech.SynthesisInput(text=question)

    voice = texttospeech.VoiceSelectionParams(
        language_code=LANGUAGE,
        name=voice_name
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    for attempt in range(1, 4):
        try:
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            break
        except Exception:
            if attempt == 3:
                raise
            delay = (2 ** (attempt - 1)) + random.random()
            print(f"Retrying {voice_type} {filename.name} in {delay:.1f}s")
            time.sleep(delay)

    with open(filename, "wb") as file:
        file.write(response.audio_content)

    print(f"Created {voice_type}: {filename.name}")


def main():
    args = parse_args()
    selected_ids = set(args.ids or [])
    rows = read_questions()
    unknown_ids = selected_ids.difference(range(1, len(rows) + 1))
    if unknown_ids:
        raise ValueError(f"Unknown CSV IDs: {sorted(unknown_ids)}")
    client = None if args.dry_run else texttospeech.TextToSpeechClient()

    for index, row in enumerate(rows, start=1):
        if args.limit is not None and index > args.limit:
            break

        question_id = row["id"].strip()
        question = row["question"].strip()
        if selected_ids and int(question_id) not in selected_ids:
            continue

        for voice_type, voice_name in VOICES.items():
            try:
                generate_audio(
                    client,
                    question_id,
                    question,
                    voice_type,
                    voice_name,
                    force=args.force,
                    dry_run=args.dry_run,
                )
            except Exception as error:
                print(
                    f"ERROR question {question_id} "
                    f"({voice_type}): {error}"
                )

            if not args.dry_run:
                time.sleep(0.4)

    print("\nFinished!")


if __name__ == "__main__":
    main()
