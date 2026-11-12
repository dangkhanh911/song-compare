from app import Song, songs
from app.audio_files import audio_file_path
import librosa

def analyze_song(song):
    # Load the audio file using librosa
    y, sr = librosa.load(audio_file_path(song.youtubeId), sr=None)

    # Extract features
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    chroma_stft = librosa.feature.chroma_stft(y=y, sr=sr)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
    
    json_data = {
        "title": song.title,
        "artist": song.artist,
        "tempo": tempo,
        "chroma_stft_mean": chroma_stft.mean(),
        "spectral_centroid_mean": spectral_centroid.mean(),
        "zero_crossing_rate_mean": zero_crossing_rate.mean()
    }

    # return the JSON data
    return json_data
