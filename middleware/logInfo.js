const createLogger = require('../logs/loggerConfig');
const infoLogger = createLogger("file", "info", "../logs/infoLog.log");

function logInfo(req, res, next) {
    infoLogger.info(
        `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - Status: ${res.statusCode}\n`
    );
    // ! Remove me
    console.log("Logging entire req object:\n", req);
    console.log("\n\n\nLogging entire res object:\n", res);
    next();
}

module.exports = logInfo;