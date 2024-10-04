document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        validRange: {
            start: new Date().toISOString().split('T')[0],  // Restrict past dates
        },
        dateClick: function (info) {
            // Remove previous selections
            document.querySelectorAll('.fc-daygrid-day').forEach(day => day.classList.remove('selected-date'));
            
            // Add highlight to the clicked date
            info.dayEl.classList.add('selected-date');
        }
    });
    calendar.render();

    // Dummy data
    let operatingHours = { start: 9, end: 22 }; // 9 AM to 10 PM
    let availableCourts = 9;

    // Dynamically generate time slots with time ranges
    function generateTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        timeSlotsContainer.innerHTML = ''; // Clear existing slots

        for (let hour = operatingHours.start; hour < operatingHours.end; hour++) {
            let nextHour = hour + 1;
            let amPmStart = hour < 12 ? 'AM' : 'PM';
            let amPmEnd = nextHour < 12 ? 'AM' : 'PM';
            
            // Adjust hour display for 12-hour format
            let displayHourStart = hour % 12 === 0 ? 12 : hour % 12;
            let displayHourEnd = nextHour % 12 === 0 ? 12 : nextHour % 12;

            // Create time slot with range
            let timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = `${displayHourStart}:00 ${amPmStart} - ${displayHourEnd}:00 ${amPmEnd}`;
            
            // Add click event to toggle selection
            timeSlot.addEventListener('click', function () {
                this.classList.toggle('selected');
            });
            
            timeSlotsContainer.appendChild(timeSlot);
        }
    }

    // Dynamically generate court slots
    function generateCourtImages() {
        const courtImagesContainer = document.getElementById('courtImages');
        courtImagesContainer.innerHTML = ''; // Clear existing courts
        for (let i = 1; i <= availableCourts; i++) {
            let courtImage = document.createElement('div');
            courtImage.classList.add('court-image');
            courtImage.textContent = `Court ${i}`;
            courtImage.addEventListener('click', function () {
                this.classList.toggle('selected');
            });
            courtImagesContainer.appendChild(courtImage);
        }
    }

    // Initialize time slots and courts
    generateTimeSlots();
    generateCourtImages();
});

// File Upload Display
function showFileName(input) {
    const fileName = input.files[0] ? input.files[0].name : 'No file chosen';
    input.nextElementSibling.textContent = fileName;
}
