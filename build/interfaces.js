"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EjvError = /** @class */ (function () {
    function EjvError(errorKey, message, path, data) {
        this.errorKey = errorKey;
        this.message = message;
        this.data = data;
        this.path = path.join('/');
    }
    return EjvError;
}());
exports.EjvError = EjvError;
//# sourceMappingURL=interfaces.js.map