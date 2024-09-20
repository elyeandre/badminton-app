import '../css/signUp.css';

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
});
