from flask import render_template, request, send_file
from flask import Blueprint, jsonify, current_app
from app import Song, songs
from app.audio_files import DOWNLOADS_DIR, audio_file_path
import subprocess
import json
import yt_dlp
from urllib.parse import quote
import datetime
from app.song_analysis import analyze_song

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

    print("Updated songs:", songs[0].title, songs[1].title)

    for song in songs:
        if not audio_file_path(song.youtubeId).is_file():
            print(f"Downloading song: {song.title} by {song.artist}")
            download_song(song.youtubeId)
        else:
            print(f"Song already downloaded: {song.title} by {song.artist}")

    json_song_0 = analyze_song(songs[0])
    json_song_1 = analyze_song(songs[1])

    print(json_song_0)
    print(json_song_1)

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
            timeout=45
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
            "duration": str(datetime.timedelta(seconds=data.get("duration", 0)))
        }, 200

    except subprocess.TimeoutExpired:
        return {"error": "Metadata request timed out"}, 504
    except subprocess.CalledProcessError:
        return {"error": "Could not retrieve YouTube metadata"}, 502
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {"error": "Internal server error"}, 500


@main.route('/download/<youtube_id>', methods=["GET"])
def download_song(youtube_id):
    # Validate YouTube video ID
    if not youtube_id or len(youtube_id) != 11:
        return jsonify({"error": "Invalid YouTube video ID"}), 400

    # If file already exists, send it directly
    file_path = audio_file_path(youtube_id)
    if file_path.is_file():
        print(f"File already exists: {file_path}. Sending file.")
        return send_file(file_path, as_attachment=True)

    url = f"https://music.youtube.com/watch?v={youtube_id}"

    try:
        DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)

        # Use yt-dlp to download the song
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": str(DOWNLOADS_DIR / f"{youtube_id}.%(ext)s"),
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

        return send_file(file_path, as_attachment=True)
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
        "extract_flat": "in_playlist",  
        "skip_download": True,         
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