let output = document.querySelector(".output");
let outURL = document.querySelector("#roulette-url");
let copyBtn = document.querySelector("#copy-btn");
let inputURL = document.querySelector("#link-input");
let overlay = document.querySelector(".overlay");
let placeholder = document.querySelector(".placeholder");

window.onload = getVideo();

function generateLink() {
    let playlistLink = inputURL.value;

    if (!playlistLink) {
        return;
    }

    let listID = playlistLink.substring(playlistLink.indexOf("=") + 1);
    let rouletteURL = "https://dfx81.github.io/yt-roulette?id=" + listID;

    outURL.value = rouletteURL;

    placeholder.classList.add("hidden");
    output.classList.remove("hidden");
    console.log("Generated: " + rouletteURL);
}

function copyToClipboard() {
    navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
            navigator.clipboard.writeText(outURL.value).then(_ => {
                alert("Roulette URL copied to clipboard");
            })
        }
    });
}

function getVideo() {
    let params = (new URL(location)).searchParams;
    let listID = params.get("id");

    if (!listID) {
        overlay.classList.add("hidden");
        return;
    }

    let cache = localStorage.getItem(listID);

    if (cache) {
        cache = JSON.parse(cache);

        vidPicker(cache);
    }

    fetch("https://dfx-81.herokuapp.com/api/list/" + listID)
        .then(res => {
            if (res.ok) {
                return res.json()
            }
        })
        .then(data => {
            console.log(data);

            cache = {
                timestamp: Date.now(),
                list: data.list
            }

            localStorage.setItem(listID, JSON.stringify(cache));
            vidPicker(cache);
        }).catch(_err => {
            fetch("https://dfx-81.herokuapp.com/api/ping/").then(
                res => {
                    let error = ""

                    if (res.ok) {
                        error = "ERROR 404: The playlist ID is invalid or the playlist is private."
                    } else {
                        error = "ERROR 500: Our API server is currently down. Try again later.";
                    }

                    overlay.children[0].innerText = error;
                }
            );
        });
}

function vidPicker(cache) {
    if (Date.now() - cache.timestamp < 1500) {
        let vidID = cache.list[Math.floor(Math.random() * cache.list.length)];

        location = "https://www.youtube.com/watch?v=" + vidID;
        return;
    }
}