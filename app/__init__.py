from flask import Flask
from flask_cors import CORS

class Song:
    def __init__(self, index, title, youtubeId, artist, album, year, duration):
        self.index = index
        self.title = title
        self.youtubeId = youtubeId
        self.artist = artist
        self.album = album
        self.year = year
        self.duration = duration

# Create a list of songs
songs = [Song(index=0, title="Song 1", youtubeId="abc123", artist="Artist 1", album="Album 1", year=2020, duration=210),
         Song(index=1, title="Song 2", youtubeId="def456", artist="Artist 2", album="Album 2", year=2021, duration=180)]

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for the app

    # Register routes
    from app.routes import main
    app.register_blueprint(main)

    return app