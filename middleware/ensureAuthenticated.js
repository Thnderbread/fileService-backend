function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: "No credentials." })
}

module.exports = ensureAuthenticated;