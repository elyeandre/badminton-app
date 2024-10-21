// Function to display the appropriate form fields based on the selected type
function showFormFields() {
    const selectedType = document.getElementById('typeSelector').value;

    // Hide all sections initially
    document.getElementById('announcementFields').style.display = 'none';
    document.getElementById('eventFields').style.display = 'none';
    document.getElementById('tournamentFields').style.display = 'none';
    document.getElementById('trainingMembershipFields').style.display = 'none';

    // Show the relevant section based on selected value
    if (selectedType === 'announcement') {
        document.getElementById('announcementFields').style.display = 'block';
    } else if (selectedType === 'event') {
        document.getElementById('eventFields').style.display = 'block';
    } else if (selectedType === 'tournament') {
        document.getElementById('tournamentFields').style.display = 'block';
    } else if (selectedType === 'membership') {
        document.getElementById('trainingMembershipFields').style.display = 'block';
    }
}

// Ensure the correct upload buttons and preview containers are used
document.querySelectorAll('[id^="uploadButton"]').forEach((button, index) => {
    const input = document.querySelectorAll('[id^="imageInput"]')[index];
    const previewContainer = document.querySelectorAll('[id^="imagePreviewContainer"]')[index];

    let images = [];

    // Trigger the file input when the upload button is clicked
    button.addEventListener("click", () => input.click());

    // Handle image input change
    input.addEventListener("change", function() {
        Array.from(this.files).forEach(file => { 
            if (images.length >= 5) {
                alert("You can upload a maximum of 5 images.");
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const id = Date.now().toString();
                images.push({ id, src: reader.result, file });
                updateImagePreviews(images, previewContainer);
            };
        });
    });

    // Function to update image preview area
    function updateImagePreviews(images, container) {
        container.innerHTML = '';
        images.forEach(image => {
            const div = document.createElement('div');
            div.classList.add('image-preview');
            div.innerHTML = `<img src="${image.src}" alt="Image Preview">
                            <button type="button" class="btn btn-danger btn-sm" onclick="removeImage('${image.id}', images, container)"><i class="fas fa-times"></i></button>`;
            container.appendChild(div);
        });
    }

    // Function to remove an image from preview
    window.removeImage = function(id, images, container) {
        images = images.filter(image => image.id !== id);
        updateImagePreviews(images, container);
    };
});

// Handle event-based registration switch
const registrationSwitchEvent = document.getElementById('registrationSwitchEvent');
const registrationFieldsEvent = document.getElementById('registrationFieldsEvent');
registrationSwitchEvent.addEventListener('change', function () {
    if (this.checked) {
        registrationFieldsEvent.style.display = 'block';
    } else {
        registrationFieldsEvent.style.display = 'none';
    }
});

// Handle event-based fee switch
const feeSwitchEvent = document.getElementById('feeSwitchEvent');
const feeFieldsEvent = document.getElementById('feeFieldsEvent');
feeSwitchEvent.addEventListener('change', function () {
    if (this.checked) {
        feeFieldsEvent.style.display = 'block';
    } else {
        feeFieldsEvent.style.display = 'none';
    }
});

// Handle tournament-based registration switch
const registrationSwitchTournament = document.getElementById('registrationSwitchTournament');
const registrationFieldsTournament = document.getElementById('registrationFieldsTournament');
registrationSwitchTournament.addEventListener('change', function () {
    if (this.checked) {
        registrationFieldsTournament.style.display = 'block';
    } else {
        registrationFieldsTournament.style.display = 'none';
    }
});

// Handle tournament-based fee switch
const feeSwitchTournament = document.getElementById('feeSwitchTournament');
const feeFieldsTournament = document.getElementById('feeFieldsTournament');
feeSwitchTournament.addEventListener('change', function () {
    if (this.checked) {
        feeFieldsTournament.style.display = 'block';
    } else {
        feeFieldsTournament.style.display = 'none';
    }
});

// Handle training membership-based registration switch
const registrationSwitchTrainingMembership = document.getElementById('registrationSwitchTrainingMembership');
const registrationFieldsTrainingMembership = document.getElementById('registrationFieldsTrainingMembership');
registrationSwitchTrainingMembership.addEventListener('change', function () {
    if (this.checked) {
        registrationFieldsTrainingMembership.style.display = 'block';
    } else {
        registrationFieldsTrainingMembership.style.display = 'none';
    }
});

// Handle membership-based fee switch
const feeSwitchMembership = document.getElementById('feeSwitchMembership');
const feeFieldsMembership = document.getElementById('feeFieldsMembership');
feeSwitchTournament.addEventListener('change', function () {
    if (this.checked) {
        feeFieldsMembership.style.display = 'block';
    } else {
        feeFieldsMembership.style.display = 'none';
    }
});

// Handle training membership-based fee switch
const feeSwitchTrainingMembership = document.getElementById('feeSwitchTrainingMembership');
const feeFieldsTrainingMembership = document.getElementById('feeFieldsTrainingMembership');
feeSwitchTrainingMembership.addEventListener('change', function () {
    if (this.checked) {
        feeFieldsTrainingMembership.style.display = 'block';
    } else {
        feeFieldsTrainingMembership.style.display = 'none';
    }
});
