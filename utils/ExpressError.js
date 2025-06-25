class ExpressError extends Error {
    constructor(statusCode, message) {
        super(); // Call the parent (Error) constructor
        this.statusCode = statusCode; // HTTP status code for the error
        this.message = message; // Error message
    }
}

module.exports = ExpressError;
