require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');
const createError = require('http-errors');
const { log } = console;
const { error } = console;

const config = require('config');

// database connection
const connectDB = require('./config/db');
connectDB(config);

const app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'client', 'views'));

// CORS middleware allows your API to be accessed from other origins (domains)
app.use(cors());
// enable compression reduces the size of html css and js to significantly improves the latency
app.use(compression());
// for logging HTTP requests.
app.use(morgan('dev'));
//It protects against common security vulnerabilities like clickjacking, XSS, etc.
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      scriptSrc: [
        "'self'",
        'https://code.jquery.com',
        'https://cdn.jsdelivr.net',
        'https://stackpath.bootstrapcdn.com'
      ],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      upgradeInsecureRequests: []
    }
  })
);

// middleware to parse JSON bodies from incoming requests
app.use(express.json());
// middleware to parse URL-encoded bodies (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// serve public folder as static and cache it
app.use(
  express.static(path.join(path.join(__dirname), 'public'), {
    setHeaders(res) {
      res.setHeader('Cache-Control', 'public,max-age=31536000,immutable');
    }
  })
);

// initialize and register all the application routes
const indexRoutes = require('./src/routes/index');
const userRoutes = require('./src/routes/users');
indexRoutes(app);
userRoutes(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  const isProduction = req.app.get('env') === 'production';

  // set the error message and status
  res.locals.message = err.message;
  res.locals.error = isProduction ? null : err;

  // set the response status (default to 500 if none is set)
  const statusCode = err.status || 500;
  res.status(statusCode);

  // render the error page and pass the status and message
  res.render('error', {
    error: isProduction ? null : err,
    status: statusCode,
    message: err.message
  });
});

const server = app.listen(config.get('port'), config.get('host'), () => {
  console.log(`Server is running at http://${config.get('host')}:${config.get('port')}`);
});

// handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');

  // close server connections
  server.close(async () => {
    console.log('Closed out remaining connections.');

    // close MongoDB connection
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (error) {
      console.error('Error while closing MongoDB connection:', error);
    }

    process.exit(0);
  });
});
