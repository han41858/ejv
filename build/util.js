"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = function (obj) {
    var result = null;
    if (!!obj) {
        var type = typeof obj;
        if (type === 'object') {
            if (obj.push !== undefined && obj.push instanceof Function) {
                type = 'array';
            }
            else if (obj.getFullYear !== undefined && obj.getFullYear instanceof Function) {
                type = 'date';
            }
            else if (obj.byteLength !== undefined) {
                type = 'buffer';
            }
            else if (obj.exec !== undefined && obj.test !== undefined) {
                type = 'regexp';
            }
        }
        switch (type) {
            case 'boolean':
            case 'number':
            case 'function':
            case 'string':
            case 'buffer':
                // ok with simple copy
                result = obj;
                break;
            case 'regexp':
                result = new RegExp(obj);
                break;
            case 'date':
                result = new Date(obj);
                break;
            case 'array':
                result = __spreadArrays(obj.map(function (one) {
                    return exports.clone(one);
                }));
                break;
            case 'object':
                // sanitize default false
                result = {};
                Object.keys(obj)
                    .forEach(function (key) {
                    // recursively call
                    result[key] = exports.clone(obj[key]);
                });
                break;
        }
    }
    else {
        result = obj; // do not copy null & undefined
    }
    return result;
};
//# sourceMappingURL=util.js.map