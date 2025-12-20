// You can edit ALL of the code here
// import { getAllEpisodes } from "./episodes.js";

// level-500

// App global Variables 

let allShows = [];
let allEpisodes = [];
const episodesCache = {};
const SHOWS_API = "https://api.tvmaze.com/shows";

// Main Setup ---- 
document.addEventListener("DOMContentLoaded", setup);

function setup() {
  fetchShows();
  setupEventListeners();
}

function setupEventListeners() {
  // Show Search
  document.getElementById("show-search").addEventListener("input", filterShows);
  
  // Show Dropdown
  document.getElementById("show-dropdown").addEventListener("change", (e) => {
    if (e.target.value) selectShow(e.target.value);
  });

  // Episode Search
  document.getElementById("search-input").addEventListener("input", filterEpisodes);

  // Episode Dropdown
  document.getElementById("episode-select").addEventListener("change", (e) => {
    const selectedCode = e.target.value;
    const filtered = selectedCode 
      ? allEpisodes.filter(ep => getEpisodeCode(ep.season, ep.number) === selectedCode)
      : allEpisodes;
    displayEpisodes(filtered);
  });

  // Navigation: Back to Shows
  document.getElementById("back-to-shows").addEventListener("click", showShowsView);
}

// Helper Functions -----

function zeroPad(num) { 
  return num.toString().padStart(2, "0"); 
}

function getEpisodeCode(season, episode) { 
  return `S${zeroPad(season)}E${zeroPad(episode)}`; 
}

// User interface helpers  --- 

function showShowsView() {
  // 1. Toggle visibility of controls
  document.getElementById("shows-controls").classList.remove("hidden");
  document.getElementById("episodes-controls").classList.add("hidden");
  document.getElementById("back-to-shows").classList.add("hidden");
  
  // 2. Reset dropdowns
  document.getElementById("show-dropdown").value = "";
  document.getElementById("episode-select").innerHTML = '<option value="">All episodes</option>';
  
  // 3. Re-render the shows
  displayShows(allShows);
}

function showLoading(message = "Loading...") {
  const root = document.getElementById("root");
  root.innerHTML = `<p>${message}</p>`;
}

function showError(message) {
  const root = document.getElementById("root");
  root.innerHTML = `<p style="color:red;font-weight:bold;">${message}</p>`;
}

// Fetching Shows ---

async function fetchShows() {
  showLoading("Loading shows...");
  try {
    const res = await fetch(SHOWS_API);
    if (!res.ok) throw new Error("Failed to load shows");
    allShows = await res.json();
    
    allShows.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    
    populateShowDropdown(allShows);
    showShowsView();
  } catch (err) {
    showError(err.message);
  }
}

// Displaying Shows --- 

function displayShows(showList) {
  const root = document.getElementById("root");
  const template = document.getElementById("show-card-template");
  root.innerHTML = "";
  
  const container = document.createElement("div");
  container.id = "shows-container";

  showList.forEach(show => {
    const cardInstance = template.content.cloneNode(true);

    const title = cardInstance.querySelector(".show-title");
    title.textContent = show.name;
    title.addEventListener("click", () => selectShow(show.id));

    const img = cardInstance.querySelector(".show-img");
    img.src = show.image ? show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image';
    img.alt = show.name;

    const summary = cardInstance.querySelector(".show-summary");
    summary.innerHTML = show.summary || "No summary available.";

    cardInstance.querySelector(".show-genres").textContent = show.genres.join(", ") || "N/A";
    cardInstance.querySelector(".show-status").textContent = show.status || "N/A";
    cardInstance.querySelector(".show-rating").textContent = show.rating?.average || "N/A";
    cardInstance.querySelector(".show-runtime").textContent = show.runtime || "N/A";

    container.appendChild(cardInstance);
  });
  
  root.appendChild(container);
  document.getElementById("show-count").textContent = `Found ${showList.length} shows`;
}

// Show Search implementation

function filterShows(e) {
  const term = e.target.value.toLowerCase();
  const filtered = allShows.filter(show => 
    show.name.toLowerCase().includes(term) || 
    show.genres.some(g => g.toLowerCase().includes(term)) || 
    (show.summary || "").toLowerCase().includes(term)
  );
  displayShows(filtered);
}

function populateShowDropdown(shows) {
  const select = document.getElementById("show-dropdown");
  select.innerHTML = '<option value="">Select a show...</option>';
  shows.forEach(show => {
    const opt = document.createElement("option");
    opt.value = show.id;
    opt.textContent = show.name;
    select.appendChild(opt);
  });
}

//  Selecting a Show 

async function selectShow(showId) {
  showLoading("Loading episodes...");

  // Requirement 6: Cache check
  if (episodesCache[showId]) {
    allEpisodes = episodesCache[showId];
    updateEpisodesUI();
    return;
  }

  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!res.ok) throw new Error("Failed to load episodes");
    allEpisodes = await res.json();
    
    episodesCache[showId] = allEpisodes;
    updateEpisodesUI();
  } catch (err) {
    showError(err.message);
  }
}

// Update Episodes interface 

function updateEpisodesUI() {
  document.getElementById("shows-controls").classList.add("hidden");
  document.getElementById("episodes-controls").classList.remove("hidden");
  document.getElementById("back-to-shows").classList.remove("hidden");
  
  document.getElementById("search-input").value = "";
  
  populateEpisodeSelect(allEpisodes);
  displayEpisodes(allEpisodes);
}

// Episode Search -- --

function filterEpisodes(e) {
  const term = e.target.value.toLowerCase();
  const filtered = allEpisodes.filter(ep => 
    ep.name.toLowerCase().includes(term) || 
    (ep.summary && ep.summary.toLowerCase().includes(term))
  );
  displayEpisodes(filtered);
}

// Populate Episode drop-down --

function populateEpisodeSelect(episodes) {
  const select = document.getElementById("episode-select");
  select.innerHTML = '<option value="">All episodes</option>';
  episodes.forEach(ep => {
    const code = getEpisodeCode(ep.season, ep.number);
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = `${code} - ${ep.name}`;
    select.appendChild(opt);
  });
}

// Displaying  episodes --

function displayEpisodes(episodeList) {
  const root = document.getElementById("root");
  const template = document.getElementById("episode-card-template");
  root.innerHTML = "";
  
  const container = document.createElement("div");
  container.id = "episodes-container";

  episodeList.forEach(ep => {
    const code = getEpisodeCode(ep.season, ep.number);
    const cardInstance = template.content.cloneNode(true);

    const link = cardInstance.querySelector(".episode-link");
    link.href = ep.url;
    link.textContent = `${ep.name} - ${code}`;

    const img = cardInstance.querySelector(".episode-img");
    img.src = ep.image ? ep.image.medium : 'https://via.placeholder.com/210x295?text=No+Image';
    img.alt = ep.name;

    const summary = cardInstance.querySelector(".episode-summary");
    summary.innerHTML = ep.summary || "No summary available.";

    container.appendChild(cardInstance);
  });

  root.appendChild(container);
  
  const countDisplay = document.getElementById("episode-count");
  if (countDisplay) {
    countDisplay.textContent = `Displaying ${episodeList.length}/${allEpisodes.length} episodes`;
  }
}
//window.onload = setup;

// script.js main and helper function implemented to
// display episode cards by reading episode data.

// Used DOMContentLoaded instead of window.onload
// Episode.js replaced with API fetch
// branch created

// Level -500 implementation done in script.js

// script.js Level-500 branch created.
