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
            song.duration = new Date(data.duration * 1000).toISOString().substr(11, 8);
        })
    }
    catch (error) {
        console.error(`Error fetching details for song ${song.index}:`, error);
    }
}
//#endregion

// Initialize the songs array
let songs = [
    new Song(0, "wgp7A9NCyE4"),
    new Song(1, "ajhCoiKn11c"),
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

// Search function to open a new window with the search results
async function searchSong(songIndex) {
    const searchInput = document.getElementById(`searchInput-${songIndex}`);
    let query = searchInput.value.trim();

    if (!query) {
        alert("Vui lòng nhập tên bài hát");
        return;
    }
    
    try {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Tìm kiếm thất bại");
        }

        console.log("Search results:", data);

        // Hiển thị danh sách kết quả
        const resultContainer = document.getElementById(
            `results-${songIndex}`
        );

        if (!resultContainer) {
            console.error("Không tìm thấy vùng hiển thị kết quả");
            return;
        }

        resultContainer.innerHTML = "";

        data.forEach((song) => {
            const item = document.createElement("div");
            item.className = "search-result";

            const title = document.createElement("div");
            title.textContent = song.title || "Không rõ tên bài hát";

            const artist = document.createElement("div");
            artist.textContent = song.artist || "Không rõ nghệ sĩ";

            const chooseButton = document.createElement("button");
            chooseButton.textContent = "Chọn bài hát";

            chooseButton.addEventListener("click", () => {
                songs[songIndex].youtubeId = song.youtubeId;
                songs[songIndex].title = song.title || "";
                songs[songIndex].artist = song.artist || "";
                songs[songIndex].album = song.album || "";
                songs[songIndex].duration = song.duration ?? "";

                loadSongs();
            });

            item.append(title, artist, chooseButton);
            resultContainer.appendChild(item);
        });
    } catch (error) {
        console.error("Search error:", error);
        alert("Không thể tìm kiếm: " + error.message);
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