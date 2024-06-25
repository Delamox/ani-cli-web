var query = "";
var anime = "";
var episode = "";
ip = "http://localhost:8000";
var animeform = document.getElementById("selectAnimeForm");
var episodeform = document.getElementById("selectEpisodeForm");
var mobilelink = document.getElementById("link");

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
  animeform.style.display = "none";
  episodeform.style.display = "none";
  mobilelink.style.display = "none";
  anime = "";
  episode = "";
  serv = ip + "/search";
  console.log(serv);
  fetch(serv, {
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
  loc.innerHTML = "";
  for (let key in jsonData) {
    let option = document.createElement("option");
    option.innerHTML = jsonData[key];
    option.value = key;
    loc.append(option);
  }
  animeform.style.display = "block";
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
  episodeform.style.display = "none";
  mobilelink.style.display = "none";
  episode = "";
  console.log(`searching anime ${query} select ${anime}`);
  serv = ip + "/episode";
  console.log(serv);
  fetch(serv, {
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
  loc.innerHTML = "";
  for (let key in jsonData) {
    let option = document.createElement("option");
    option.innerHTML = jsonData[key];
    option.value = key;
    loc.append(option);
  }
  episodeform.style.display = "block";
}

document.getElementById("selectEpisodeForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let selectbox = document.getElementById("selectEpisodeInputBox");
  var selected = selectbox.options[selectbox.selectedIndex].text;
  geturl(selected);
});

function geturl(data) {
  mobilelink.style.display = "none";
  console.log(`searching anime ${query} select ${anime} episode ${data}`);
  serv = ip + "/link";
  fetch(serv, {
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
  link.setAttribute("href", fulllink);
  mobilelink.style.display = "block";
  window.open(fulllink, "_blank");
  // document.getElementById("viewerdiv").createElement
  // document.getElementById("viewer").src = fullink;
  // document.getElementById("viewer").style.display = "block";
}
