import '../../../css/pages/verification/verification.css';

const doc = document;
const { log, error } = console;

const getById = (id) => doc.getElementById(id);
const getAll = (selector) => doc.querySelectorAll(selector);
const get = (selector) => doc.querySelector(selector);

doc.addEventListener('DOMContentLoaded', function () {
  const verificationForm = getById('verification-form');
  const token = new URLSearchParams(window.location.search).get('token'); // get token from URL
  const verificationError = getById('verification-code-error');

  verificationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const otp = formData.get('verification_code').trim();

    await verifyOTP(token, otp);
  });

  const verifyOTP = async (token, otp) => {
    try {
      const response = await fetch('/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, otp })
      });

      const result = await response.json();
      if (response.status === 200) {
        alert('Email verified successfully!');
        window.location.href = '/login';
      } else {
        error(result.message);
        if (result.message && result.message === 'Invalid OTP') {
          verificationError.innerText = 'Invalid OTP';
          verificationError.classList.add('show');

          setTimeout(() => {
            verificationError.classList.remove('show');
          }, 2000);
        } else if (result.errors && result.errors[0].message === 'OTP must be exactly 6 digits long.') {
          verificationError.innerText = result.errors[0].message;
          verificationError.classList.add('show');

          setTimeout(() => {
            verificationError.classList.remove('show');
          }, 2000);
        } else {
          verificationError.innerText = 'Verification failed. Please try again.';
          verificationError.classList.add('show');

          setTimeout(() => {
            verificationError.classList.remove('show');
          }, 2000);
        }
      }
    } catch (err) {
      error('Verification error:', err);
      verificationError.innerText = err.message;
      verificationError.classList.add('show');

      setTimeout(() => {
        verificationError.classList.remove('show');
      }, 2000);
    }
  };
});
