import csv
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

# Test only 3 questions first
TEST_LIMIT = None

client = texttospeech.TextToSpeechClient()


def generate_audio(question_id, question, voice_type, voice_name):
    folder = AUDIO_FOLDER / voice_type
    folder.mkdir(parents=True, exist_ok=True)

    filename = folder / f"q{int(question_id):03d}.mp3"

    if filename.exists():
        print(f"Skipping: {filename.name}")
        return

    synthesis_input = texttospeech.SynthesisInput(text=question)

    voice = texttospeech.VoiceSelectionParams(
        language_code=LANGUAGE,
        name=voice_name
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    with open(filename, "wb") as file:
        file.write(response.audio_content)

    print(f"Created {voice_type}: {filename.name}")


with open(CSV_FILE, newline="", encoding="utf-8-sig") as file:
    reader = csv.DictReader(file)

    for index, row in enumerate(reader, start=1):

        if TEST_LIMIT is not None and index > TEST_LIMIT:
            break

        question_id = row["id"].strip()
        question = row["question"].strip()

        if not question:
            continue

        for voice_type, voice_name in VOICES.items():
            try:
                generate_audio(
                    question_id,
                    question,
                    voice_type,
                    voice_name
                )
            except Exception as error:
                print(
                    f"ERROR question {question_id} "
                    f"({voice_type}): {error}"
                )

            time.sleep(0.4)

print("\nFinished!")