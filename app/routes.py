from flask import render_template, request, send_file
from flask import Blueprint, jsonify, current_app
from app import Song, songs
import subprocess
import json
import yt_dlp
from urllib.parse import quote
import datetime

main = Blueprint('main', __name__)


@main.route('/')
def index():
    return render_template('index.html', songs=songs)
    

@main.route('/search_results')
def search_results():
    return render_template('search.html', 
                query=request.args.get('q'), 
                index=request.args.get('index'))


@main.route('/songs', methods=['POST'])
def receive_songs():
    data = request.get_json()  # Parse JSON data from the request
    receive_songs = [Song(**song) for song in data]  # Create Song objects

    songs[0] = receive_songs[0]
    songs[1] = receive_songs[1]

    print("Updated songs:", songs[0].title)
    return jsonify({"message": "Songs received successfully!"})


@main.route('/fetch/<youtube_id>', methods=["GET"])
def fetch(youtube_id):
    # Validate YouTube video ID
    if not youtube_id or len(youtube_id) != 11:
        return {"error": "Invalid YouTube video ID"}, 400

    url = f"https://music.youtube.com/watch?v={youtube_id}"

    try:
        # Use yt-dlp to fetch metadata without downloading the video
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
            timeout=10
        )

        # Parse the JSON output from yt-dlp
        data = json.loads(result.stdout)

        artists = data.get("artists") or []
        artist = ", ".join(artists) or data.get("artist") or data.get("uploader")

        release_date = data.get("release_date") or ""
        year = data.get("release_year")

        if not year and len(release_date) >= 4:
            year = release_date[:4]

        return {
            "title": data.get("track") or data.get("title"),
            "artist": artist,
            "album": data.get("album"),
            "year": year,
            # "duration": data.get("duration")
            "duration": str(datetime.timedelta(seconds=data.get("duration", 0)))
        }, 200

    except subprocess.TimeoutExpired:
        return {"error": "Metadata request timed out"}, 504
    except subprocess.CalledProcessError:
        return {"error": "Could not retrieve YouTube metadata"}, 502


@main.route('/download/<youtube_id>', methods=["GET"])
def download_song(youtube_id):
    # Validate YouTube video ID
    if not youtube_id or len(youtube_id) != 11:
        return jsonify({"error": "Invalid YouTube video ID"}), 400

    url = f"https://music.youtube.com/watch?v={youtube_id}"

    try:
        # Use yt-dlp to download the song
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": f"downloads/{youtube_id}.%(ext)s",
            "quiet": True,
            "no_warnings": True,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        return send_file(f"../downloads/{youtube_id}.mp3", as_attachment=True)
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Download request timed out"}), 504
    except subprocess.CalledProcessError:
        return jsonify({"error": "Could not download the song"}), 502


@main.route('/search')
def search_music():
    # Get the search query from the request parameters
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({"error": "Vui lòng nhập từ khóa"}), 400

    # Use yt-dlp to search for music on YouTube Music
    options = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "playlistend": 20,
    }

    try:
        search_url = ("https://music.youtube.com/search?q=" + quote(query))

        with yt_dlp.YoutubeDL(options) as ydl:
            result = ydl.extract_info(
                search_url,
                download=False
            )

        entries = (result or {}).get("entries") or []
        songs = []

        for item in entries:
            if not item:
                continue
            
            video_id = item.get("id")

            response, status_code = fetch(video_id)

            if status_code == 200 and response.get("album") != None:
                response.update({
                    "youtubeId": video_id
                })
                songs.append(response)

        return jsonify(songs), 200

    except Exception:
        current_app.logger.exception("YouTube Music search failed")
        return jsonify({
            "error": "Không thể tìm kiếm nhạc. Vui lòng thử lại."
        }), 500