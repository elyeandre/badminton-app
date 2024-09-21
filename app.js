require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// serve public folder as static and cache it
app.use(
  express.static(path.join(path.join(__dirname), 'public'), {
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public,max-age=31536000,immutable');
    }
  })
);

// For logging HTTP requests.
app.use(morgan('dev'));

/**
 *
 * Helmet helps you secure your Express app by setting various HTTP headers
 * It protects against common security vulnerabilities like clickjacking, XSS, etc.
 * TODO: Change http to https
 **/

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'http:'], // Allow HTTP resources
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'http:', 'data:'],
//       formAction: ["'self'", 'http:'], // Allow HTTP for form actions
//       frameAncestors: ["'self'"],
//       imgSrc: ["'self'", 'http:', 'data:'], // Allow HTTP images and data URIs
//       objectSrc: ["'none'"],
//       scriptSrc: [
//         "'self'",
//         'http:', // Allow HTTP scripts
//         'https://code.jquery.com',
//         'https://cdn.jsdelivr.net',
//         'https://stackpath.bootstrapcdn.com'
//       ],
//       scriptSrcAttr: ["'none'"],
//       styleSrc: ["'self'", 'http:', "'unsafe-inline'"] // Allow HTTP styles
//       // Temporarily disable this
//       // upgradeInsecureRequests: []
//     }
//   })
// );

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'data:'],
//       formAction: ["'self'"],
//       frameAncestors: ["'self'"],
//       imgSrc: ["'self'", 'data:'],
//       objectSrc: ["'none'"],
//       scriptSrc: [
//         "'self'",
//         'https://code.jquery.com',
//         'https://cdn.jsdelivr.net',
//         'https://stackpath.bootstrapcdn.com'
//       ],
//       scriptSrcAttr: ["'none'"],
//       styleSrc: ["'self'", 'https:', "'unsafe-inline'"]
//       // Temporarily disable this
//       // upgradeInsecureRequests: []
//     }
//   })
// );

/**
 *
 * CORS middleware allows your API to be accessed from other origins (domains)
 * It's useful when your frontend and backend are hosted on different domains or ports
 *
 **/
// app.use(cors());
/**
 *
 * enable compression reduces the size of html css and js to significantly improves the latency
 *
 */
app.use(compression());

// Initialize and register all the application routes
const initRoutes = require('./src/routes');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
initRoutes(app);

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
