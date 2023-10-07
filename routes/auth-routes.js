const passport = require('passport');
const router = require('express').Router();
const CustomError = require('../errors/customError');


// regular auth registration
router.route('/register')
    .get((req, res) => {
        res.render('./register')
    })
    .post((req, res, next) => {
        passport.authenticate('local-register', (error, user, info) => {
            if (user) {
                return res.status(200).json({ message: "Successfully registered." });
            }

            // Any error here would denote some uncaught exception, or 
            // some internal passport.js failure.
            if (error) {
                const registrationError = new CustomError(error.name, 500, error.message);
                registrationError.stack = error.stack;
                return next(registrationError);
            }

            // this would denote an issue with authentication.
            // weak credentials, in-use email, etc.
            const registrationError = new CustomError(info.code, info.statusCode, info.message);
            return next(registrationError);
        })(req, res);
    })

// regular auth login
router.route('/login')
    .get((req, res) => {
        res.render('/login')
    })
    .post((req, res, next) => {
        passport.authenticate('local', (error, user, info) => {
            if (user) {
                return res.status(200).json({ message: "Login success.", User: user.username });
            }

            if (error) {
                const registrationError = new CustomError(error.name, 500, error.message);
                registrationError.stack = error.stack;
                return next(registrationError);
            }

            const registrationError = new CustomError(info.code, info.statusCode, info.message);
            return next(registrationError);

        })(req, res)
    })

// google auth
router.get('/google', passport.authenticate("google", {
    scope: ['profile', 'email']
}))

router.get('/google/redirect', passport.authenticate("google"), (req, res) => {
    res.status(200).json({ message: "Google OAuth success.", User: req.user.username })
})

// logout
router.route('/logout')
    .get((req, res) => {
        res.render('/logout')
    })
    .post((req, res) => {
        req.logout();
        res.status(200).json({ message: "Logout successful." });
    })

module.exports = router