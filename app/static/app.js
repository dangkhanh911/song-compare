let player = null;

class Song {
    constructor(title, youtubeId, artist, album, year, coverImage) {
        this.artist = artist;
        this.album = album;
        this.year = year;
        this.title = title;
        this.youtubeId = youtubeId;
        this.coverImage = coverImage || "default_cover_image.png"; // default cover image
    }
}

const songs = [
    new Song("Midnight Drive", "EjTXTAiZPXs", "Artist 1", "Album 1", 2020),
    new Song("Better in Blue", "boKJ5XDs_mY", "Artist 2", "Album 2", 2021)
];

function loadSongs() {
    album_0.value = songs[0].album;
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
        height: "1",
        width: "1",
        videoId: songs[0].youtubeId,
        playerVars: {
            autoplay: 0,
            controls: 0
        },

        events: {
            onReady: function () {
                console.log("YouTube player ready");
            }
        }
    });
}

function searchSong(songIndex) {
    let query = "";
    if (songIndex === 0) {
        query = song0TextInput.value;
    }
    else if (songIndex === 1) {
        query = song1TextInput.value;
    }

    const searchUrl = `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, "videoWindow", "width=800,height=600");

    // after choosing a song, update the song title and youtubeId in the songs array
    function updateSong(youtubeId, title) {
        songs[songIndex].youtubeId = youtubeId;
        songs[songIndex].title = title;

        // update the song title in the UI
        const songTitleElement = document.getElementById(`song${songIndex}-title`);
        songTitleElement.textContent = title;
    }
}

function playSong(index) {
    if (!player) {
        return;
    }

    player.loadVideoById(
        songs[index].youtubeId
    );

    player.playVideo();
}

function pauseSong() {
    if (!player) {
        return;
    }

    player.pauseVideo();
}

function togglePlayPause(button, songIndex) {
    if (button.textContent.trim() === "▶") {
        button.textContent = "⏸";
        playSong(songIndex);
    } else {
        button.textContent = "▶";
        pauseSong();
    }

    // if song ended, reset button text to play
    player.addEventListener("onStateChange", function (event) {
        if (event.data === YT.PlayerState.ENDED) {
            button.textContent = "▶";
        }
    });
}