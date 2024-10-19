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

let selectedCourts = [];
let selectedDate = null;
let reservedDates = [];

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

// Generate time slots based on availability
function generateTimeSlots(availabilityData) {
  const timeSlotsContainer = getById('timeSlots');
  timeSlotsContainer.innerHTML = '';

  const availableSlots = availabilityData.courts[0].timeSlot.available;
  const unavailableSlots = availabilityData.courts[0].timeSlot.unavailable;

  // First, display the unavailable time slots
  unavailableSlots.forEach((slot) => {
    const timeSlot = document.createElement('div');
    timeSlot.classList.add('time-slot', 'disabled');
    timeSlot.textContent = slot;
    timeSlotsContainer.appendChild(timeSlot);
  });

  // Then, display the available time slots
  availableSlots.forEach((slot) => {
    const timeSlot = document.createElement('div');
    timeSlot.classList.add('time-slot');
    timeSlot.textContent = slot;

    // Extract the hour from the time string and set it as a data attribute
    const hour = parseTime(slot); // Make sure this function returns the correct hour
    timeSlot.setAttribute('data-hour', hour); // Set data-hour attribute

    // Add click event for available slots
    timeSlot.addEventListener('click', function () {
      this.classList.toggle('selected');
    });
    timeSlotsContainer.appendChild(timeSlot);
  });
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
      const selectedIndex = selectedCourts.indexOf(index);

      if (selectedIndex === -1) {
        // If not already selected, add to selectedCourts
        selectedCourts.push(index);
        this.classList.add('selected');
      } else {
        // If already selected, remove from selectedCourts
        selectedCourts.splice(selectedIndex, 1);
        this.classList.remove('selected');
      }

      log('Selected courts:', selectedCourts); // Debugging log
    });

    courtImagesContainer.appendChild(imgContainer);
  });
}

doc.addEventListener('DOMContentLoaded', async function () {
  var calendarEl = getById('calendar');

  // Get the current date in the Philippines timezone
  const options = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // Use 'en-CA' to get YYYY-MM-DD format
  const currentDate = formatter.format(new Date()).replace(/\//g, '-');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    validRange: {
      start: currentDate
    },
    dateClick: async function (info) {
      doc.querySelectorAll('.fc-daygrid-day').forEach((day) => day.classList.remove('selected-date'));
      info.dayEl.classList.add('selected-date');
      selectedDate = info.dateStr;
      log('Selected date:', selectedDate);

      // Fetch data for the selected date
      const { availabilityData } = await fetchCourtData(courtId, selectedDate);
      if (availabilityData) {
        generateTimeSlots(availabilityData);
      }
    },
    datesSet: async function (dateInfo) {
      // Highlight reserved dates every time the view changes
      highlightReservedDates(reservedDates);
    }
  });
  calendar.render();

  // Get court ID from URL
  const queryParams = new URLSearchParams(window.location.search);
  const courtId = queryParams.get('id');

  console.log('Current Date in Philippines:', currentDate);

  if (courtId) {
    const {
      courtData,
      availabilityData,
      reservedDates: fetchedReservedDates
    } = await fetchCourtData(courtId, currentDate);
    if (courtData) {
      populateCourtImagesAndLocation(courtData);
      generateTimeSlots(availabilityData); // Generate time slots

      // Store reserved dates globally
      reservedDates = fetchedReservedDates;
      highlightReservedDates(reservedDates); // Highlight reserved dates
    }
  }
});

// function to check if time slots are continuous
function areTimeSlotsContinuous(selectedSlots) {
  // extract the hour data
  const hours = selectedSlots.map((slot) => parseInt(slot.getAttribute('data-hour')));

  // sort the hours and check if they are consecutive
  hours.sort((a, b) => a - b);

  for (let i = 1; i < hours.length; i++) {
    if (hours[i] !== hours[i - 1] + 1) {
      return false; // Time slots are not continuous
    }
  }
  return true;
}

// function to group time slots
function groupTimeSlots(selectedSlots) {
  const hours = selectedSlots.map((slot) => parseInt(slot.getAttribute('data-hour')));
  hours.sort((a, b) => a - b);

  const firstHour = hours[0];
  const lastHour = hours[hours.length - 1];

  const fromTimeSlot = selectedSlots.find((slot) => parseInt(slot.getAttribute('data-hour')) === firstHour);
  const toTimeSlot = selectedSlots.find((slot) => parseInt(slot.getAttribute('data-hour')) === lastHour);

  return {
    from: fromTimeSlot.textContent.split(' - ')[0],
    to: toTimeSlot.textContent.split(' - ')[1]
  };
}

getById('reserveButton').addEventListener('click', function () {
  const selectedSlots = Array.from(getAll('.time-slot.selected'));

  log(selectedSlots);

  if (selectedSlots.length === 0) {
    alert('Please select at least one time slot.');
    return;
  }

  // group time slots into one reservation
  const groupedTimeSlot = groupTimeSlots(selectedSlots);

  // send the grouped time slot to the backend
  submitReservation(groupedTimeSlot);

  // remove 'selected' class from all selected time slots to reset selection
  selectedSlots.forEach((slot) => {
    slot.classList.remove('selected');
  });
});

async function fetchCourtData(courtId, selectedDate) {
  try {
    const response = await fetch(`/user/court/${courtId}`);
    if (!response.ok) {
      throw new Error(`Error fetching court data: ${response.status}`);
    }
    const courtData = await response.json();

    // Fetch availability for the selected date
    const availabilityResponse = await fetch(`/user/availability?date=${selectedDate}&courtId=${courtId}`);
    if (!availabilityResponse.ok) {
      throw new Error(`Error fetching availability: ${availabilityResponse.status}`);
    }
    const availabilityData = await availabilityResponse.json();

    // Return both court data and availability data, including reserved dates
    return { courtData, availabilityData, reservedDates: availabilityData.reservedDates };
  } catch (err) {
    error(err);
    return null;
  }
}

// Function to highlight reserved dates
function highlightReservedDates(reservedDates) {
  const calendarDays = getAll('.fc-daygrid-day');

  calendarDays.forEach((day) => {
    const date = day.getAttribute('data-date'); // Get the date attribute
    if (reservedDates.includes(date)) {
      day.classList.add('reserved'); // Add reserved class if the date is reserved
    } else {
      day.classList.remove('reserved'); // Remove reserved class if the date is not reserved
    }
  });
}

// Function to submit reservation to the backend
async function submitReservation(timeSlot) {
  log(timeSlot);
  log(selectedCourts);
  log(selectedDate);

  // const queryParams = new URLSearchParams(window.location.search);
  // const courtId = queryParams.get('id');
  // const reservationData = {
  //   courtId: courtId,
  //   date: getById('calendar').value,  // Assuming you have a date input field
  //   timeSlot: timeSlot,
  //   selectedCourt: []  // Pass the selected court IDs here
  // };
  // try {
  //   const response = await fetch('/user/reserve', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(reservationData)
  //   });
  //   if (!response.ok) {
  //     throw new Error('Failed to reserve time slot');
  //   }
  //   alert('Reservation successful!');
  // } catch (err) {
  //   console.error(err);
  //   alert('An error occurred while making the reservation');
  // }
}
