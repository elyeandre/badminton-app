import '../../../css/pages/signIn/signIn.css';

const doc = document;
const { log, error } = console;

const getById = (id) => doc.getElementById(id);
const getAll = (selector) => doc.querySelectorAll(selector);
const get = (selector) => doc.querySelector(selector);

doc.addEventListener('DOMContentLoaded', function () {
  const loginForm = getById('loginform');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const username = formData.get('username');
    const password = formData.get('password');
    const userType = formData.get('userType');

    // attempt to log in
    const success = await sendLoginRequest(username, password, userType);
    if (!success) {
      log('Login failed');
    }
  });
});

const sendLoginRequest = async (username, password, role) => {
  log(username, password, role);
  try {
    const response = await fetch('/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        role
      })
    });

    const result = await response.json();

    if (response.status === 200 && result.success) {
      // handle different actions based on the response from the backend
      if (result.action === 'verify') {
        // redirect to verification page
        window.location.href = result.verificationUrl;
      } else if (result.action === 'redirect') {
        // redirect to the role-specific page
        window.location.href = result.redirectUrl;
      }
    } else {
      // show an error message to the user
      alert(result.message);
      return false;
    }
  } catch (err) {
    error('Error logging in:', err);
    alert('An error occurred while logging in. Please try again.');
    return false;
  }
};
