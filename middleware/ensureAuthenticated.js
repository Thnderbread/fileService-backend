const CustomError = require("../errors/customError");

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    const authenticationError = new CustomError('Authentication Error', 401, 'User not authenticated.');
    return next(authenticationError);
}

module.exports = ensureAuthenticated;