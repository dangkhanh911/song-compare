from flask import Flask
from flask_cors import CORS

from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for the app

    # Load configuration
    app.config.from_object('config')

    # Register routes
    from app.routes import main
    app.register_blueprint(main)

    return app