const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
try {
  serviceAccount = require('./ServiceAccountKey.json');
} catch (e) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Set up Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '5mb' }));
app.use(cors());

// Serve static HTML files
//app.use(express.static(path.join(__dirname, '..')));

// Import and mount API modules
const userApi = require('./pages/user');
const quoteApi = require('./pages/Scripture');
const eventsApi = require('./pages/events');
const thursSermonApi = require('./pages/thursSermon');
const sundaySermonApi = require('./pages/sundaySermon');
const servicesApi = require('./pages/services');

app.use('/users', userApi);
app.use('/quote', quoteApi);
app.use('/thursSermon', thursSermonApi);
app.use('/sundaySermon', sundaySermonApi);
app.use('/events', eventsApi);
app.use('/services', servicesApi);

// Start the server
app.listen(port, () => {console.log(`Server running at http://localhost:${port}`)});
