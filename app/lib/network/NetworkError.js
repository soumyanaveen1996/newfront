// https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
export default class NetworkError {
    constructor(message = 'Error making network call', error) {
        // Maintains proper stack trace for where our error was thrown
        // Error.captureStackTrace(this, NetworkError);

        // Custom debugging information
        this.message = message;
        this.error = error;
        this.date = new Date();
    }
}
