class CustomError extends Error {
    constructor(name, statusCode, message) {
        super(message);
        this.name = name || 'Error';
        this.statusCode = statusCode || 500;

    }
}

module.exports = CustomError;