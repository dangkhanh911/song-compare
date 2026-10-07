from flask import render_template
from flask import current_app as app  # Use the app context
from ytmusicapi import YTMusic

@app.route('/')
def home():
    return render_template('index.html')