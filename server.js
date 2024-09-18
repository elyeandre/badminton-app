require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// serve public folder as static
app.use(express.static(path.join(__dirname, 'public')));

// For logging HTTP requests.
app.use(morgan('dev'));

/**
 *
 * Helmet helps you secure your Express app by setting various HTTP headers
 * It protects against common security vulnerabilities like clickjacking, XSS, etc.
 *
 **/

app.use(helmet());

/**
 *
 * CORS middleware allows your API to be accessed from other origins (domains)
 * It's useful when your frontend and backend are hosted on different domains or ports
 *
 **/
app.use(cors());

// if (process.env.NODE_ENV === 'development') {
//   app.use('*', createProxyMiddleware({ target: 'http://127.0.0.1:3000', ws: true }));
// }

// Initialize and register all the application routes
const initRoutes = require('./src/routes/routes');
initRoutes(app);

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
