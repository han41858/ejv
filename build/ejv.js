"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interfaces_1 = require("./interfaces");
var constants_1 = require("./constants");
var tester_1 = require("./tester");
var _ejv = function (data, schemes, _options) {
    if (_options === void 0) { _options = {
        path: []
    }; }
    // check schemes
    if (!tester_1.arrayTester(schemes)) {
        throw new Error(constants_1.ErrorMsg.NO_ARRAY_SCHEME);
    }
    if (!tester_1.arrayTypeOfTester(schemes, constants_1.DataType.OBJECT)) {
        throw new Error(constants_1.ErrorMsg.NO_OBJECT_ARRAY_SCHEME);
    }
    if (!tester_1.minLengthTester(schemes, 1)) {
        throw new Error(constants_1.ErrorMsg.EMPTY_SCHEME);
    }
    // check data by schemes
    var result = null;
    var options = JSON.parse(JSON.stringify(_options)); // divide instance
    // use for() instead of forEach() to stop
    var schemeLength = schemes.length;
    var _loop_1 = function (i) {
        var scheme = schemes[i];
        var key = scheme.key;
        options.path.push(key);
        if (!(scheme.optional === true && !tester_1.definedTester(data[key]))) {
            if (!tester_1.definedTester(data[key])) {
                result = new interfaces_1.EjvError(constants_1.ErrorMsg.REQUIRED, options.path, data[key]);
                return "break";
            }
            var types = void 0;
            var typeResolved_1 = null;
            if (!tester_1.definedTester(scheme.type)) {
                throw new Error(constants_1.ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE);
            }
            if (!tester_1.arrayTester(scheme.type)) {
                types = [scheme.type];
            }
            else {
                types = scheme.type;
            }
            var allDataType_1 = Object.values(constants_1.DataType);
            var errorType_1;
            if (!types.every(function (type) {
                var valid = tester_1.stringTester(type) && tester_1.enumTester(type, allDataType_1);
                if (valid === false) {
                    errorType_1 = type;
                }
                return valid;
            })) {
                throw new Error(constants_1.ErrorMsg.SCHEMES_HAS_INVALID_TYPE.replace(constants_1.ErrorMsgCursorA, errorType_1));
            }
            if (!tester_1.uniqueItemsTester(types)) {
                throw new Error(constants_1.ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE);
            }
            var value_1 = data[key];
            if (!types.some(function (type) {
                var valid = tester_1.typeTester(value_1, type);
                if (valid) {
                    typeResolved_1 = type;
                }
                return valid;
            })) {
                if (!tester_1.arrayTester(scheme.type)) {
                    result = new interfaces_1.EjvError(constants_1.ErrorMsg.TYPE_MISMATCH.replace(constants_1.ErrorMsgCursorA, scheme.type), options.path, value_1);
                }
                else {
                    result = new interfaces_1.EjvError(constants_1.ErrorMsg.TYPE_MISMATCH_ONE_OF.replace(constants_1.ErrorMsgCursorA, JSON.stringify(scheme.type)), options.path, value_1);
                }
                return "break";
            }
            // additional check for type resolved
            switch (typeResolved_1) {
                case constants_1.DataType.NUMBER:
                    if (tester_1.definedTester(scheme.enum)) {
                        if (!tester_1.arrayTester(scheme.enum)) {
                            throw new Error(constants_1.ErrorMsg.ENUM_SHOULD_BE_ARRAY);
                        }
                        if (!tester_1.arrayTypeOfTester(scheme.enum, constants_1.DataType.NUMBER)) {
                            throw new Error(constants_1.ErrorMsg.ENUM_SHOULD_BE_NUMBERS);
                        }
                        if (!tester_1.enumTester(value_1, scheme.enum)) {
                            result = new interfaces_1.EjvError(constants_1.ErrorMsg.ONE_OF.replace(constants_1.ErrorMsgCursorA, JSON.stringify(scheme.enum)), options.path, value_1);
                            break;
                        }
                    }
                    if (tester_1.definedTester(scheme.min)) {
                        if (!tester_1.numberTester(scheme.min)) {
                            throw new Error(constants_1.ErrorMsg.MIN_SHOULD_BE_NUMBER);
                        }
                        if (tester_1.definedTester(scheme.exclusiveMin)) {
                            if (!tester_1.booleanTester(scheme.exclusiveMin)) {
                                throw new Error(constants_1.ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
                            }
                            if (scheme.exclusiveMin === true) {
                                if (!tester_1.exclusiveMinNumberTester(value_1, scheme.min)) {
                                    result = new interfaces_1.EjvError(constants_1.ErrorMsg.GREATER_THAN.replace(constants_1.ErrorMsgCursorA, '' + scheme.min), options.path, value_1);
                                    break;
                                }
                            }
                            else {
                                if (!tester_1.minNumberTester(value_1, scheme.min)) {
                                    result = new interfaces_1.EjvError(constants_1.ErrorMsg.GREATER_THAN_OR_EQUAL.replace(constants_1.ErrorMsgCursorA, '' + scheme.min), options.path, value_1);
                                    break;
                                }
                            }
                        }
                        else {
                            if (!tester_1.minNumberTester(value_1, scheme.min)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.GREATER_THAN_OR_EQUAL.replace(constants_1.ErrorMsgCursorA, '' + scheme.min), options.path, value_1);
                                break;
                            }
                        }
                    }
                    if (tester_1.definedTester(scheme.max)) {
                        if (!tester_1.numberTester(scheme.max)) {
                            throw new Error(constants_1.ErrorMsg.MAX_SHOULD_BE_NUMBER);
                        }
                        if (tester_1.definedTester(scheme.exclusiveMax)) {
                            if (!tester_1.booleanTester(scheme.exclusiveMax)) {
                                throw new Error(constants_1.ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
                            }
                            if (scheme.exclusiveMax === true) {
                                if (!tester_1.exclusiveMaxNumberTester(value_1, scheme.max)) {
                                    result = new interfaces_1.EjvError(constants_1.ErrorMsg.SMALLER_THAN.replace(constants_1.ErrorMsgCursorA, '' + scheme.max), options.path, value_1);
                                    break;
                                }
                            }
                            else {
                                if (!tester_1.maxNumberTester(value_1, scheme.max)) {
                                    result = new interfaces_1.EjvError(constants_1.ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(constants_1.ErrorMsgCursorA, '' + scheme.max), options.path, value_1);
                                    break;
                                }
                            }
                        }
                        else {
                            if (!tester_1.maxNumberTester(value_1, scheme.max)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(constants_1.ErrorMsgCursorA, '' + scheme.max), options.path, value_1);
                                break;
                            }
                        }
                    }
                    if (tester_1.definedTester(scheme.format)) {
                        var formats = void 0;
                        var allNumberFormat_1 = Object.values(constants_1.NumberFormat);
                        if (!tester_1.arrayTester(scheme.format)) {
                            var formatAsString = scheme.format;
                            if (!tester_1.enumTester(formatAsString, allNumberFormat_1)) {
                                throw new Error(constants_1.ErrorMsg.INVALID_NUMBER_FORMAT.replace(constants_1.ErrorMsgCursorA, formatAsString));
                            }
                            formats = [scheme.format];
                        }
                        else {
                            var formatAsArray = scheme.format;
                            var errorFormat_1;
                            if (!formatAsArray.every(function (format) {
                                var valid = tester_1.enumTester(format, allNumberFormat_1);
                                if (!valid) {
                                    errorFormat_1 = format;
                                }
                                return valid;
                            })) {
                                throw new Error(constants_1.ErrorMsg.INVALID_NUMBER_FORMAT.replace(constants_1.ErrorMsgCursorA, errorFormat_1));
                            }
                            formats = scheme.format;
                        }
                        if (!formats.some(function (format) {
                            var valid = false;
                            switch (format) {
                                case constants_1.NumberFormat.INTEGER:
                                    valid = tester_1.integerTester(value_1);
                                    break;
                                case constants_1.NumberFormat.INDEX:
                                    valid = tester_1.indexTester(value_1);
                                    break;
                            }
                            return valid;
                        })) {
                            if (!tester_1.arrayTester(scheme.format)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.FORMAT.replace(constants_1.ErrorMsgCursorA, scheme.format), options.path, value_1);
                            }
                            else {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.FORMAT_ONE_OF.replace(constants_1.ErrorMsgCursorA, JSON.stringify(scheme.format)), options.path, value_1);
                            }
                            break;
                        }
                    }
                    break;
                case constants_1.DataType.STRING:
                    if (tester_1.definedTester(scheme.enum)) {
                        if (!tester_1.arrayTester(scheme.enum)) {
                            throw new Error(constants_1.ErrorMsg.ENUM_SHOULD_BE_ARRAY);
                        }
                        if (!tester_1.arrayTypeOfTester(scheme.enum, constants_1.DataType.STRING)) {
                            throw new Error(constants_1.ErrorMsg.ENUM_SHOULD_BE_STRINGS);
                        }
                        if (!tester_1.enumTester(value_1, scheme.enum)) {
                            result = new interfaces_1.EjvError(constants_1.ErrorMsg.ONE_OF.replace(constants_1.ErrorMsgCursorA, JSON.stringify(scheme.enum)), options.path, value_1);
                            break;
                        }
                    }
                    if (tester_1.definedTester(scheme.minLength)) {
                        if (!(tester_1.numberTester(scheme.minLength) && tester_1.integerTester(scheme.minLength))) {
                            throw new Error(constants_1.ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
                        }
                        if (!tester_1.minLengthTester(value_1, scheme.minLength)) {
                            result = new interfaces_1.EjvError(constants_1.ErrorMsg.MIN_LENGTH.replace(constants_1.ErrorMsgCursorA, '' + scheme.minLength), options.path, value_1);
                            break;
                        }
                    }
                    if (tester_1.definedTester(scheme.maxLength)) {
                        if (!(tester_1.numberTester(scheme.maxLength) && tester_1.integerTester(scheme.maxLength))) {
                            throw new Error(constants_1.ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
                        }
                        if (!tester_1.maxLengthTester(value_1, scheme.maxLength)) {
                            result = new interfaces_1.EjvError(constants_1.ErrorMsg.MAX_LENGTH.replace(constants_1.ErrorMsgCursorA, '' + scheme.maxLength), options.path, value_1);
                            break;
                        }
                    }
                    if (tester_1.definedTester(scheme.format)) {
                        var formats = void 0;
                        var allStringFormat_1 = Object.values(constants_1.StringFormat);
                        if (!tester_1.arrayTester(scheme.format)) {
                            var formatAsString = scheme.format;
                            if (!tester_1.enumTester(formatAsString, allStringFormat_1)) {
                                throw new Error(constants_1.ErrorMsg.INVALID_STRING_FORMAT.replace(constants_1.ErrorMsgCursorA, formatAsString));
                            }
                            formats = [scheme.format];
                        }
                        else {
                            var formatAsArray = scheme.format;
                            var errorFormat_2;
                            if (!formatAsArray.every(function (format) {
                                var valid = tester_1.enumTester(format, allStringFormat_1);
                                if (valid === false) {
                                    errorFormat_2 = format;
                                }
                                return valid;
                            })) {
                                throw new Error(constants_1.ErrorMsg.INVALID_STRING_FORMAT.replace(constants_1.ErrorMsgCursorA, errorFormat_2));
                            }
                            formats = scheme.format;
                        }
                        if (!formats.some(function (format) {
                            var valid = false;
                            switch (format) {
                                case constants_1.StringFormat.EMAIL:
                                    valid = tester_1.emailTester(value_1);
                                    break;
                                case constants_1.StringFormat.DATE:
                                    valid = tester_1.dateFormatTester(value_1);
                                    break;
                                case constants_1.StringFormat.TIME:
                                    valid = tester_1.timeFormatTester(value_1);
                                    break;
                                case constants_1.StringFormat.DATE_TIME:
                                    valid = tester_1.dateTimeFormatTester(value_1);
                                    break;
                            }
                            return valid;
                        })) {
                            if (!tester_1.arrayTester(scheme.format)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.FORMAT.replace(constants_1.ErrorMsgCursorA, scheme.format), options.path, value_1);
                            }
                            else {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.FORMAT_ONE_OF.replace(constants_1.ErrorMsgCursorA, JSON.stringify(scheme.format)), options.path, value_1);
                            }
                            break;
                        }
                    }
                    if (tester_1.definedTester(scheme.pattern)) {
                        // check parameter
                        if (scheme.pattern === null) {
                            throw new Error(constants_1.ErrorMsg.INVALID_STRING_PATTERN
                                .replace(constants_1.ErrorMsgCursorA, 'null'));
                        }
                        var isValidPattern_1 = function (pattern) {
                            return (tester_1.stringTester(pattern) && tester_1.minLengthTester(pattern, 1))
                                || (tester_1.regExpTester(pattern) && pattern.toString() !== '/(?:)/' && pattern.toString() !== '/null/');
                        };
                        var patternToString_1 = function (pattern) {
                            var regExpStr;
                            if (pattern === null) {
                                regExpStr = '/null/';
                            }
                            else if (tester_1.stringTester(pattern)) {
                                if (tester_1.minLengthTester(pattern, 1)) {
                                    regExpStr = new RegExp(pattern).toString();
                                }
                                else {
                                    regExpStr = '//';
                                }
                            }
                            else {
                                regExpStr = pattern.toString();
                            }
                            // empty regular expression
                            if (regExpStr === '/(?:)/') {
                                regExpStr = '//';
                            }
                            return regExpStr;
                        };
                        var createArrayErrorMsg_1 = function (patternsAsArray) {
                            return '[' + patternsAsArray.map(function (onePattern) {
                                return patternToString_1(onePattern);
                            }).join(', ') + ']';
                        };
                        if (tester_1.arrayTester(scheme.pattern)) {
                            var patternsAsArray_1 = scheme.pattern;
                            if (!tester_1.minLengthTester(patternsAsArray_1, 1)) { // empty array
                                throw new Error(constants_1.ErrorMsg.INVALID_STRING_PATTERN
                                    .replace(constants_1.ErrorMsgCursorA, createArrayErrorMsg_1(patternsAsArray_1)));
                            }
                            var regExpPatterns = patternsAsArray_1.map(function (pattern) {
                                if (!isValidPattern_1(pattern)) {
                                    throw new Error(constants_1.ErrorMsg.INVALID_STRING_PATTERN
                                        .replace(constants_1.ErrorMsgCursorA, createArrayErrorMsg_1(patternsAsArray_1)));
                                }
                                return new RegExp(pattern);
                            });
                            // check value
                            if (!regExpPatterns.some(function (regexp) {
                                return tester_1.stringRegExpTester(value_1, regexp);
                            })) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.PATTERN_ONE_OF
                                    .replace(constants_1.ErrorMsgCursorA, createArrayErrorMsg_1(patternsAsArray_1)), options.path, value_1);
                            }
                        }
                        else {
                            var patternAsOne = scheme.pattern;
                            if (!isValidPattern_1(patternAsOne)) {
                                throw new Error(constants_1.ErrorMsg.INVALID_STRING_PATTERN
                                    .replace(constants_1.ErrorMsgCursorA, patternToString_1(patternAsOne)));
                            }
                            // check value
                            var regExp = new RegExp(patternAsOne);
                            if (!tester_1.stringRegExpTester(value_1, regExp)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.PATTERN
                                    .replace(constants_1.ErrorMsgCursorA, patternToString_1(patternAsOne)), options.path, value_1);
                            }
                        }
                    }
                    break;
                case constants_1.DataType.OBJECT:
                    if (tester_1.definedTester(scheme.properties)) {
                        if (!tester_1.arrayTester(scheme.properties)) {
                            throw new Error(constants_1.ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY);
                        }
                        if (!tester_1.minLengthTester(scheme.properties, 1)) {
                            throw new Error(constants_1.ErrorMsg.PROPERTIES_SHOULD_HAVE_ITEMS);
                        }
                        if (!tester_1.arrayTypeOfTester(scheme.properties, constants_1.DataType.OBJECT)) {
                            throw new Error(constants_1.ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT);
                        }
                        var partialData = data[key];
                        var partialScheme = scheme.properties;
                        // call recursively
                        result = _ejv(partialData, partialScheme, options);
                    }
                    break;
                case constants_1.DataType.DATE:
                    if (tester_1.definedTester(scheme.min)) {
                        if (!((tester_1.stringTester(scheme.min) && (tester_1.dateFormatTester(scheme.min) || tester_1.dateTimeFormatTester(scheme.min)))
                            || tester_1.dateTester(scheme.min))) {
                            throw new Error(constants_1.ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING);
                        }
                        if (tester_1.definedTester(scheme.exclusiveMin) && !tester_1.booleanTester(scheme.exclusiveMin)) {
                            throw new Error(constants_1.ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
                        }
                        var minDate = new Date(scheme.min);
                        if (scheme.exclusiveMin !== true) {
                            if (!tester_1.minDateTester(value_1, minDate)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.AFTER_OR_SAME_DATE.replace(constants_1.ErrorMsgCursorA, minDate.toISOString()), options.path, value_1);
                                break;
                            }
                        }
                        else {
                            if (!tester_1.exclusiveMinDateTester(value_1, minDate)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.AFTER_DATE.replace(constants_1.ErrorMsgCursorA, minDate.toISOString()), options.path, value_1);
                                break;
                            }
                        }
                    }
                    if (tester_1.definedTester(scheme.max)) {
                        if (!((tester_1.stringTester(scheme.max) && (tester_1.dateFormatTester(scheme.max) || tester_1.dateTimeFormatTester(scheme.max)))
                            || tester_1.dateTester(scheme.max))) {
                            throw new Error(constants_1.ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING);
                        }
                        if (tester_1.definedTester(scheme.exclusiveMax) && !tester_1.booleanTester(scheme.exclusiveMax)) {
                            throw new Error(constants_1.ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
                        }
                        var maxDate = new Date(scheme.max);
                        if (scheme.exclusiveMax !== true) {
                            if (!tester_1.maxDateTester(value_1, maxDate)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.BEFORE_OR_SAME_DATE.replace(constants_1.ErrorMsgCursorA, maxDate.toISOString()), options.path, value_1);
                                break;
                            }
                        }
                        else {
                            if (!tester_1.exclusiveMaxDateTester(value_1, maxDate)) {
                                result = new interfaces_1.EjvError(constants_1.ErrorMsg.BEFORE_DATE.replace(constants_1.ErrorMsgCursorA, maxDate.toISOString()), options.path, value_1);
                                break;
                            }
                        }
                    }
                    break;
                case constants_1.DataType.ARRAY:
                    if (tester_1.definedTester(scheme.minLength)) {
                        if (!(tester_1.numberTester(scheme.minLength) && tester_1.integerTester(scheme.minLength))) {
                            throw new Error(constants_1.ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
                        }
                        if (!tester_1.minLengthTester(value_1, scheme.minLength)) {
                            result = new interfaces_1.EjvError(constants_1.ErrorMsg.MIN_LENGTH.replace(constants_1.ErrorMsgCursorA, '' + scheme.minLength), options.path, value_1);
                        }
                    }
                    if (tester_1.definedTester(scheme.maxLength)) {
                        if (!(tester_1.numberTester(scheme.maxLength) && tester_1.integerTester(scheme.maxLength))) {
                            throw new Error(constants_1.ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
                        }
                        if (!tester_1.maxLengthTester(value_1, scheme.maxLength)) {
                            result = new interfaces_1.EjvError(constants_1.ErrorMsg.MAX_LENGTH.replace(constants_1.ErrorMsgCursorA, '' + scheme.maxLength), options.path, value_1);
                        }
                    }
                    if (tester_1.definedTester(scheme.unique)) {
                        if (!tester_1.booleanTester(scheme.unique)) {
                            throw new Error(constants_1.ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN);
                        }
                        if (!tester_1.uniqueItemsTester(value_1)) {
                            result = new interfaces_1.EjvError(constants_1.ErrorMsg.UNIQUE_ITEMS, options.path, value_1);
                        }
                    }
                    if (tester_1.definedTester(scheme.items)) {
                        // convert array to object
                        var valueAsArray_1 = value_1;
                        var now_1 = new Date;
                        var tempKeyArr = valueAsArray_1.map(function (value, i) {
                            return now_1.toISOString() + i;
                        });
                        if (tester_1.stringTester(scheme.items) // by DataType
                            || (tester_1.arrayTester(scheme.items) && tester_1.arrayTypeOfTester(scheme.items, constants_1.DataType.STRING)) // by DataType[]
                        ) {
                            var itemTypes_1;
                            if (tester_1.arrayTester(scheme.items)) {
                                itemTypes_1 = scheme.items;
                            }
                            else {
                                itemTypes_1 = [scheme.items];
                            }
                            var partialData_1 = {};
                            var partialSchemes_1 = [];
                            tempKeyArr.forEach(function (tempKey, i) {
                                partialData_1[tempKey] = valueAsArray_1[i];
                                partialSchemes_1.push({
                                    key: tempKey,
                                    type: itemTypes_1
                                });
                            });
                            // call recursively
                            var partialResult = _ejv(partialData_1, partialSchemes_1, options);
                            // convert new EjvError
                            if (!!partialResult) {
                                var errorMsg = void 0;
                                if (tester_1.arrayTester(scheme.items)) {
                                    errorMsg = constants_1.ErrorMsg.ITEMS_TYPE.replace(constants_1.ErrorMsgCursorA, JSON.stringify(itemTypes_1));
                                }
                                else {
                                    errorMsg = constants_1.ErrorMsg.ITEMS_TYPE.replace(constants_1.ErrorMsgCursorA, scheme.items);
                                }
                                result = new interfaces_1.EjvError(errorMsg, options.path, value_1);
                            }
                            break;
                        }
                        else if ((tester_1.objectTester(scheme.items) && scheme.items !== null) // by Scheme
                            || (tester_1.arrayTester(scheme.items) && tester_1.arrayTypeOfTester(scheme.items, constants_1.DataType.OBJECT)) // by Scheme[]
                        ) {
                            var itemsAsSchemes = [];
                            if (tester_1.arrayTester(scheme.items)) {
                                itemsAsSchemes = scheme.items;
                            }
                            else {
                                itemsAsSchemes = [scheme.items];
                            }
                            var partialValid = true;
                            // use for() instead of forEach() to break
                            var valueLength = valueAsArray_1.length;
                            var _loop_2 = function (j) {
                                var oneValue = value_1[j];
                                var partialData = {};
                                var partialSchemes = [];
                                var tempKeyForThisValue = tempKeyArr[j];
                                partialData[tempKeyForThisValue] = oneValue;
                                partialSchemes.push.apply(partialSchemes, itemsAsSchemes.map(function (oneScheme) {
                                    var newScheme = JSON.parse(JSON.stringify(oneScheme)); // divide instance
                                    newScheme.key = tempKeyForThisValue;
                                    return newScheme;
                                }));
                                var partialResult = partialSchemes.map(function (partialScheme) {
                                    // call recursively
                                    return _ejv(partialData, [partialScheme], options);
                                });
                                if (!partialResult.some(function (oneResult) { return oneResult === null; })) {
                                    partialValid = false;
                                    return "break";
                                }
                            };
                            for (var j = 0; j < valueLength; j++) {
                                var state_2 = _loop_2(j);
                                if (state_2 === "break")
                                    break;
                            }
                            if (partialValid === false) {
                                var errorMsg = void 0;
                                if (tester_1.arrayTester(scheme.items)) {
                                    errorMsg = constants_1.ErrorMsg.ITEMS_SCHEMES.replace(constants_1.ErrorMsgCursorA, JSON.stringify(itemsAsSchemes));
                                }
                                else {
                                    errorMsg = constants_1.ErrorMsg.ITEMS_SCHEME.replace(constants_1.ErrorMsgCursorA, JSON.stringify(scheme.items));
                                }
                                result = new interfaces_1.EjvError(errorMsg, options.path, value_1);
                                break;
                            }
                        }
                        else {
                            throw new Error(constants_1.ErrorMsg.INVALID_ITEMS_SCHEME.replace(constants_1.ErrorMsgCursorA, JSON.stringify(scheme.items)));
                        }
                    }
                    break;
            }
        }
    };
    for (var i = 0; i < schemeLength; i++) {
        var state_1 = _loop_1(i);
        if (state_1 === "break")
            break;
    }
    return result;
};
exports.ejv = function (data, schemes, options) {
    // check data itself
    if (!tester_1.definedTester(data)) {
        throw new Error(constants_1.ErrorMsg.NO_DATA);
    }
    if (!tester_1.objectTester(data) || data === null) {
        throw new Error(constants_1.ErrorMsg.NO_JSON_DATA);
    }
    // check schemes itself
    if (!tester_1.definedTester(schemes) || schemes === null) {
        throw new Error(constants_1.ErrorMsg.NO_SCHEME);
    }
    if (!tester_1.arrayTester(schemes)) {
        throw new Error(constants_1.ErrorMsg.NO_ARRAY_SCHEME);
    }
    if (!tester_1.arrayTypeOfTester(schemes, constants_1.DataType.OBJECT)) {
        throw new Error(constants_1.ErrorMsg.NO_OBJECT_ARRAY_SCHEME);
    }
    if (!tester_1.minLengthTester(schemes, 1)) {
        throw new Error(constants_1.ErrorMsg.EMPTY_SCHEME);
    }
    return _ejv(data, schemes);
};
//# sourceMappingURL=ejv.js.map