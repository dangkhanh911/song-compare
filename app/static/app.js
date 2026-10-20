let player = null;
let onPlayerReady = false;

class Song {
    constructor(index, youtubeId) {
        this.index = index;
        this.youtubeId = youtubeId;
        this.title = "";
        this.artist = "";
        this.album = "";
        this.year = "";
        this.duration = "";
    }
}

// Fetch song details from the backend for each song
async function fetchSongDetails(song) {
    try {
        await fetch('http://127.0.0.1:5000/fetch/' + song.youtubeId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            song.title = data.title;
            song.artist = data.artist;
            song.album = data.album;
            song.year = data.year;
            song.duration = new Date(data.duration * 1000).toISOString().substr(11, 8);
        })
    }
    catch (error) {
        console.error(`Error fetching details for song ${song.index}:`, error);
    }
}

// Initialize the songs array
let songs = [
    new Song(0, "gGnWFYAS0U4"),
    new Song(1, "G7tQa14PqEY"),
];

// function sendSongsToBackend() {
//     fetch('http://127.0.0.1:5000/songs', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(songs)
//     })
//     .then(response => response.json())
//     .then(data => console.log('Response from backend:', data))
//     .catch(error => console.error('Error:', error));
// }

// Call this function when needed, e.g., on page load or button click
// sendSongsToBackend();

function loadSongs() {
    const songList = document.querySelector('.comparison'); // Get the container element

    // Loop through the songs array and create HTML for each song
    songs.forEach(song => {
        // Fetch song details from the backend
        console.log(`Song ${song.index} details:`, song);

        let songDiv = document.createElement('div'); // Create a div for each song

        // Add song details
        songDiv.innerHTML = `
            <div class="song-panel">
                <div class="panel-header">
                    <span>FIND MUSIC</span>
                    <input type="text" class="search-box" id="searchInput-${song.index}" placeholder="What you wanna hear?" />
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
                            <span>◷ &nbsp;${song.duration} </span>
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
window.addEventListener("load", async function () {
    await Promise.all(
        songs.map(song => fetchSongDetails(song))
    );

    loadSongs();
});

function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
        height: "200",
        width: "320",
        videoId: "", // Load the second song by default
        playerVars: {
            autoplay: 0,
            controls: 0
        },

        events: {
            onReady: function () {
                onPlayerReady = true;
                console.log("YouTube player ready");
            },
            onStateChange: function (event) {
                console.log("YouTube player state changed:", event.data); 
                // event.data values: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
            },
            onError: function (event) {
                console.error("YouTube player error:", player.videoId, event.data);
                // event.data values: 2 (invalid parameter), 5 (HTML5 player error), 100 (video not found), 101/150 (embedding not allowed)
            }
        }
    });
}

function searchSong(songIndex) {
    const searchInput = document.getElementById(`searchInput-${songIndex}`);
    let query = searchInput.value.trim();

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

// YouTube Player API functions
function playSong(index) {
    if (!player || !onPlayerReady) {
        return;
    }

    player.loadVideoById(songs[index].youtubeId);
    console.log("Playing song:", songs[index].title, "with YouTube ID:", songs[index].youtubeId);

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
    if (player) {
        player.addEventListener("onStateChange", function (event) {
            if (event.data === YT.PlayerState.ENDED) {
                button.textContent = "▶";
            }
        });
    } else {
        console.error("Player is not initialized.");
    }
}