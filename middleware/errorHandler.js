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

    console.error(
        `Log id: ${uuid()}
        Date: ${new Date().toISOString()}
        Error: ${error.name}: ${error.message}
        Method: ${req.method}
        Referrer: ${req.headers.referer}
        Original URI: ${req.originalUrl}
        URI: ${req.url}
        Response status code: ${error.statusCode || res.statusCode}
        Error Stack: ${error.stack}\n`
    )

    res.header("Content-Type", "application/json")

    // these errors' messages can be shown safely.
    const acceptableStatusCodes = [302, 400, 401, 409, 415, 507]

    // in case of a 500-class error, or some other uncaught
    // exception thrown by something (i.e. third-party library)
    // use this method to avoid exposing sensible information.
    // statusCodes aren't set when an uncaught exception occurs as well.
    if (!error || !error.statusCode ||
        !acceptableStatusCodes.includes(error.statusCode)) {
<<<<<<< HEAD
        return res
=======
        res
>>>>>>> 48429940c7c5cf95186906d64f649eb40d2def19
            .status(500)
            .json({
                success: false,
                status: 500,
                error: "Something went wrong.",
                stack: process.env.ENVIRONMENT === '' ? error.stack : {}
            });
    } else {
        return res.status(error.statusCode).json({ error: error.message })
    }
<<<<<<< HEAD
=======

    res.status(error.statusCode).json({ error: error.message })

    next()
>>>>>>> 48429940c7c5cf95186906d64f649eb40d2def19
}

module.exports = handleErrors;