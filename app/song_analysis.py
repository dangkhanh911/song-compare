from app import Song, songs
from app.audio_files import audio_file_path
import librosa
import numpy as np

NOTE_NAMES = [
    "C", "C#", "D", "D#", "E", "F",
    "F#", "G", "G#", "A", "A#", "B"
]

# Krumhansl-Schmuckler key profiles
MAJOR_PROFILE = np.array([
    6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
    2.52, 5.19, 2.39, 3.66, 2.29, 2.88
])

MINOR_PROFILE = np.array([
    6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
    2.54, 4.75, 3.98, 2.69, 3.34, 3.17
])

def analyze_song(song):
    # Load the audio file using librosa
    y, sr = librosa.load(audio_file_path(song.youtubeId), sr=None)

    # Extract features
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
    harmonic, percussive = librosa.effects.hpss(y)

    json_data = {
        "title": song.title,
        "artist": song.artist,
        "tempo": tempo,
        "chroma_stft_mean": chroma_stft.mean(),
        "spectral_centroid_mean": spectral_centroid.mean(),
        "zero_crossing_rate_mean": zero_crossing_rate.mean(),
        "harmonic_mean": harmonic.mean(),
        "percussive_mean": percussive.mean(),
    }

    # return the JSON data
    return json_data
