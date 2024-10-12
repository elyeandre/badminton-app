let sessionCheckIntervalId = null;

// function to check session validity and refresh token if necessary
export function checkSessionValidity() {
  fetch('/ping', {
    method: 'GET',
    credentials: 'include' // Ensures cookies are sent
  })
    .then((response) => {
      if (response.status === 401) {
        console.log('Session invalid. Attempting to refresh token...');
        return refreshToken();
      } else {
        console.log('Session is valid.');
      }
    })
    .catch((error) => {
      console.error('Error during session validation:', error);
    });
}

// function to refresh the token
function refreshToken() {
  return fetch('/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Important: Send cookies with the request
  }).then((refreshResponse) => {
    if (refreshResponse.ok) {
      console.log('Token refreshed successfully.');
      return; // Optionally, you might want to re-fetch user data here or other resources
    } else {
      console.error('Failed to refresh token. Redirecting to login...');
      window.location.href = '/login'; // Redirect to the login page
      throw new Error('Refresh token failed');
    }
  });
}

// create a Proxy for fetch
const originalFetch = window.fetch;
window.fetch = new Proxy(originalFetch, {
  apply(fetch, that, args) {
    return fetch(...args).then((response) => {
      if (response.status === 401) {
        console.log('Token expired or invalid, attempting to refresh...');
        return refreshToken().then(() => {
          console.log('Retrying original request...');
          return fetch(...args); // Retry the original request
        });
      }
      return response; // Return original response if not 401
    });
  }
});

// Function to validate session and navigate
export function validateSessionAndNavigate(url) {
  // attempt to fetch a protected resource (e.g., profile data) to see if the session is valid
  fetch('/ping', {
    method: 'GET',
    credentials: 'include' // Ensures cookies are sent
  })
    .then((response) => {
      if (response.status === 401) {
        // if unauthorized, try refreshing the token
        return fetch('/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        }).then((refreshResponse) => {
          if (refreshResponse.ok) {
            // if the refresh was successful, retry the original request to validate the session
            console.log('Token refreshed, proceeding to page...');
            window.location.href = url; // navigate to the intended page
          } else {
            // If the refresh fails, redirect to the login page
            console.error('Failed to refresh token. Redirecting to login...');
            window.location.href = '/login';
          }
        });
      } else if (response.ok) {
        // If the session is valid, navigate to the desired page
        console.log('Session is valid. Navigating to page...');
        window.location.href = url;
      } else {
        // Handle other potential errors
        console.error('Error validating session:', response.status);
        window.location.href = '/login';
      }
    })
    .catch((error) => {
      console.error('Error during session validation:', error);
      window.location.href = '/login';
    });
}

// Function to start session checks
export function startSessionChecks() {
  // Clear any existing interval before starting a new one
  if (sessionCheckIntervalId) {
    clearInterval(sessionCheckIntervalId);
  }

  // Set up a new interval to check session validity every 40 seconds
  sessionCheckIntervalId = setInterval(checkSessionValidity, 40000);

  document.addEventListener('DOMContentLoaded', () => {
    checkSessionValidity(); // Initial session check on page load
  });
}
