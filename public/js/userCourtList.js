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
    const translateX = -index * 100;
    carouselImages.style.transform = `translateX(${translateX}%)`;
}

function prevSlide() {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalImages - 1;
    showSlide(currentIndex);
}

function nextSlide() {
    currentIndex = (currentIndex < totalImages - 1) ? currentIndex + 1 : 0;
    showSlide(currentIndex);
}