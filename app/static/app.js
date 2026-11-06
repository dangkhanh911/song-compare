let player = null;
let onPlayerReady = false;

//#region Song class
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

async function fetchSongDetails(song) {
    try {
        await fetch('/fetch/' + song.youtubeId, {
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
            // song.duration = new Date(data.duration * 1000).toISOString().substr(11, 8);
            song.duration = data.duration; // Assuming duration is already in a readable format
        })
    }
    catch (error) {
        console.error(`Error fetching details for song ${song.index}:`, error);
    }
}


// Initialize the songs array
let songs = [
    new Song(0, "wgp7A9NCyE4"),
    new Song(1, "ajhCoiKn11c"),
];
//#endregion

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
                            id="playPauseButton-${song.index}"
                            class="play-button"
                            onclick="togglePlayPause(${song.index})"
                        >
                            ▶
                        </button>

                        <button
                            id="downloadButton"
                            class="download-button"
                            onclick="downloadSong('${song.youtubeId}', '${song.title}', '${song.artist}')"
                        >
                            ⬇
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

// type search in the search box and press enter to search for a new song
function searchSong(index) {
    const searchInput = document.getElementById(`searchInput-${index}`);
    const query = searchInput.value.trim();
    let response = null;

    // get the search result from the backend
    if (query) {
        response = fetch(`/search?q=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log(response);
    }

    // load the search result into the search result div
    if (response) {
        loadSearchResult(response, index);
    }
}

function loadSearchResult(response, index) {
    const searchList = document.querySelector('.search-results'); // Get the container element

    // Clear previous search results
    searchList.innerHTML = '';

    response.then(res => res.json())
        .then(data => {
            data.forEach((result, i) => {
                let resultDiv = document.createElement('div'); // Create a div for each search result

                // Add search result details
                resultDiv.innerHTML = `
                    <div class="song-content">
                        <div class="cover-wrapper">
                            <img
                                class="cover"
                                src="https://img.youtube.com/vi/${result.youtubeId}/hqdefault.jpg"
                                alt="Song cover"
                            >

                            <button
                                id="downloadButton"
                                class="download-button"
                                onclick="downloadSong('${result.youtubeId}', '${result.title}', '${result.artist}')"
                            >
                                ⬇
                            </button>
                        </div>


                        <div class="song-info">
                            <div class="artist-label">${result.album} · ${result.year}</div>
                            <h1>${result.title}</h1>
                            <p class="artist">${result.artist}</p>

                            <div class="song-meta">
                                <span>◷ &nbsp;${result.duration} </span>
                                
                                <button class="select-button"
                                    onclick="selectSong(${index}, ${result.youtubeId})"
                                >
                                    Select
                                </button>
                            </div>

                            
                        </div>
                    </div>
                `;

                // Append the search result div to the container
                searchList.appendChild(resultDiv);
            });
        })
        .catch(error => {
            console.error("Error loading search results:", error);
        });
}

function selectSong(index, youtubeId) {
    // Update the song in the songs array
    songs[index].youtubeId = youtubeId;
    loadSongs(); // Reload the songs to reflect the change
}

//#region player play, pause, and download functions
function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
        height: "200",
        width: "320",
        videoId: "",
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

function togglePlayPause(songIndex) {
    const button = document.getElementById(`playPauseButton-${songIndex}`);
    const otherButton = document.getElementById(`playPauseButton-${songIndex === 0 ? 1 : 0}`);

    // Toggle play/pause for the selected song and update button states
    if (button.textContent.trim() === "▶") {
        button.textContent = "⏸";
        playSong(songIndex);
        if (otherButton && otherButton.textContent.trim() === "⏸") {
            otherButton.textContent = "▶";
        }
    }
    else {
        button.textContent = "▶";
        pauseSong();
    }

    if (player) {
        player.addEventListener("onStateChange", function (event) {
            if (event.data === YT.PlayerState.ENDED) {
                button.textContent = "▶";
            }
        });
    }
}

// Download function to download the song
async function downloadSong(youtubeId, songTitle, songArtist) {
    try {
        const response = await fetch(`/download/${youtubeId}`); // Ensure the endpoint is correct
        if (!response.ok) {
            throw new Error("Download failed");
        }

        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("audio/mpeg")) {
            console.error("Invalid file type received:", contentType);
            return;
        }

        // Create a temporary link to download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${songTitle} - ${songArtist}.mp3`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Download error:", error);
        alert("Không thể tải xuống: " + error.message);
    }
}
//#endregion