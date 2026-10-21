# Song Compare

## Run with Docker

Build the image and start the app:

```sh
docker build -t song-compare .
docker run --rm -p 5000:5000 song-compare
```

Open http://localhost:5000.

The image installs the Python dependencies listed in `requirements.txt` and runs
the Flask app with Gunicorn. The `/fetch/<youtube_id>` endpoint uses `yt-dlp` to
retrieve YouTube Music metadata, so the container needs internet access.

## Run locally

```sh
python -m pip install -r requirements.txt
python run.py
```
