import '../../../css/components/navBarUser.css';
import '../../../css/components/preloader.css';
import '../../../css/pages/usercourtreservation/userCourtReservation.css';
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

// Get address from coordinates
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
    error('Error fetching address:', err);
    return 'Address not available';
  }
}

// Fetch court data
async function fetchCourtData(courtId) {
  try {
    const response = await fetch(`/user/court/${courtId}`);
    if (!response.ok) {
      throw new Error(`Error fetching court data: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    error(err);
    return null;
  }
}

// generate time slots based on operating hours
function generateTimeSlots(operatingHours) {
  const timeSlotsContainer = getById('timeSlots');
  timeSlotsContainer.innerHTML = '';

  const startHour = parseTime(operatingHours.from);
  const endHour = parseTime(operatingHours.to);

  for (let hour = startHour; hour < endHour; hour++) {
    let nextHour = hour + 1;
    let amPmStart = hour < 12 ? 'AM' : 'PM';
    let amPmEnd = nextHour < 12 ? 'AM' : 'PM';

    // adjust hour display for 12-hour format
    let displayHourStart = hour % 12 === 0 ? 12 : hour % 12;
    let displayHourEnd = nextHour % 12 === 0 ? 12 : nextHour % 12;

    // create time slot with range
    let timeSlot = doc.createElement('div');
    timeSlot.classList.add('time-slot');
    timeSlot.textContent = `${displayHourStart}:00 ${amPmStart} - ${displayHourEnd}:00 ${amPmEnd}`;

    // add click event to toggle selection
    timeSlot.addEventListener('click', function () {
      this.classList.toggle('selected');
    });

    timeSlotsContainer.appendChild(timeSlot);
  }
}

// Parse time string (e.g., "11:22 AM") to 24-hour format
function parseTime(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours;
}

// Populate court images and address
function populateCourtImagesAndLocation(courtData) {
  const courtImagesContainer = getById('courtImages');
  courtImagesContainer.innerHTML = '';

  // Update location field
  const locationField = get('.location-field input');
  const coordinates = courtData.location.coordinates;
  getAddressFromCoordinates(coordinates).then((address) => {
    locationField.value = address;
  });

  // Display court images
  courtData.court_images.forEach((image, index) => {
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('court-image');
    imgContainer.innerHTML = `<img src="${image}" alt="Court Image ${index + 1}" />`;

    // Add click event to toggle selection
    imgContainer.addEventListener('click', function () {
      this.classList.toggle('selected');
    });

    courtImagesContainer.appendChild(imgContainer);
  });
}

doc.addEventListener('DOMContentLoaded', async function () {
  var calendarEl = getById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    validRange: {
      start: new Date().toISOString().split('T')[0]
    },
    dateClick: function (info) {
      // Remove previous selections
      doc.querySelectorAll('.fc-daygrid-day').forEach((day) => day.classList.remove('selected-date'));

      // Add highlight to the clicked date
      info.dayEl.classList.add('selected-date');
    }
  });
  calendar.render();

  // Get court ID from URL
  const queryParams = new URLSearchParams(window.location.search);
  const courtId = queryParams.get('id');

  if (courtId) {
    const courtData = await fetchCourtData(courtId);
    if (courtData) {
      populateCourtImagesAndLocation(courtData);
      generateTimeSlots(courtData.operating_hours);
    }
  }
});
