import '../../../css/components/sideNavAdmin.css';
import '../../../css/pages/admindash/adminDash.css';
import '../../components/sideNavAdmin.js';

const doc = document;
const { log, error } = console;

const getById = (id) => doc.getElementById(id);
const getAll = (selector) => doc.querySelectorAll(selector);
const get = (selector) => doc.querySelector(selector);

const createLink = (url, text) => {
  const link = doc.createElement('a');
  link.href = url;
  link.textContent = text;
  link.target = '_blank';
  return link;
};

const createImage = (url, altText) => {
  const img = doc.createElement('img');
  img.src = url;
  img.alt = altText || 'Image';
  img.classList.add('court-image');
  img.style.maxWidth = '150px';
  img.style.margin = '10px';
  return img;
};

const listCourtAssets = (court) => {
  const docContainer = getById('documentLinksContainer');
  docContainer.innerHTML = '';
  docContainer.classList.add('centered-links');

  const { documents, court_images, business_logo, facilities } = court;

  // Handle documents section
  if (documents) {
    for (const [key, docArray] of Object.entries(documents)) {
      const sectionWrapper = doc.createElement('div');
      sectionWrapper.classList.add('document-section');

      const sectionTitle = doc.createElement('h4');
      sectionTitle.textContent = key;
      sectionWrapper.appendChild(sectionTitle);

      docArray.forEach((docUrl) => {
        const link = createLink(docUrl, docUrl.split('/').pop());
        sectionWrapper.appendChild(link);
        sectionWrapper.appendChild(doc.createElement('br'));
      });

      docContainer.appendChild(sectionWrapper);
    }
  }

  // Handle court images
  if (court_images && court_images.length) {
    const courtImagesWrapper = doc.createElement('div');
    courtImagesWrapper.classList.add('image-section');
    const courtImagesTitle = doc.createElement('h4');
    courtImagesTitle.textContent = 'Court Images';
    courtImagesWrapper.appendChild(courtImagesTitle);

    court_images.forEach((imageUrl) => {
      const img = createImage(imageUrl, 'Court Image');
      courtImagesWrapper.appendChild(img);
    });

    docContainer.appendChild(courtImagesWrapper);
  }

  // Handle business logo
  if (business_logo) {
    const businessLogoWrapper = doc.createElement('div');
    businessLogoWrapper.classList.add('image-section');
    const businessLogoTitle = doc.createElement('h4');
    businessLogoTitle.textContent = 'Business Logo';
    businessLogoWrapper.appendChild(businessLogoTitle);

    const img = createImage(business_logo, 'Business Logo');
    businessLogoWrapper.appendChild(img);

    docContainer.appendChild(businessLogoWrapper);
  }

  // Handle facility images
  if (facilities && facilities.length) {
    const facilityImagesWrapper = doc.createElement('div');
    facilityImagesWrapper.classList.add('image-section');
    const facilityImagesTitle = doc.createElement('h4');
    facilityImagesTitle.textContent = 'Facility Images';
    facilityImagesWrapper.appendChild(facilityImagesTitle);

    facilities.forEach((facilityImage) => {
      const img = createImage(facilityImage, 'Facility Image');
      facilityImagesWrapper.appendChild(img);
    });

    docContainer.appendChild(facilityImagesWrapper);
  }
};

const fetchUserData = async () => {
  try {
    const response = await fetch('/user/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies if needed
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    log('User data:', data);

    if (data.court) {
      listCourtAssets(data.court); // Populate court documents and images

      // Automatically get coordinates and open Google Maps
      if (data.court.location) {
        const { coordinates } = data.court.location; // Extract coordinates
        log(coordinates);
        openGoogleMapsWithCoordinates(coordinates); // Open Google Maps
      }
    }
  } catch (err) {
    error('Error fetching user data:', err);
  }
};

// Function to open Google Maps with provided coordinates
const openGoogleMapsWithCoordinates = (coordinates) => {
  const [longitude, latitude] = coordinates; // Destructure coordinates array

  // Construct the Google Maps URL
  const url = `https://www.google.com/maps/@${latitude},${longitude},15z`;

  // Open the URL in a new tab
  window.open(url, '_blank');
};

// Run the function on page load
window.addEventListener('DOMContentLoaded', () => {
  fetchUserData(); // Fetch user data and handle locations automatically
});
