const passport = require('passport');
const router = require('express').Router();

// regular auth login
router.route('/login')
    .get((req, res) => {
        res.render('/login')
    })
//.post(handleLogin)

// google auth
router.get('/google', passport.authenticate("google", {
    scope: ['profile', 'email']
}))

router.get('/google/redirect', passport.authenticate("google"), (req, res) => {
    res.send("Hoorayskidoodle went to town!")
})

// logout
router.route('/logout')
    .get((req, res) => {
        res.render('/logout')
    })
//.post(handleLogout)

module.exports = router