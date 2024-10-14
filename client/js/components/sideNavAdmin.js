document.addEventListener('DOMContentLoaded', () => {
  // Get all the anchor tags in the sidebar
  const links = document.querySelectorAll('.sidebar .nav-list li a');
  // Get the current page URL
  const currentUrl = window.location.href;
import { capitalizeFirstLetter, fetchUserData } from '../../utils/userData.js';

  // Loop through all links and add the 'active' class to the matching one
  links.forEach((link) => {
    if (link.href === currentUrl) {
      link.classList.add('active');
    }
  });

  // Initialize sidebar
  initializeSidebar();
});

function initializeSidebar() {
  let sidebar = document.querySelector('.sidebar');
  let closeBtn = document.querySelector('#btn');

  closeBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    menuBtnChange();
  });

  function menuBtnChange() {
    if (sidebar.classList.contains('open')) {
      closeBtn.classList.replace('bx-menu', 'bx-menu-alt-right');
    } else {
      closeBtn.classList.replace('bx-menu-alt-right', 'bx-menu');
    }
  }

  menuBtnChange(); // Initialize the menu icon
}
