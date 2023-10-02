const createLogger = require("../logs/loggerConfig");
const errorLogger = createLogger("file", "error", "../logs/errorLog.log");

function logErrors(error, req, res, next) {
  errorLogger.error(
    `${new Date().toISOString()} - ${error.name}: ${error.message} - ${req.method
    } ${req.originalUrl} - Status: ${res.statusCode}\n${error.stack}\n`
  );
  next(error);
}

module.exports = logErrors;
