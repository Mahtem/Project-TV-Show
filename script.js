// You can edit ALL of the code here
// import { getAllEpisodes } from "./episodes.js";


// Level-300: TV Show episodes using API

let allEpisodes = [];
const API_URL = "https://api.tvmaze.com/shows/82/episodes";

// ---------- Main setup ----------
function setup() {
  showLoading();
  fetchEpisodes();
}

document.addEventListener("DOMContentLoaded", setup);

// ---------- Helper functions ----------
function zeroPad(num) {
  return num.toString().padStart(2, "0");
}

function getEpisodeCode(season, episode) {
  return `S${zeroPad(season)}E${zeroPad(episode)}`;
}

// ---------- Fetch episodes ----------
async function fetchEpisodes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to load episode data");

    allEpisodes = await response.json();

    clearStatus(); // remove loading message

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
  status.textContent = "Loading episodes, please wait...";
}

function clearStatus() {
  const status = document.getElementById("status");
  status.textContent = "";
}

function showError(message) {
  const status = document.getElementById("status");
  status.textContent = `Error loading episodes: ${message}`;
  const root = document.getElementById("root");
  root.innerHTML = ""; // clear previous content
}

// ---------- Search episodes ----------
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allEpisodes.filter(
      ep => ep.name.toLowerCase().includes(term) ||
            ep.summary.toLowerCase().includes(term)
    );
    displayEpisodes(filtered);
  });
}

// ---------- Drop-down selector ----------
function populateEpisodeSelect(episodeList) {
  const select = document.getElementById("episode-select");
  select.innerHTML = '<option value="">All episodes</option>';

  episodeList.forEach(ep => {
    const code = getEpisodeCode(ep.season, ep.number);
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} - ${ep.name}`;
    select.appendChild(option);
  });

  select.addEventListener("change", handleEpisodeSelect);
}

// Show only selected episode or all
function handleEpisodeSelect(event) {
  const selectedCode = event.target.value;

  if (!selectedCode) {
    displayEpisodes(allEpisodes);
    return;
  }

  const filtered = allEpisodes.filter(
    ep => getEpisodeCode(ep.season, ep.number) === selectedCode
  );
  displayEpisodes(filtered);
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

  episodeList.forEach(ep => {
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

    // Image
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

