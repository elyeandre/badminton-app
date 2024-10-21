document.addEventListener('DOMContentLoaded', () => {
    // Fetch the side navigation
    fetch('sideNavAdmin.html')
        .then(response => response.text())
        .then(data => {
            // Insert the fetched HTML into the navbar element
            document.getElementById('navbar').innerHTML = data;

            // After the sidebar is inserted, initialize the sidebar functionality
            initializeSidebar(); // Set up toggle functionality
        })
        .then(() => {
            // Once the sidebar is fully rendered, highlight the active link
            highlightActiveLink();
        })
        .catch(error => console.error('Error loading the navbar:', error));
});

function initializeSidebar() {
    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");

    closeBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        menuBtnChange();
    });

    function menuBtnChange() {
        if (sidebar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
        } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
        }
    }

    menuBtnChange(); // Initialize the menu icon
}

function highlightActiveLink() {
    // Get the current page URL
    const currentUrl = window.location.href;

    // Get all the anchor tags in the dynamically loaded sidebar
    const links = document.querySelectorAll('.sidebar .nav-list li a');

    // Check if sidebar links are found
    if (links.length > 0) {
        // Loop through all links and add the 'active' class to the matching one
        links.forEach(link => {
            if (link.href === currentUrl) {
                link.classList.add('active');
            }
        });
    } else {
        console.error('No sidebar links found.');
    }
}
