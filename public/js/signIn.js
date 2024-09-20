function handleSubmit(event) {
    event.preventDefault();
    var userType = document.querySelector('select[name="userType"]').value;
    if (userType === "Admin") {
        window.location.href = "adminDash.html";
    } else if (userType === "Coach" || userType === "Player") {
        window.location.href = "home.html";
    } else {
        alert("Please select a user type.");
    }
}