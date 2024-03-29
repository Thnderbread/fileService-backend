require('dotenv').config();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20');
const validateUserDetails = require('../helpers/validateUserDetails');

passport.serializeUser((user, done) => {
    try {
        return done(null, user.id);
    } catch (error) {
        return done(error);
    }
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    } catch (error) {
        return done(error);
    }
})

passport.use(new GoogleStrategy({
    passReqToCallback: true,
    callbackURL: "/auth/google/redirect",
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}, async (req, accessToken, refreshToken, profile, done) => {
    // passport auth callback
    try {
        const user = await User.findOne({ googleOAuthId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            const newUser = await User.create({
                googleOAuthId: profile.id,
                email: profile._json["email"],
                username: profile.displayName,
            })
            return done(null, newUser);
        }
    } catch (error) {
        return done(error)
    }
}))

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
}, async (req, email, password, done) => {
    if (!email || !password) return done(null, false)

    try {
        const user = await User.findOne({ email }, 'username email _id password');
        if (!user) {
            return done(null, false,
                {
                    errorCode: "AUTH_FAILURE",
                    statusCode: 401,
                    message: "Could not find a user with that email."
                }
            );
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return done(null, false,
                {
                    errorCode: "AUTH_FAILURE",
                    statusCode: 401,
                    message: "Invalid password."
                }
            );
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}))

passport.use('local-register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
}, async (req, email, password, done) => {
    const { username, matchPassword } = req.body

    if (!username || !email || !password || !matchPassword) {
        return done(null, false,
            {
                errorCode: "REGISTRATION_FAILURE",
                statusCode: 400,
                message: "Incomplete fields. Ensure all parameters are filled."
            }
        )
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return done(null, false,
                {
                    errorCode: "REGISTRATION_FAILURE",
                    statusCode: 409,
                    message: "Email already in use in database."
                }
            );
        }

        try {
            validateUserDetails({ email, username, password, matchPassword });
        } catch (error) {
            return done(null, false,
                {
                    errorCode: "REGISTRATION_FAILURE",
                    statusCode: 401,
                    message: error.message
                }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPassword
        });

        return done(null, newUser.id)
    } catch (error) {
        return done(error);
    }
}
));