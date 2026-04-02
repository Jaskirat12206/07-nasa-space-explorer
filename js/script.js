// ============================================================
// NASA Space Explorer App - script.js
// ============================================================
// HOW THIS WORKS (read this so you can talk about it!):
//
// 1. We grab references to the HTML elements we need
// 2. On page load, we show a random space fact
// 3. When the user clicks "Get Space Images", we:
//    a. Show a loading spinner
//    b. Fetch data from NASA's APOD API for the date range
//    c. Loop through the results and create gallery cards
//    d. Handle both image AND video entries
// 4. When a user clicks a card, we open a modal with full details
// ============================================================

// ----- YOUR API KEY -----
// Replace 'DEMO_KEY' with your own key from https://api.nasa.gov
const API_KEY = "DEMO_KEY";

// ----- DOM REFERENCES -----
// We grab the HTML elements that our code needs to interact with
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const fetchBtn = document.getElementById("fetchBtn");
const gallery = document.getElementById("gallery");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalBody = document.getElementById("modalBody");
const factText = document.getElementById("factText");

// ============================================================
// EXTRA CREDIT: Random Space Facts
// ============================================================
// An array of fun space facts — one is picked at random on each page load

const spaceFacts = [
  "A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once but only 225 days to orbit the Sun!",
  "Neutron stars are so dense that a teaspoon of their material would weigh about 6 billion tons on Earth.",
  "There are more stars in the universe than grains of sand on all of Earth's beaches — roughly 70 sextillion!",
  "The Voyager 1 spacecraft, launched in 1977, is the most distant human-made object from Earth at over 15 billion miles away.",
  "Saturn's rings are mostly made of chunks of ice and rock, and they span up to 282,000 km — but are only about 10 meters thick.",
  "If you could fly a plane to Pluto, the trip would take more than 800 years.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy — but don't worry, it won't happen for about 4.5 billion years.",
  "Space is completely silent because there is no atmosphere to carry sound waves.",
  "The largest known star, UY Scuti, is so big that if it replaced our Sun, its surface would extend past Jupiter's orbit.",
  "Astronauts on the ISS witness about 16 sunrises and sunsets every day because they orbit Earth every 90 minutes.",
  "A full NASA spacesuit costs approximately $12 million, with the backpack and control module alone costing about $4 million.",
  "The footprints left on the Moon by Apollo astronauts will likely remain there for at least 100 million years since there's no wind or water to erode them."
];

function showRandomFact() {
  // Math.random() gives 0–1, multiply by array length, floor it = random index
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factText.textContent = spaceFacts[randomIndex];
}

// Show a fact when the page first loads
showRandomFact();

// ============================================================
// FETCH DATA FROM NASA APOD API
// ============================================================

fetchBtn.addEventListener("click", async function () {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Validate that both dates are selected
  if (!startDate || !endDate) {
    alert("Please select both a start date and an end date.");
    return;
  }

  // Validate that start date isn't after end date
  if (startDate > endDate) {
    alert("Start date must be before the end date.");
    return;
  }

  // Show loading spinner while we wait for NASA's response
  gallery.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-ring"></div>
      <p class="loading-text">Loading space photos…</p>
    </div>
  `;

  try {
    // BUILD THE API URL
    // The APOD API accepts start_date and end_date to return a range of photos
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

    // FETCH the data — this is an async call that returns a Promise
    const response = await fetch(url);

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Now display the gallery with the data we received
    displayGallery(data);

  } catch (error) {
    // If anything goes wrong, show an error message
    console.error("Error fetching APOD data:", error);
    gallery.innerHTML = `
      <div class="error-message">
        <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
        <strong>Oops! Something went wrong.</strong>
        <p>Could not load images. Please check your date range and try again.</p>
        <p style="font-size: 0.8rem; margin-top: 8px;">Error: ${error.message}</p>
      </div>
    `;
  }
});

// ============================================================
// DISPLAY THE GALLERY
// ============================================================

function displayGallery(data) {
  // Clear whatever is currently in the gallery
  gallery.innerHTML = "";

  // If there's no data, show a message
  if (!data || data.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🌌</div>
        <p>No results found for this date range. Try different dates!</p>
      </div>
    `;
    return;
  }

  // Loop through each APOD entry and create a card
  data.forEach(function (item, index) {
    const card = document.createElement("div");
    card.classList.add("gallery-item");
    // Stagger the fade-in animation for each card
    card.style.animationDelay = `${index * 0.08}s`;

    // EXTRA CREDIT: Handle video entries vs image entries
    if (item.media_type === "video") {
      // For videos, show a play icon and video badge
      card.innerHTML = `
        <div class="video-thumb-wrapper">
          <span class="video-play-icon">▶️</span>
        </div>
        <div class="gallery-info">
          <span class="video-badge">Video</span>
          <div class="gallery-title">${item.title}</div>
          <div class="gallery-date">${item.date}</div>
        </div>
      `;
    } else {
      // For images, show the photo
      card.innerHTML = `
        <div class="gallery-img-wrapper">
          <img class="gallery-img" src="${item.url}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="gallery-info">
          <div class="gallery-title">${item.title}</div>
          <div class="gallery-date">${item.date}</div>
        </div>
      `;
    }

    // When the user clicks this card, open the modal with full details
    card.addEventListener("click", function () {
      openModal(item);
    });

    gallery.appendChild(card);
  });
}

// ============================================================
// MODAL — Show full details when a gallery item is clicked
// ============================================================

function openModal(item) {
  let mediaHTML = "";

  // EXTRA CREDIT: If it's a video, embed it; otherwise show the image
  if (item.media_type === "video") {
    mediaHTML = `<iframe src="${item.url}" allowfullscreen></iframe>`;
  } else {
    // Use hdurl (high-def) if available, otherwise fall back to regular url
    const imageUrl = item.hdurl || item.url;
    mediaHTML = `<img src="${imageUrl}" alt="${item.title}" />`;
  }

  modalBody.innerHTML = `
    ${mediaHTML}
    <div class="modal-details">
      <div class="modal-title">${item.title}</div>
      <div class="modal-date">${item.date}</div>
      <p class="modal-explanation">${item.explanation}</p>
    </div>
  `;

  // Show the modal by adding the "active" class
  modal.classList.add("active");

  // Prevent the page from scrolling while modal is open
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

// Close modal when the X button is clicked
modalClose.addEventListener("click", closeModal);

// Close modal when clicking the dark background (outside the content)
modal.addEventListener("click", function (e) {
  if (e.target === modal) {
    closeModal();
  }
});

// Close modal when pressing the Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});