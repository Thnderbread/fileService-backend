const winston = require('winston');

/**
 * Basic factory function that returns a logger based on input.
 * @param {string} Output - Where the log will be printed. Accepts "file" and defaults to console.
 * @param {string} Level - Logging level.
 * @param {string} filename - Desired outfile. Case sensitive.
 * @returns The created winston logger function.
 */

const createLogger = (output, level, filename) => {
    const level = level.toLowerCase();

    return output.toLowerCase() === "file" ?
        winston.createLogger({
            level: level,
            format: winston.format.json(),
            transports: [
                new winston.transports.File({
                    filename: filename,
                    level: level,
                })
            ]
        })
        :
        winston.createLogger({
            level: level,
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
