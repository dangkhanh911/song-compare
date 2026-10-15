from flask import render_template, request
from flask import Blueprint, jsonify
from app import Song, songs


main = Blueprint('main', __name__) # Create a Blueprint for the main routes
    
@main.route('/')
def index():
    return render_template('index.html', songs=songs)

@main.route('/songs', methods=['POST'])
def receive_songs():
    data = request.get_json()  # Parse JSON data from the request
    receive_songs = [Song(**song) for song in data]  # Create Song objects
    print("Received songs:", songs)

    songs[0] = receive_songs[0]
    songs[1] = receive_songs[1]

    print("Updated songs:", songs.title)
    return jsonify({"message": "Songs received successfully!"})

def compare_songs(song1, song2):
    # Compare songs based on their attributes
    return (song1.title == song2.title and
            song1.youtube_id == song2.youtube_id and
            song1.artist == song2.artist and
            song1.album == song2.album and
            song1.year == song2.year)