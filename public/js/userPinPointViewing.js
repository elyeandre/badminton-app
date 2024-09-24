// Toggle popup visibility
function togglePopup() {
    const popup = document.getElementById('popupProfile');
    popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
}

// Show popup when location icon is clicked
document.querySelector('.location-icon').addEventListener('click', togglePopup);

// Image upload preview
document.getElementById('pin-image-upload').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const img = document.getElementById('pin-preview');
        img.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});

// Carousel functionality
let currentIndex = 0;
const images = document.querySelectorAll('.carousel-images img');
const totalImages = images.length;

function showSlide(index) {
    const carouselImages = document.querySelector('.carousel-images');
    const width = images[0].clientWidth;
    carouselImages.style.transform = `translateX(${-index * width}px)`;
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % totalImages;
    showSlide(currentIndex);
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
    showSlide(currentIndex);
}

// Automatic slide
setInterval(nextSlide, 3000); // Change slide every 3 seconds