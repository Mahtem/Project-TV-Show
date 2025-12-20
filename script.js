// You can edit ALL of the code here
// import { getAllEpisodes } from "./episodes.js";

// level-400

let allEpisodes = [];
let allShows = [];
const episodesCache = {};
const SHOWS_API = "https://api.tvmaze.com/shows";

// ---------- Main setup ----------
function setup() {
  showLoading();
  fetchShows();
}

// ---------- Helper functions ----------
function zeroPad(num) {
  return num.toString().padStart(2, "0");
}

//------- Fetch shows -------
function getEpisodeCode(season, episode) {
  return `S${zeroPad(season)}E${zeroPad(episode)}`;
}

async function fetchShows() {
  try {
    const response = await fetch(SHOWS_API);
    if (!response.ok) throw new Error("Failed to load shows");

    allShows = await response.json();

    // Sort A–Z (case-insensitive)
    allShows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    clearStatus();
    populateShowSelect(allShows);
  } catch (error) {
    showError(error.message);
  }
}

// ---------- Fetch episodes ----------
async function fetchEpisodes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to load episode data");

    allEpisodes = await response.json();

    clearStatus(); //

    setupSearch();
    populateEpisodeSelect(allEpisodes);
    displayEpisodes(allEpisodes);
  } catch (error) {
    showError(error.message);
  }
}

// ---------- UI status ----------
function showLoading() {
  const status = document.getElementById("status");
  status.textContent = "Loading, please wait...";
}

function clearStatus() {
  const status = document.getElementById("status");
  status.textContent = "";
}

function showError(message) { 
  const status = document.getElementById("status");
  status.textContent = `Error loading shows: ${message}`;
  const root = document.getElementById("root");
  root.innerHTML = ""; // clear previous content
}

// ---------- Search episodes ----------
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        ep.summary.toLowerCase().includes(term)
    );
    displayEpisodes(filtered);
  });
}
// ---------- Drop-down selector ----------
function populateShowSelect(shows) {
  const select = document.getElementById("show-select");
  select.innerHTML = '<option value="">Select a show</option>';

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    select.appendChild(option);
  });

  select.onchange = handleShowChange;

}

function populateEpisodeSelect(episodeList) {
  const select = document.getElementById("episode-select");
  select.innerHTML = '<option value="">All episodes</option>';
  select.value = "";


  episodeList.forEach((ep) => {
    const code = getEpisodeCode(ep.season, ep.number);
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });

  select.onchange = handleEpisodeSelect;


}

// Show only selected episode or all

async function handleShowChange(event) {
  const showId = event.target.value;
  if (!showId) return;

  showLoading();

  // Use cache if available
  if (episodesCache[showId]) {
    allEpisodes = episodesCache[showId];
    clearStatus();
    refreshEpisodesUI();
    return;
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok) throw new Error("Failed to load episodes");

    const episodes = await response.json();
    episodesCache[showId] = episodes;
    allEpisodes = episodes;

    clearStatus();
    refreshEpisodesUI();
  } catch (error) {
    showError(error.message);
  }
}

function handleEpisodeSelect(event) {
  const selectedCode = event.target.value;

  // If user chooses "All episodes"
  if (selectedCode === "") {
    displayEpisodes(allEpisodes);
    return;
  }

  // Find the one episode that matches the code
  const chosenEpisode = allEpisodes.filter(ep => {
    const code = getEpisodeCode(ep.season, ep.number);
    return code === selectedCode;
  });

  displayEpisodes(chosenEpisode);
}


//UI refresher helper

function refreshEpisodesUI() {
  const searchInput = document.getElementById("search-input");
  searchInput.value = "";

  populateEpisodeSelect(allEpisodes);
  displayEpisodes(allEpisodes);
}

// ---------- Display episodes ----------
function displayEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // Header
  const header = document.createElement("h1");
  header.textContent = `Displaying ${episodeList.length} Episodes`;
  rootElem.appendChild(header);

  // Container for episode cards
  const container = document.createElement("section");
  container.id = "episodes-container";
  rootElem.appendChild(container);

  episodeList.forEach((ep) => {
    const code = getEpisodeCode(ep.season, ep.number);

    const card = document.createElement("div");
    card.className = "episode-card";
    card.id = code;

    // Creating episode title and making it clickable link
    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = ep.url;
    link.target = "_blank";
    link.textContent = `${ep.name} - ${code}`;
    title.appendChild(link);
    card.appendChild(title);

    // Image of each episode

    if (ep.image?.medium) {
      const img = document.createElement("img");
      img.src = ep.image.medium;
      img.alt = `Poster for ${ep.name}`;
      card.appendChild(img);
    }

    // summary of every episode
    const summary = document.createElement("div");
    summary.innerHTML = ep.summary || "No summary available.";
    card.appendChild(summary);

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", setup);

//window.onload = setup;

// script.js main and helper function implemented to
// display episode cards by reading episode data.

// Used DOMContentLoaded instead of window.onload
// Episode.js replaced with API fetch
// branch created
