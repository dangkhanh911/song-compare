let player = null;

class Song {
    constructor(index, title, youtubeId, artist, album, year) {
        this.index = index;
        this.artist = artist;
        this.album = album;
        this.year = year;
        this.title = title;
        this.youtubeId = youtubeId;
    }
}

let songs = [
    new Song(0, "Midnight Drive", "EjTXTAiZPXs", "Artist 1", "Album 1", 2020),
    new Song(1, "Better in Blue", "boKJ5XDs_mY", "Artist 2", "Album 2", 2021)
];

function sendSongsToBackend() {
    fetch('http://127.0.0.1:5000/songs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(songs)
    })
    .then(response => response.json())
    .then(data => console.log('Response from backend:', data))
    .catch(error => console.error('Error:', error));
}

// Call this function when needed, e.g., on page load or button click
sendSongsToBackend();

function loadSongs() {
    const songList = document.querySelector('.comparison'); // Get the container element

    // Loop through the songs array and create HTML for each song
    songs.forEach(song => {
        let songDiv = document.createElement('div'); // Create a div for each song

        // Add song details
        songDiv.innerHTML = `
            <div class="song-panel">
                <div class="panel-header">
                    <span>FIND MUSIC</span>
                    <input type="text" class="search-box" id="searchInput" placeholder="What you wanna hear?" />
                    <button class="change-btn" onclick="searchSong(${song.index})">Search</button>
                </div>

                <div class="song-content">
                    <div class="cover-wrapper">
                        <img
                            class="cover"
                            src="https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg"
                            alt="Song cover"
                        >

                        <button
                            id="playPauseButton"
                            class="play-button"
                            onclick="togglePlayPause(this, ${song.index})"
                        >
                            ▶
                        </button>
                    </div>


                    <div class="song-info">
                        <div class="artist-label">${song.album} · ${song.year}</div>
                        <h1>${song.title}</h1>
                        <p class="artist">${song.artist}</p>

                        <div class="song-meta">
                            <span>◷ &nbsp;3:42 </span>
                            <span>118 BPM</span>
                            <span>F minor</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append the song div to the container
        songList.appendChild(songDiv);
    });
}

// Call the function to load songs when the page loads
window.onload = loadSongs;

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
    let query = searchInput.value;

    const searchUrl = `https://music.youtube.com/search?q=${query}`;
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