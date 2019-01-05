"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
exports.typeTester = function (value, type) {
    var valid;
    switch (type) {
        case constants_1.DataType.BOOLEAN:
            valid = exports.booleanTester(value);
            break;
        case constants_1.DataType.NUMBER:
            valid = exports.numberTester(value);
            break;
        case constants_1.DataType.STRING:
            valid = exports.stringTester(value);
            break;
        case constants_1.DataType.OBJECT:
            valid = exports.objectTester(value);
            break;
        case constants_1.DataType.DATE:
            valid = exports.dateTester(value);
            break;
        case constants_1.DataType.REGEXP:
            valid = exports.regExpTester(value);
            break;
        case constants_1.DataType.ARRAY:
            valid = exports.arrayTester(value);
            break;
    }
    return valid;
};
exports.definedTester = function (value) {
    return value !== undefined;
};
exports.enumTester = function (value, arr) {
    return arr.includes(value);
};
exports.minLengthTester = function (value, minLength) {
    return value.length >= minLength;
};
exports.maxLengthTester = function (value, maxLength) {
    return value.length <= maxLength;
};
exports.booleanTester = function (value) {
    return typeof value === 'boolean';
};
exports.numberTester = function (value) {
    return typeof value === 'number';
};
exports.integerTester = function (value) {
    return +value.toFixed(0) === value;
};
exports.indexTester = function (value) {
    return exports.integerTester(value) && value >= 0;
};
exports.minNumberTester = function (value, min) {
    return value >= min;
};
exports.exclusiveMinNumberTester = function (value, min) {
    return value > min;
};
exports.maxNumberTester = function (value, max) {
    return value <= max;
};
exports.exclusiveMaxNumberTester = function (value, max) {
    return value < max;
};
exports.stringTester = function (value) {
    return typeof value === 'string';
};
exports.stringRegExpTester = function (value, regExp) {
    var valid = false;
    var _regExp;
    if (exports.regExpTester(regExp)) {
        _regExp = regExp;
    }
    else if (exports.stringTester(regExp)) {
        _regExp = new RegExp(regExp);
    }
    if (exports.regExpTester(_regExp)) {
        valid = _regExp.test(value);
    }
    return valid;
};
// RFC 5322, 3.4.1. spec
exports.emailTester = function (value) {
    var valid = false;
    if (exports.stringTester(value) && exports.stringRegExpTester(value, /^.+@.+$/)) {
        var valueAsString = value;
        var atIndex = valueAsString.lastIndexOf('@');
        var localPart = valueAsString.substr(0, atIndex);
        var domain = valueAsString.substr(atIndex + 1);
        // regular expression sources
        // const aTextRegExpStr : string = '[-a-zA-Z0-9!#$%&\\\'*+/=?^_`{|}~]+';
        var dotAtomRegExp = /^(\.?[-a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+)*$/;
        var quotedStringRegExp = /^"[\u0020-\u005b\u005d-\u007e\\]*"$/; // include space (\u005b)
        var domainLiteralRegExp = /^\[[\u0020-\u005a\u005c-\u007e\\]*]$/;
        var validLocalPart = localPart.length <= 64
            && (dotAtomRegExp.test(localPart)
                || quotedStringRegExp.test(localPart));
        var validDomain = !domain.startsWith('.') && !domain.endsWith('.')
            && (dotAtomRegExp.test(domain)
                || domainLiteralRegExp.test(domain));
        valid = validLocalPart && validDomain;
    }
    return valid;
};
// RFC 3339 (https://www.ietf.org/rfc/rfc3339.txt) : YYYY-MM-DDThh:mm:ss[.SSSZ]
var rfc3339Tester = function (value) {
    return /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T([0-1][0-9]|2[0-3])(:([0-5][0-9])){2}(\.\d+)?(Z|[-+]\d{2}:\d{2})?$/.test(value);
};
var iso8601DateTester = function (value) {
    var years = '(\\d{4})';
    var months = '(0[1-9]|1[0-2])';
    var dates = '(0[1-9]|[1-2][0-9]|3[0-1])';
    var dateOfYear = '(00[1-9]|0[1-9][0-9]|[1-2]\\d{2}|3[0-5]\\d|36[0-5])'; // TODO: 366 for leap year
    var weeks = '(W(0[1-9]|[2-4][0-9]|5[0-3]))';
    var days = '[1-7]';
    return [
        new RegExp("^[-+]?" + years + "$"),
        new RegExp("^" + years + "-" + months + "(-" + dates + ")?$"),
        new RegExp("^" + years + months + dates + "$"),
        new RegExp("^--" + months + "-?" + dates + "$"),
        new RegExp("^" + years + "-" + weeks + "(-" + days + ")?$"),
        new RegExp("^" + years + weeks + "(" + days + ")?$"),
        new RegExp("^" + years + "-?" + dateOfYear + "$") // ordinal dates : YYYY-DDD, YYYYDDD
    ].some(function (regExp) {
        return regExp.test(value);
    });
};
var iso8601TimeTester = function (value) {
    var hours = '([0-1]\\d|2[0-3])';
    var minutes = '([0-5]\\d)';
    var seconds = '([0-5]\\d|60)'; // 60 for leap second
    var ms = '(\\.[0-9]+)';
    return [
        new RegExp("^(" + hours + "|24)$"),
        new RegExp("^((" + hours + ":" + minutes + ")|24:00)$"),
        new RegExp("^((" + hours + ":" + minutes + ":" + seconds + ")|24:00:00)$"),
        new RegExp("^((" + hours + ":" + minutes + ":" + seconds + ms + ")|24:00:00.0+)$"),
        new RegExp("^(" + hours + minutes + "|2400)$"),
        new RegExp("^(" + hours + minutes + seconds + "|240000)$"),
        new RegExp("^(" + hours + minutes + seconds + ms + "|240000.0+)$") // hhmmss.sss
    ]
        .some(function (regExp) {
        return regExp.test(value);
    });
};
var iso8601DateTimeTester = function (value) {
    var valid = false;
    if (/.+T.+/.test(value) // should have 1 'T'
        && /(Z|[-+]\d{2}:?\d{2})$/.test(value) // should end with 'Z' or timezone
    ) {
        var _a = value.split('T'), date = _a[0], time = _a[1];
        if (time.endsWith('Z')) {
            time = time.replace('Z', '');
        }
        else {
            var timezoneStartIndex = time.includes('+') ? time.indexOf('+') : time.indexOf('-');
            time = time.substr(0, timezoneStartIndex);
        }
        valid = iso8601DateTester(date) && iso8601TimeTester(time);
    }
    return valid;
};
exports.dateFormatTester = function (value) {
    return iso8601DateTester(value);
};
exports.timeFormatTester = function (value) {
    return iso8601TimeTester(value);
};
exports.dateTimeFormatTester = function (value) {
    return rfc3339Tester(value) || iso8601DateTimeTester(value);
};
// // with port
// export const urlTester : Function = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
// };
//
// // TODO: with port
// export const ipv4Tester : Function = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
// };
//
// export const ipv6Tester : Function = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$;/.test(value);
// };
//
// export const ipTester : Function = (value : any) : boolean => {
// 	return ipv4Tester(value) || ipv6Tester(value);
// };
exports.objectTester = function (value) {
    return typeof value === 'object';
};
exports.hasPropertyTester = function (value) {
    return Object.keys(value).length > 0;
};
exports.dateTester = function (value) {
    return exports.objectTester(value)
        && value !== null
        && value.getFullYear !== undefined;
};
exports.minDateTester = function (value, min) {
    return +value >= +min;
};
exports.exclusiveMinDateTester = function (value, min) {
    return +value > +min;
};
exports.maxDateTester = function (value, max) {
    return +value <= +max;
};
exports.exclusiveMaxDateTester = function (value, max) {
    return +value < +max;
};
exports.arrayTester = function (value) {
    return exports.objectTester(value)
        && value !== null
        && value.length !== undefined
        && value.push !== undefined;
};
exports.arrayTypeOfTester = function (array, type) {
    return array.every(function (item) {
        return exports.typeTester(item, type);
    });
};
exports.uniqueItemsTester = function (array) {
    return array.every(function (item) {
        return array.filter(function (target) { return target === item; }).length === 1;
    });
};
exports.regExpTester = function (value) {
    return value instanceof RegExp;
};
//# sourceMappingURL=tester.js.map