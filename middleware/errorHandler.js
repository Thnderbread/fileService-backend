const { v4: uuid } = require('uuid');
const createLogger = require("../logs/loggerConfig");
const errorLogger = createLogger("file", "error", "../logs/errorLog.log");

function handleErrors(error, req, res, next) {
    errorLogger.error(`${uuid()} - 
    Date: ${new Date().toISOString()} - 
    Error: ${error.name}: ${error.message} - 
    Method: ${req.method} -
    Referrer: ${req.headers.referer} -
    Original URI: ${req.originalUrl} - 
    URI: ${req.url} -
    Status: ${error.statusCode || res.statusCode}\n
    Error Stack: ${error.stack}\n`
    );

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