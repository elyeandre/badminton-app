import '../../../css/pages/resetpassword/resetPassword.css';

const doc = document;
const { log, error } = console;

const getById = (id) => doc.getElementById(id);
const getAll = (selector) => doc.querySelectorAll(selector);
const get = (selector) => doc.querySelector(selector);

// function to show error messages
const showError = (errorElementId, message) => {
  const errorElement = getById(errorElementId);
  errorElement.textContent = message;
  errorElement.classList.add('show'); // Add the class to show the error
  errorElement.style.display = 'block'; // Ensure the error is displayed

  // Hide the error message after 2000ms
  setTimeout(() => {
    errorElement.classList.remove('show');
    errorElement.style.display = 'none'; // hide the error element
    errorElement.textContent = ''; // clear the message
  }, 2000);
};

// function to handle form submission
const handleFormSubmit = async (event) => {
  event.preventDefault();

  const newPassword = getById('new-password').value;
  const confirmPassword = getById('confirm-password').value;
  const token = new URLSearchParams(window.location.search).get('token'); // get token from URL

  // Reset previous error messages
  showError('new-password-error', '');
  showError('confirm-password-error', '');

  // simple validation
  if (newPassword.length < 8) {
    showError('new-password-error', 'Password must be at least 8 characters long.');
    return;
  }

  if (newPassword !== confirmPassword) {
    showError('confirm-password-error', 'Passwords do not match.');
    return;
  }

  try {
    const response = await fetch('/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword }) // send token and new password
    });

    const data = await response.json();

    if (data.success) {
      log('Password reset successful!'); // we can redirect or show a success message here
      // Optionally redirect the user or show a success message
      window.location.href = '/login';
    } else {
      showError('new-password-error', data.message); // Show the error message from the server
    }
  } catch (err) {
    console.error('Error during password reset:', err);
    showError('new-password-error', 'An error occurred while resetting the password.'); // Generic error message
  }
};

// attach event listener to the form
doc.addEventListener('DOMContentLoaded', () => {
  const form = getById('changePassForm');

  form.addEventListener('submit', handleFormSubmit);
});
