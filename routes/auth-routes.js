const passport = require('passport');
const router = require('express').Router();


// regular auth registration
router.route('/register')
    .get((req, res) => {
        res.render('./register')
    })
    .post((req, res, next) => {
        passport.authenticate('local-register', (error, user, info) => {
            console.log('\n');
            console.log(error);
            console.log(user);
            console.log(info);

            if (error) {
                res.status(401).json({ error })
            } else if (user) {
                res.status(200).json({ info })
            } else {
                next();
            }

            res.status(500).json({ message: info.message })
        })(req, res);
    },
    )
//     passport.authenticate('local-register'), (error, user, info) => {
//         console.log("Hello!")
//         if (error) {
//             return next(error)
//         }

//         if (user) {
//             return res.status(200).json({ message: "User created successfully.", User: user.username })
//         }

//         return res.status(info.statusCode).json({ error: info.error })
//     }
// );

// regular auth login
router.route('/login')
    .get((req, res) => {
        res.render('/login')
    })
    .post((req, res, next) => {
        console.log('hello!');
        passport.authenticate('local', { failureFlash: true }), (error, user, info) => {
            if (error) {
                return next(error)
            }

            if (user) {
                return res.status(200).json({ message: "Login success.", User: user.username })
            }

            return res.status(info.statusCode).json({ error: info.error })
        }
    })

// google auth
router.get('/google', passport.authenticate("google", {
    scope: ['profile', 'email']
}))

router.get('/google/redirect', passport.authenticate("google"), (req, res) => {
    res.status(200).json({ message: "Google oauth success.", User: req.user.username })
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