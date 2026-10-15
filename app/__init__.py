from flask import Flask
from flask_cors import CORS

class Song:
    def __init__(self, index, title, youtubeId, artist, album, year):
        self.index = index
        self.title = title
        self.youtubeId = youtubeId
        self.artist = artist
        self.album = album
        self.year = year

# Create a list of songs
songs = [
    Song(0, "Midnight Drive", "EjTXTAiZPXs", "Artist 1", "Album 1", 2020),
    Song(1, "Better in Blue", "boKJ5XDs_mY", "Artist 2", "Album 2", 2021)
]

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for the app

    # Load configuration
    app.config.from_object('config')

    # Register routes
    from app.routes import main
    app.register_blueprint(main)

    return app