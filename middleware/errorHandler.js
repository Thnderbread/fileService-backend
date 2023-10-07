const { v4: uuid } = require('uuid');
const createLogger = require("../helpers/loggerConfig");
const errorLogger = createLogger("file", "error", "errorLog.log");

function handleErrors(error, req, res, next) {
    errorLogger.error(
        `Log id: ${uuid()}
        Date: ${new Date().toISOString()}
        Error: ${error.name}: ${error.message}
        Method: ${req.method}
        Referrer: ${req.headers.referer}
        Original URI: ${req.originalUrl}
        URI: ${req.url}
        Response status code: ${error.statusCode || res.statusCode}
        Error Stack: ${error.stack}\n`
    );

    res.header("Content-Type", "application/json")

    // these errors' messages can be shown safely.
    const acceptableStatusCodes = [302, 400, 401, 409, 415, 507]

    // in case of a 500-class error, or some other uncaught
    // exception thrown by something (i.e. third-party library)
    // use this method to avoid exposing sensible information.
    // statusCodes aren't set when an uncaught exception occurs as well.
    if (!error || !error.statusCode ||
        !acceptableStatusCodes.includes(error.statusCode)) {
        res
            .status(500)
            .json({
                success: false,
                status: 500,
                error: "Something went wrong.",
                stack: process.env.ENVIRONMENT === 'DEV' ? error.stack : {}
            });
    }

    res.status(error.statusCode).json({ error: error.message })

    next()
}

module.exports = handleErrors;