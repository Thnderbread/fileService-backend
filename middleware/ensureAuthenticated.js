const passport = require('passport');
const CustomError = require("../errors/customError");

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        const authenticationError = new CustomError('Authentication Error', 401, 'User not authenticated.');
        return next(authenticationError);
    }
}

module.exports = ensureAuthenticated;