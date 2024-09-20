// Get the modal
var modal = document.getElementById("logoutModal");

// Get the button that opens the modal
var btn = document.getElementById("logoutBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Get the confirm and cancel buttons
var confirmLogout = document.getElementById("confirmLogout");
var cancelLogout = document.getElementById("cancelLogout");

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks on cancel, close the modal
cancelLogout.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks on confirmLogout, handle logout
confirmLogout.onclick = function() {
    // Handle the logout process here (e.g., redirect to a logout URL)
    window.location.href = "logout.php"; // Adjust this to your logout URL
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}