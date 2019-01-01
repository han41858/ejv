'use strict';
Object.defineProperty(exports, '__esModule', { value : true });
var EjvError = /** @class */ (function () {
	function EjvError (keyword, path, data) {
		this.keyword = keyword;
		this.data = data;
		this.path = path.join('/');
	}

	return EjvError;
}());
exports.EjvError = EjvError;
//# sourceMappingURL=interfaces.js.map