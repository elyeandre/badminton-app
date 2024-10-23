// Get the modal
var modal = document.getElementById("addModal");

// Get the button that opens the modal
var btn = document.getElementById("add-post");

// Get the category select element
var categorySelect = document.getElementById("category");

// Get all the form sections
var eventFields = document.getElementById("event-fields");
var tournamentFields = document.getElementById("tournament-fields");
var membershipFields = document.getElementById("membership-fields");

// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = "flex";
    hideAllFields();
};

// Show/hide fields based on the selected category
categorySelect.onchange = function() {
    hideAllFields(); // Reset the visibility of all fields

    if (this.value === "event") {
        eventFields.style.display = "block";
    } else if (this.value === "tournament") {
        tournamentFields.style.display = "block";
    } else if (this.value === "membership") {
        membershipFields.style.display = "block";
    }
};

// Function to hide all fields
function hideAllFields() {
    eventFields.style.display = "none";
    tournamentFields.style.display = "none";
    membershipFields.style.display = "none";
}

// Ensure the correct upload buttons and preview containers are used
const input = document.createElement('input');
input.type = 'file';
input.id = 'imageInput';
input.accept = 'image/*';
input.style.display = 'none'; // Hide the input
document.body.appendChild(input); // Append it to the body

const previewContainer = document.getElementById("imagePreviewContainer");
let images = [];

// Trigger the file input when the upload button is clicked
document.getElementById("uploadButton").addEventListener("click", () => input.click());

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
    container.innerHTML = '';  // Clear existing previews
    images.forEach(image => {
        const div = document.createElement('div');
        div.classList.add('image-preview');
        div.innerHTML = `
            <img src="${image.src}" alt="Image Preview">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeImage('${image.id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    });
};

// Function to remove an image from preview
window.removeImage = function(id) {
    images = images.filter(image => image.id !== id);
    updateImagePreviews(images, previewContainer);
};
