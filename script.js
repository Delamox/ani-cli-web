var query = "";
var anime = "";

document.getElementById("searchAnimeForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let search = document.getElementById("searchAnimeInputBox");
  if (!search.value == "") {
    console.log(`${search.value}`);
    searchQuery(search.value);
  }
});

function searchQuery(data) {
  query = data;
  fetch("http://localhost:8000/search", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      appendAnimeList(data);
    });
}

function appendAnimeList(jsonData) {
  console.log(jsonData);
  let loc = document.getElementById("selectAnimeInputBox");
  for (let key in jsonData) {
    let option = document.createElement("option");
    option.innerHTML = jsonData[key];
    option.value = key;
    loc.append(option);
  }
}

document.getElementById("selectAnimeForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let selectbox = document.getElementById("selectAnimeInputBox");
  var selected = 1 + Number(selectbox.value);
  var episodestring = selected.toString();
  console.log(episodestring);
  getEpisodes(episodestring);
});

function getEpisodes(data) {
  anime = data;
  console.log(`searching anime ${query} select ${anime}`);
  fetch("http://localhost:8000/episode", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify([query, anime]),
  })
    .then((response) => response.json())
    .then((data) => {
      appendEpisodeList(data);
    });
}

function appendEpisodeList(jsonData) {
  console.log(jsonData);
  let loc = document.getElementById("selectEpisodeInputBox");
  for (let key in jsonData) {
    let option = document.createElement("option");
    option.innerHTML = jsonData[key];
    option.value = key;
    loc.append(option);
  }
}

document.getElementById("selectEpisodeForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let selectbox = document.getElementById("selectEpisodeInputBox");
  var selected = selectbox.options[selectbox.selectedIndex].text;
  geturl(selected);
});

function geturl(data) {
  console.log(`searching anime ${query} select ${anime} episode ${data}`);
  fetch("http://localhost:8000/link", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify([query, anime, data]),
  })
    .then((response) => response.text())
    .then((data) => {
      openVideo(data);
    });
}

function openVideo(url) {
  let fulllink = "https://bharadwajpro.github.io/m3u8-player/player/#" + url;
  window.open(fulllink);
}
