const path = require('path');
const winston = require('winston');

/**
 * Basic factory function that returns a logger based on input.
 * @param {string} Output - Where the log will be printed. Accepts "file" or defaults to console.
 * @param {string} Level - Logging level.
 * @param {string} filename - Desired filename. Case sensitive.
 * @returns The created winston logger function.
 */

const createLogger = (output, level, filename) => {
    const loggingLevel = level.toLowerCase();
    const logPath = path.join(__dirname, '..', 'logs', filename);

    return output?.toLowerCase() === "file" ?
        winston.createLogger({
            level: loggingLevel,
            format: winston.format.printf(({ message }) => {
                return `\n${message}\n${'-'.repeat(160)}\n`
            }),
            transports: [
                new winston.transports.File({
                    filename: logPath,
                    level: loggingLevel,
                })
            ]
        })
        :
        winston.createLogger({
            level: loggingLevel,
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    ),
                }),
            ]
        })

}

module.exports = createLogger;
