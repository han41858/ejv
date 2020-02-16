"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EjvError = /** @class */ (function () {
    function EjvError(type, message, path, data, errorData) {
        this.type = type;
        this.message = message;
        this.data = data;
        this.errorData = errorData;
        this.path = path.join('/');
    }
    return EjvError;
}());
exports.EjvError = EjvError;
//# sourceMappingURL=interfaces.js.map