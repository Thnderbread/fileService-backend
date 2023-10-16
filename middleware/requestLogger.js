const { v4: uuid } = require('uuid');
const createLogger = require('../helpers/loggerConfig');
const infoLogger = createLogger("file", "info", "infoLog.log");

function requestLogger(req, res, next) {
    infoLogger.info(
        `Log id: ${uuid()}
        Date: ${new Date().toISOString()}
        Method: ${req.method}
        Referrer: ${req.headers.referer || 'undefined'}
        Original URI: ${req.headers.origin}
        URI: ${req.url}
        Status Code: ${res.statusCode}\n`
    );

    console.log(
        `Log id: ${uuid()}
        Date: ${new Date().toISOString()}
        Method: ${req.method}
        Referrer: ${req.headers.referer || 'undefined'}
        Original URI: ${req.headers.origin}
        URI: ${req.url}
        Status Code: ${res.statusCode}\n`
    )

}

module.exports = requestLogger;