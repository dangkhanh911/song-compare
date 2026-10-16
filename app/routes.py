from flask import render_template, request
from flask import Blueprint, jsonify
from app import Song, songs
import subprocess

main = Blueprint('main', __name__) # Create a Blueprint for the main routes
    
@main.route('/')
def index():
    return render_template('index.html', songs=songs)

@main.route('/songs', methods=['POST'])
def receive_songs():
    data = request.get_json()  # Parse JSON data from the request
    receive_songs = [Song(**song) for song in data]  # Create Song objects

    songs[0] = receive_songs[0]
    songs[1] = receive_songs[1]

    print("Updated songs:", songs[0].title)
    return jsonify({"message": "Songs received successfully!"})

@main.route('/search/<youtube_id>', methods=["GET"])
def get_song_metadata(youtube_id):
    # Validate YouTube video ID
    if not youtube_id.replace("-", "").replace("_", "").isalnum() or len(youtube_id) != 11:
        return jsonify({"error": "Invalid YouTube ID"}), 400

    url = f"https://music.youtube.com/watch?v={youtube_id}"

    try:
        result = subprocess.run(
            [
                "yt-dlp",
                "--dump-single-json",
                "--skip-download",
                "--no-warnings",
                "--no-playlist",
                url
            ],
            capture_output=True,
            text=True,
            check=True,
            timeout=30
        )

        data = json.loads(result.stdout)

        artists = data.get("artists") or []
        artist = ", ".join(artists) or data.get("artist") or data.get("uploader")

        release_date = data.get("release_date") or ""
        year = data.get("release_year")

        if not year and len(release_date) >= 4:
            year = release_date[:4]

        return jsonify({
            "title": data.get("track") or data.get("title"),
            "artist": artist,
            "album": data.get("album"),
            "year": year,
            "duration": data.get("duration")
        })

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Metadata request timed out"}), 504
    except subprocess.CalledProcessError:
        return jsonify({"error": "Could not retrieve YouTube metadata"}), 502