// You can edit ALL of the code here

import { getAllEpisodes } from "./episodes.js";

let allEpisodes = [];


function setup() {
  
   allEpisodes = getAllEpisodes();
  setupSearch();
  displayEpisodes(allEpisodes);
  populateEpisodeSelect(allEpisodes); 
}

// Pads a number with a leading zero if it's a single digit.

function zeroPad(num) {
  return num.toString().padStart(2, "0");
}

// Create the episode code like S02E07 

function getEpisodeCode(season, episode) {
  const paddedSeason = zeroPad(season);
  const paddedEpisode = zeroPad(episode);
  return `S${paddedSeason}E${paddedEpisode}`;
}
//Search bar function
function setupSearch() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      );
    });

    displayEpisodes(filteredEpisodes);
  });
}

//select drop-down function, Populate the select drop-down with all episodes
function populateEpisodeSelect(episodeList) {
  const select = document.getElementById("episode-select");

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    const code = getEpisodeCode(episode.season, episode.number);
    option.value = code;
    option.textContent = `${code} - ${episode.name}`;
    select.appendChild(option);
  });

  select.addEventListener("change", handleEpisodeSelect);
}

// Scroll to the selected episode when chosen from the dropdown
function handleEpisodeSelect(event) {
  const selectedCode = event.target.value;

  if (selectedCode === "") {
    displayEpisodes(allEpisodes);
    return;
  }

  // Scroll to the episode element
  const episodeElement = document.getElementById(selectedCode);
  if (episodeElement) {
    episodeElement.scrollIntoView({ behavior: "smooth" });
  }
}

// Display all episodes in the given list on the page.

function displayEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // 1. Clear initial content and add a simple header
  rootElem.innerHTML = ''; 

  const header = document.createElement('h1');
  header.textContent = `Displaying ${episodeList.length} Episodes`;
  rootElem.appendChild(header);

  const episodesContainer = document.createElement('section');
  episodesContainer.id = 'episodes-container'; 
  rootElem.appendChild(episodesContainer);


  // 2. Loop through each episode and display its information
  episodeList.forEach(episode => {
    // Create a container for the individual episode
    const code = getEpisodeCode(episode.season, episode.number);
    const episodeDiv = document.createElement('div');
    episodeDiv.className = 'episode-card'; // Class for CSS styling
    episodeDiv.id = code;
    
    // 2.1, 2.2, 2.3, 3. Episode Name and Code

    
    const title = document.createElement('h2');
    
    const titleLink = document.createElement('a');
    titleLink.href = episode.url;
    titleLink.target = '_blank';
    titleLink.textContent = `${episode.name} - ${code}`;
    title.appendChild(titleLink);
    episodeDiv.appendChild(title);
  

    // 2.4. Display image 
    if (episode.image && episode.image.medium) {
      const img = document.createElement('img');
      img.src = episode.image.medium;
      img.alt = `Poster for ${episode.name}`;
      episodeDiv.appendChild(img);
    }

    // 2.5. Summary text
    const summary = document.createElement('div');
    summary.innerHTML = episode.summary || 'No summary available.';
    episodeDiv.appendChild(summary);

    // Append the individual episode to the container
    episodesContainer.appendChild(episodeDiv);
  });
}

 

window.onload = setup;

// script.js main and helper function implemented to
// display episode cards by reading episode data. 