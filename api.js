const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

//const serviceAccount = require( './serviceAccountKey.json'); // Your downloaded key
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Set up Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Serve static HTML files
//app.use(express.static(path.join(__dirname, '..')));

// Import and mount API modules
const aboutApi = require('./pages/about');
const userApi = require('./pages/user');
const nuggetsApi = require('./pages/nuggets');
const quoteApi = require('./pages/quote');
const eventsApi = require('./pages/events');
const thursSermonApi = require('./pages/thursSermon');
const sundaySermonApi = require('./pages/sundaySermon');
app.use('/about', aboutApi);
app.use('/users', userApi);
app.use('/nuggets', nuggetsApi);
app.use('/events', eventsApi);
app.use('/quote', quoteApi);
app.use('/thursSermon', thursSermonApi);
app.use('/sundaySermon', sundaySermonApi);

// Start the server
app.listen(port, () => {console.log(`Server running at http://localhost:${port}`)});


