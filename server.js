require('dotenv').config();
const cors = require('cors');
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const connectDB = require('./config/connection');
const passportSetup = require('./config/passport-setup');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const ensureAuthenticated = require('./middleware/ensureAuthenticated');
const app = express();

const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:3000',
    'http:localhost://8080'
]

// Connect to MongoDB
connectDB();

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS.'))
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE']
}));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.SESSION_KEY_SECRET));
app.use(express.json());

app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_KEY_SECRET],
    maxAge: 18_000_000, // 30 min
    httpOnly: false,
    secure: false
}))

// file contains local login strategy, google auth strategy, and logout routes & handlers
app.use('/', require('./routes/index')); // testing
app.use('/auth', require('./routes/auth-routes'));

app.use(passport.initialize());
app.use(passport.session());

// routes for file stuff
app.use('/api/files', ensureAuthenticated, require('./routes/api/files.js'));

// Loggers & handlers
app.use(errorHandler);
app.use(requestLogger);

mongoose.connection.once('open', () => {
    console.log("Successfully connected to MongoDB.");
    app.listen(8080, () => console.log("App now listening on http://localhost:8080"));
})