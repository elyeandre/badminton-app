import validator from 'validator';
import '../../../css/pages/signUp/signUp.css';

const doc = document;
const { log, error } = console;

const getById = (id) => doc.getElementById(id);
const getAll = (selector) => doc.querySelectorAll(selector);
const get = (selector) => doc.querySelector(selector);

doc.addEventListener('DOMContentLoaded', function () {
  const courtOwnerLink = getById('courtOwnerLink');
  const userLink = getById('userLink');
  const courtOwnerFormContainer = getById('courtOwnerFormContainer');
  const userFormContainer = getById('userFormContainer');
  const closeCourtOwnerForm = getById('closeCourtOwnerForm');
  const closeUserForm = getById('closeUserForm');
  const courtOwnerForm = getById('ownerSignUpForm');
  const userForm = getById('userSignUpForm');

  // Show Court Owner Form
  courtOwnerLink.addEventListener('click', function (event) {
    event.preventDefault();
    courtOwnerFormContainer.classList.add('show');
    userFormContainer.classList.remove('show');
  });

  // Show User Form
  userLink.addEventListener('click', function (event) {
    event.preventDefault();
    userFormContainer.classList.add('show');
    courtOwnerFormContainer.classList.remove('show');
  });

  // Close Court Owner Form
  closeCourtOwnerForm.addEventListener('click', function () {
    courtOwnerFormContainer.classList.remove('show');
  });

  // Close User Form
  closeUserForm.addEventListener('click', function () {
    userFormContainer.classList.remove('show');
  });

  // event listener for user form submission
  userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(userForm);
    const roleType = formData.get('user_type').toLowerCase();
    await handleFormSubmit(userForm, roleType);
  });

  const handleFormSubmit = async (form, role) => {
    const formData = new FormData(form);

    const userObject = buildUserObject(formData, role);
    log(userObject);

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userObject)
      });

      const result = await response.json();
      if (response.status === 201) {
        alert('Registration successful!');
        form.reset();
        // redirect to verification page with base64 email
        window.location.href = result.redirectUrl;
      } else {
        // Check if the email already exists
        if (result.error === 'Email already exists') {
          alert('The email is already registered. Please try another one.');
        } else {
          alert('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  // event listener for courtOwner form submission
  courtOwnerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const roleType = 'admin';
    await handleFormSubmit(courtOwnerForm, roleType);
  });
});

const buildUserObject = (formData, role) => {
  const isAdmin = role === 'admin';
  const suffix = isAdmin ? '_owner' : '_user';

  const userObject = {
    first_name: formData.get(`first_name${suffix}`).trim(),
    middle_name: formData.get(`middle_name${suffix}`).trim(),
    last_name: formData.get(`last_name${suffix}`).trim(),
    email: formData.get(`email${suffix}`).trim(),
    username: formData.get(`username${suffix}`).trim(),
    password: formData.get(`password1${suffix}`).trim(),
    confirm_password: formData.get(`password2${suffix}`).trim(),
    gender: formData.get(`gender${suffix}`).trim(),
    date_of_birth: formData.get(`date_of_birth${suffix}`).trim(),
    municipality: formData.get(`municipality${suffix}`).trim(),
    contact_number: formData.get(`contact_number${suffix}`).trim(),
    role: role || formData.get(`role${suffix}`).trim()
  };

  // add status_owner only if the role is 'Admin'
  if (isAdmin) {
    userObject.status_owner = formData.get(`status${suffix}`);
  }

  return userObject;
};
