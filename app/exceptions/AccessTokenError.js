module.exports = class AccessTokenError extends Error {
    constructor(message) {
        super(message);
        this.name = "AccessTokenError";
    }
}