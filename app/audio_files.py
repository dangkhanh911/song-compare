from pathlib import Path


DOWNLOADS_DIR = Path(__file__).resolve().parent.parent / "downloads"


def audio_file_path(youtube_id: str) -> Path:
    return DOWNLOADS_DIR / f"{youtube_id}.mp3"
