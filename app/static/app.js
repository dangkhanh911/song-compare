let player = null;

class Song {
    constructor(title, youtubeId, artist, album, year) {
        this.artist = artist;
        this.album = album;
        this.year = year;
        this.title = title;
        this.youtubeId = youtubeId;
    }
}

const songs = [
    new Song("Midnight Drive", "M7lc1UVf-VE"),
    new Song("Better in Blue", "boKJ5XDs_mY")
];


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
    const song = songs[songIndex];
    const query = `${song.title} ${song.artist}`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(searchUrl, "_blank");
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
}