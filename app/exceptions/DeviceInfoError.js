module.exports = class DeviceInfoError extends Error {
    constructor(message) {
        super(message);
        this.name = "DeviceInfoError";
    }
}