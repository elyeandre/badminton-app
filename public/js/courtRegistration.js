function showFileName(input) {
    var fileName = input.files[0] ? input.files[0].name : 'No file chosen';
    var span = input.nextElementSibling;
    span.textContent = fileName;
}

function addAmenity() {
var container = document.querySelector('.amenities-container');
var amenityField = document.createElement('div');
amenityField.classList.add('amenity-field');

var input = document.createElement('input');
input.type = 'text';
input.name = 'amenities[]';
input.placeholder = 'Enter amenity';
input.required = true;

var removeBtn = document.createElement('button');
removeBtn.type = 'button';
removeBtn.innerHTML = '&#x2715;'; // 'x' symbol for remove button
removeBtn.classList.add('remove-amenity-btn');
removeBtn.onclick = function() {
removeAmenity(removeBtn);
};

amenityField.appendChild(input);
amenityField.appendChild(removeBtn);
container.insertBefore(amenityField, container.querySelector('.add-amenity-btn')); // Add new field before the "Add more" button
}


function removeAmenity(button) {
    var amenityField = button.parentNode;
    amenityField.remove();
}