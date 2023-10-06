const logErrors = require("./logErrors");

function handleErrors(error, req, res, next) {
    logErrors(error, req, res)
    res.header("Content-Type", "application/json")

    // these errors' messages can be shown safely.
    const acceptableErrorCodes = [302, 400, 401, 409, 415, 507]

    // in case of a 500-class error, or some other uncaught
    // exception thrown by something (i.e. third-party library)
    // use this method to avoid exposing sensible information.
    if (!error || !acceptableErrorCodes.includes(error.statusCode)) {
        return res
            .status(500)
            .json({
                success: false,
                status: 500,
                error: "Something went wrong.",
                stack: process.env.ENVIRONMENT === 'DEV' ? error.stack : {}
            });
    }

    return res
        .status(error.statusCode)
        .json({ error: error.displayMessage })
}

module.exports = handleErrors;