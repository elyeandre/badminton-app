import L from 'leaflet';
import 'leaflet-control-geocoder';
import '../../../css/components/navBarUser.css';
import '../../../css/components/preloader.css';
import '../../../css/pages/usercourtlist/userCourtList.css';
import { startSessionChecks, validateSessionAndNavigate } from '../../../utils/sessionUtils.js';
import { setupLogoutListener } from '../../global/logout.js';

const doc = document;
const { log, error } = console;

const getById = (id) => doc.getElementById(id);
const getAll = (selector) => doc.querySelectorAll(selector);
const get = (selector) => doc.querySelector(selector);

setupLogoutListener();

// Start session checks on page load
startSessionChecks();

let courts = [];
const courtsPerPage = 2; // Change this if you want more or fewer courts per page

document.addEventListener('DOMContentLoaded', () => {
  fetchCourts();
});

async function fetchCourts(page = 1) {
  try {
    const response = await fetch(`/user/courts?page=${page}&limit=${courtsPerPage}`);
    const data = await response.json();

    if (response.ok && data.status === 'success') {
      courts = data.courts;

      // If no courts, show a message
      if (courts.length === 0) {
        displayNoCourtsMessage();
        hidePagination();
      } else {
        displayCourts();
        updatePaginationInfo(data.currentPage, data.totalPages);
        showPagination();
      }
    } else {
      throw new Error('Failed to fetch courts');
    }
  } catch (err) {
    console.error('Error fetching courts:', err);
    displayErrorMessage('Error fetching courts. Please try again later.');
    hidePagination();
  }
}

async function displayCourts() {
  const courtsContainer = getById('courts-container');
  courtsContainer.innerHTML = '';
  hidePagination();

  // Directly loop through the courts array as it contains only the current page's data
  for (const court of courts) {
    const address = await getAddressFromCoordinates(court.location.coordinates);

    const businessLogo = court.business_logo || '/assets/images/logo_placeholder_150x150.png';
    const operatingHours = court.operating_hours || { to: 'N/A', from: 'N/A' };
    const description = court.description || 'No description available';

    const courtImages = court.court_images?.length
      ? court.court_images.map((img) => `<img src="${img}" alt="Court Image" />`).join('')
      : '<p>No images available</p>';

    courtsContainer.innerHTML += `
      <div class="popup-container">
        <div class="popup-header">
          <!-- Rendering logic for courts -->
          <div class="left-section">
            <label for="pin-image-upload" class="upload-label">
              <div class="image-upload-container">
                <img id="pin-preview" src="${businessLogo}" alt="Business Logo" />
              </div>
            </label>
            <div class="operating-hours">
              <label><strong>Operating Hours:</strong></label>
              <div class="time-container">
                <label for="to-time">To:</label>
                <input type="text" id="to-time" value="${operatingHours.to}" readonly />
              </div>
              <div class="time-container">
                <label for="from-time">From:</label>
                <input type="text" id="from-time" value="${operatingHours.from}" readonly />
              </div>
            </div>
          </div>
          <div class="right-section">
            <h1>${court.business_name}</h1>
            <div class="location-field">
              <i class="fas fa-map-marker-alt"></i>
              <input type="text" value="${address}" readonly />
            </div>
            <div class="description-field">
              <textarea id="court-description-textarea" readonly>${description}</textarea>
            </div>
            <div class="carousel">
              <div class="carousel-images">
                ${courtImages}
              </div>
              <button class="carousel-btn prev">&#8249;</button>
              <button class="carousel-btn next">&#8250;</button>
            </div>
          </div>
        </div>
        <button class="reserve-btn">Reserve Now</button>
      </div>
    `;
  }

  initCarousel(); // Re-initialize carousel after rendering courts
}

function updatePaginationInfo(currentPage, totalPages) {
  getById('currentPage').textContent = currentPage;
  getById('totalPages').textContent = totalPages;

  const prevBtn = getById('prevPage');
  const nextBtn = getById('nextPage');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchCourts(currentPage); // Fetch courts for the previous page
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;

      fetchCourts(currentPage); // Fetch courts for the next page
    }
  };
}

// Get address from coordinates with enhanced error handling
export async function getAddressFromCoordinates(coordinates) {
  const [lon, lat] = coordinates;

  if (typeof lat !== 'number' || typeof lon !== 'number') {
    console.error('Latitude and Longitude must be numbers');
    return 'Invalid coordinates';
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.display_name || 'Address not found';
  } catch (err) {
    console.error('Error fetching address:', err);
    return 'Address not available';
  }
}

// Initialize carousel functionality
function initCarousel() {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach((carousel) => {
    let currentIndex = 0;
    const images = carousel.querySelectorAll('.carousel-images img');
    const totalImages = images.length;

    if (totalImages > 0) {
      // Show the slide based on index
      function showSlide(index) {
        const carouselImages = carousel.querySelector('.carousel-images');
        const translateX = -index * 100;
        carouselImages.style.transform = `translateX(${translateX}%)`;
      }

      // Previous slide function
      function prevSlide() {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
        showSlide(currentIndex);
      }

      // Next slide function
      function nextSlide() {
        currentIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
        showSlide(currentIndex);
      }

      // Attach event listeners to buttons
      carousel.querySelector('.carousel-btn.prev').addEventListener('click', prevSlide);
      carousel.querySelector('.carousel-btn.next').addEventListener('click', nextSlide);
    }
  });
}

// Scroll to top button functionality
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('scroll', () => {
    const scrollToTopBtn = getById('scrollToTopBtn');
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      scrollToTopBtn.style.display = 'block';
    } else {
      scrollToTopBtn.style.display = 'none';
    }
  });

  getById('scrollToTopBtn').addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

// Display message when there are no courts
function displayNoCourtsMessage() {
  const courtsContainer = getById('courts-container');
  courtsContainer.innerHTML = `
    <div class="no-courts-message">
      <p>No courts available at the moment. Please check back later.</p>
    </div>
  `;
}

// Display error message in the courts container
function displayErrorMessage(message) {
  const courtsContainer = getById('courts-container');
  courtsContainer.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
    </div>
  `;
}

// hide pagination
function hidePagination() {
  getById('pagination-container').style.display = 'none';
}

// show pagination
function showPagination() {
  getById('pagination-container').style.display = 'flex';
}
