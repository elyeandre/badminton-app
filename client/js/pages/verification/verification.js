import '../../../css/pages/verification/verification.css';

const doc = document;
const { log, error } = console;

const getById = (id) => doc.getElementById(id);
const getAll = (selector) => doc.querySelectorAll(selector);
const get = (selector) => doc.querySelector(selector);

doc.addEventListener('DOMContentLoaded', function () {
  const verificationForm = getById('verification-form');
  const email = new URLSearchParams(window.location.search).get('email');

  verificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const otp = formData.get('verification_code').trim();
    await verifyOTP(email, otp);
  });
});

const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch('/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    const result = await response.json();
    if (response.status === 200) {
      alert('Email verified successfully!');
      window.location.href = '/login';
    } else {
      console.error(result.error);
    }
  } catch (error) {
    console.error('Verification error:', error);
  }
};
