var query = "";
var episode = 0;

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
  episode = data;
  console.log(`searching anime ${query} ep ${episode}`);
  fetch("http://localhost:8000/episode", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify([query, episode]),
  })
    .then((response) => response.json())
    .then((data) => {
      appendAnimeList(data);
    });
}
