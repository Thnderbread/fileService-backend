require('dotenv').config();
const passport = require('passport');
const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20');
const createLogger = require('../logs/loggerConfig');

const errorLogger = createLogger("file", "error", "../logs/errorLog.log");

passport.serializeUser((user, done) => {
    try {
        done(null, user.id);

    } catch (error) {
        done(error);
        console.error(error);
        errorLogger.error("Something went wrong while trying to serialize the user via google auth: ", error);

    }
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
        console.log('Successfully retrieved user!: ', user);
    } catch (error) {
        done(error);
        console.error(error);
        errorLogger.error("Something went wrong while trying to serialize the user via google auth: ", error);
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
            // should proceed to "s e r i a l i z e" user here
            done(null, user.id)
            return;
        } else {
            const newUser = await User.create({
                googleOAuthId: profile.id,
                email: profile._json["email"],
                username: profile.displayName,
            })
            done(null, newUser.id)
        }
    } catch (error) {
        console.error(error);
        errorLogger.error("Something went wrong while trying to serialize the user via google auth: ", error);
    }
}))