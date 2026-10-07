from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config.from_object('config')

    with app.app_context():
        from . import routes  # Import routes
        return app
    
class song:
    def __init__(self, name, artist, album, year):
        self.name = name
        self.artist = artist
        self.album = album
        self.year = year

class album:
    def __init__(self, name, artist, year):
        self.name = name
        self.artist = artist
        self.year = year

class artist:
    def __init__(self, name, album):
        self.name = name
        self.album = album