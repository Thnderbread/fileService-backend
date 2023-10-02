const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const connectDB = require('./config/connection');
const passportSetup = require('./config/passport-setup');
const app = express();

// Connect to MongoDB
connectDB();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_KEY_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 600000
    },
}))

// routes

// file contains login, google auth, and logout routes & handlers
app.use('/', require('./routes/index')); // testing
app.use('/auth', require('./routes/auth-routes'));

mongoose.connection.once('open', () => {
    console.log("Successfully connected to MongoDB.");
    app.listen(8080, () => console.log("App now listening on http://localhost:8080"));
})