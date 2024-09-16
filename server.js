require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();

global.__basedir = __dirname;

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

app.get('/', (req, res) => {
  res.sendFile(basedir, '/index.html');
});

// For logging HTTP requests.
app.use(morgan('dev'));

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
