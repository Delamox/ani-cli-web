var query = "";
var anime = "";
var episode = "";
ip = "http://localhost:8000";
var animeform = document.getElementById("selectAnimeForm");
var episodeform = document.getElementById("selectEpisodeForm");
var mobilelink = document.getElementById("link");

//eventlisteners
document.getElementById("searchAnimeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let search = document.getElementById("searchAnimeInputBox");
  if (!search.value == "") {
    console.log(`${search.value}`);
    searchQuery(search.value);
  }
});
document.getElementById("selectAnimeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let selectbox = document.getElementById("selectAnimeInputBox");
  var selected = 1 + Number(selectbox.value);
  var episodestring = selected.toString();
  console.log(episodestring);
  getEpisodes(episodestring);
});
document.getElementById("selectEpisodeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let selectbox = document.getElementById("selectEpisodeInputBox");
  var selected = selectbox.options[selectbox.selectedIndex].text;
  geturl(selected);
});

//generic functions
function postdata(data, url, type) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      action(data, type);
    });
}
function action(data, type) {
  if (type == "search") {
    appendAnimeList(data);
  } else if (type == "anime") {
    appendEpisodeList(data);
  } else if (type == "episode") {
    openVideo(data);
  }
}
function appendlist(element, json) {
  element.innerHTML = "";
  for (let key in json) {
    let option = document.createElement("option");
    option.innerHTML = json[key];
    option.value = key;
    element.append(option);
  }
}

//post functions
function searchQuery(data) {
  query = data;
  animeform.style.display = "none";
  episodeform.style.display = "none";
  mobilelink.style.display = "none";
  anime = "";
  episode = "";
  serv = ip + "/search";
  console.log(serv);
  postdata(data, serv, "search");
}
function getEpisodes(data) {
  anime = data;
  episodeform.style.display = "none";
  mobilelink.style.display = "none";
  episode = "";
  console.log(`searching anime ${query} select ${anime}`);
  serv = ip + "/episode";
  console.log(serv);
  postdata(JSON.stringify([query, data]), serv, "anime");
}
function geturl(data) {
  mobilelink.style.display = "none";
  console.log(`searching anime ${query} select ${anime} episode ${data}`);
  serv = ip + "/link";
  postdata(JSON.stringify([query, anime, data]), serv, "episode");
}

//returndata functions
function appendAnimeList(jsonData) {
  console.log(jsonData);
  let element = document.getElementById("selectAnimeInputBox");
  appendlist(element, jsonData);
  animeform.style.display = "block";
}
function appendEpisodeList(jsonData) {
  console.log(jsonData);
  let element = document.getElementById("selectEpisodeInputBox");
  appendlist(element, jsonData);
  episodeform.style.display = "block";
}
function openVideo(url) {
  let fulllink = ip + "/player/#" + url;
  link.setAttribute("href", fulllink);
  mobilelink.style.display = "block";
  window.open(fulllink, "_blank");
}
