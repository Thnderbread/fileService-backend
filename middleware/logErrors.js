const { v4: uuid } = require('uuid');
const createLogger = require("../logs/loggerConfig");
const errorLogger = createLogger("file", "error", "../logs/errorLog.log");

function logErrors(error, req, res) {
  errorLogger.error(
    `${uuid()} - 
    Date: ${new Date().toISOString()} - 
    Error: ${error.name}: ${error.message} - 
    Method: ${req.method} -
    Referrer: ${req.headers.referer} -
    Original URI: ${req.originalUrl} - 
    URI: ${req.url} -
    Status: ${error.statusCode || res.statusCode}\n
    Error Stack: ${error.stack}\n`
  );
}

module.exports = logErrors;