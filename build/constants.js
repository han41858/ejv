"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMsg = exports.ErrorType = exports.ErrorMsgCursorA = exports.StringFormat = exports.NumberFormat = exports.DataType = void 0;
var DataType;
(function (DataType) {
    DataType["BOOLEAN"] = "boolean";
    DataType["NUMBER"] = "number";
    DataType["STRING"] = "string";
    DataType["OBJECT"] = "object";
    DataType["DATE"] = "date";
    DataType["REGEXP"] = "regexp";
    DataType["ARRAY"] = "array";
})(DataType = exports.DataType || (exports.DataType = {}));
var NumberFormat;
(function (NumberFormat) {
    NumberFormat["INTEGER"] = "integer";
    NumberFormat["INDEX"] = "index";
})(NumberFormat = exports.NumberFormat || (exports.NumberFormat = {}));
var StringFormat;
(function (StringFormat) {
    StringFormat["EMAIL"] = "email";
    StringFormat["DATE"] = "date";
    StringFormat["DATE_TIME"] = "date-time";
    StringFormat["TIME"] = "time";
    // URL = 'url',
    // IP = 'ip', // ipv4 || ipv6
    // IPV4 = 'ipv4',
    // IPV6 = 'ipv6'
})(StringFormat = exports.StringFormat || (exports.StringFormat = {}));
exports.ErrorMsgCursorA = '<<A>>';
var ErrorType;
(function (ErrorType) {
    ErrorType["REQUIRED"] = "REQUIRED";
    ErrorType["TYPE_MISMATCH"] = "TYPE_MISMATCH";
    ErrorType["TYPE_MISMATCH_ONE_OF"] = "TYPE_MISMATCH_ONE_OF";
    ErrorType["ONE_OF"] = "ONE_OF";
    ErrorType["NOT_ONE_OF"] = "NOT_ONE_OF";
    ErrorType["FORMAT"] = "FORMAT";
    ErrorType["FORMAT_ONE_OF"] = "FORMAT_ONE_OF";
    ErrorType["GREATER_THAN_OR_EQUAL"] = "GREATER_THAN_OR_EQUAL";
    ErrorType["GREATER_THAN"] = "GREATER_THAN";
    ErrorType["SMALLER_THAN_OR_EQUAL"] = "SMALLER_THAN_OR_EQUAL";
    ErrorType["SMALLER_THAN"] = "SMALLER_THAN";
    ErrorType["MIN_LENGTH"] = "MIN_LENGTH";
    ErrorType["MAX_LENGTH"] = "MAX_LENGTH";
    ErrorType["PATTERN"] = "PATTERN";
    ErrorType["PATTERN_ONE_OF"] = "PATTERN_ONE_OF";
    ErrorType["NO_PROPERTY"] = "NO_PROPERTY";
    ErrorType["AFTER_OR_SAME_DATE"] = "AFTER_OR_SAME_DATE";
    ErrorType["AFTER_DATE"] = "AFTER_DATE";
    ErrorType["BEFORE_OR_SAME_DATE"] = "BEFORE_OR_SAME_DATE";
    ErrorType["BEFORE_DATE"] = "BEFORE_DATE";
    ErrorType["UNIQUE_ITEMS"] = "UNIQUE_ITEMS";
    ErrorType["ITEMS_TYPE"] = "ITEMS_TYPE";
    ErrorType["ITEMS_SCHEMES"] = "ITEMS_SCHEMES";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
var ErrorMsg;
(function (ErrorMsg) {
    // about Error
    ErrorMsg["NO_DATA"] = "no data to validate";
    ErrorMsg["NO_SCHEME"] = "no scheme";
    ErrorMsg["NO_ARRAY_SCHEME"] = "schemes should be array";
    ErrorMsg["NO_OBJECT_ARRAY_SCHEME"] = "schemes should be array of object";
    ErrorMsg["EMPTY_SCHEME"] = "scheme should not be empty";
    ErrorMsg["SCHEMES_SHOULD_HAVE_TYPE"] = "scheme should have type";
    ErrorMsg["SCHEMES_HAS_INVALID_TYPE"] = "schemes has invalid type : <<A>>";
    ErrorMsg["SCHEMES_HAS_DUPLICATED_TYPE"] = "schemes has duplicated type : <<A>>";
    ErrorMsg["ENUM_SHOULD_BE_ARRAY"] = "enum should be array";
    ErrorMsg["ENUM_SHOULD_BE_NUMBERS"] = "enum values should be numbers";
    ErrorMsg["ENUM_SHOULD_BE_STRINGS"] = "enum values should be strings";
    ErrorMsg["ENUM_REVERSE_SHOULD_BE_ARRAY"] = "enumReverse should be array";
    ErrorMsg["ENUM_REVERSE_SHOULD_BE_NUMBERS"] = "enumReverse values should be numbers";
    ErrorMsg["ENUM_REVERSE_SHOULD_BE_STRINGS"] = "enumReverse values should be strings";
    ErrorMsg["MIN_SHOULD_BE_NUMBER"] = "min should be number";
    ErrorMsg["EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN"] = "exclusiveMin should be a boolean";
    ErrorMsg["MAX_SHOULD_BE_NUMBER"] = "max should be number";
    ErrorMsg["EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN"] = "exclusiveMax should be a boolean";
    ErrorMsg["INVALID_NUMBER_FORMAT"] = "invalid number format : <<A>>";
    ErrorMsg["INVALID_STRING_FORMAT"] = "invalid string format : <<A>>";
    ErrorMsg["INVALID_STRING_PATTERN"] = "invalid string pattern : <<A>>";
    ErrorMsg["MIN_LENGTH_SHOULD_BE_INTEGER"] = "minLength should be a integer";
    ErrorMsg["MAX_LENGTH_SHOULD_BE_INTEGER"] = "maxLength should be a integer";
    ErrorMsg["PROPERTIES_SHOULD_BE_ARRAY"] = "properties should be array";
    ErrorMsg["PROPERTIES_SHOULD_HAVE_ITEMS"] = "properties should have items";
    ErrorMsg["PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT"] = "properties should be array of object";
    ErrorMsg["ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN"] = "allowNoProperty should be a boolean";
    ErrorMsg["MIN_DATE_SHOULD_BE_DATE_OR_STRING"] = "min should be Date or string representing date";
    ErrorMsg["MAX_DATE_SHOULD_BE_DATE_OR_STRING"] = "max should be Date or string representing date";
    ErrorMsg["UNIQUE_SHOULD_BE_BOOLEAN"] = "unique should be a boolean";
    ErrorMsg["INVALID_ITEMS_SCHEME"] = "invalid schemes of array items : <<A>>";
    // about EjvError
    ErrorMsg["REQUIRED"] = "required";
    ErrorMsg["TYPE_MISMATCH"] = "the value should be a <<A>>";
    ErrorMsg["TYPE_MISMATCH_ONE_OF"] = "the value should be one of <<A>>";
    ErrorMsg["ONE_OF"] = "the value should be one of <<A>>";
    ErrorMsg["NOT_ONE_OF"] = "the value should be not one of <<A>>";
    ErrorMsg["FORMAT"] = "the value should be a form of <<A>>";
    ErrorMsg["FORMAT_ONE_OF"] = "the value should be form of one of <<A>>";
    ErrorMsg["GREATER_THAN_OR_EQUAL"] = "the value should be greater or equal than <<A>>";
    ErrorMsg["GREATER_THAN"] = "the value should be greater than <<A>>";
    ErrorMsg["SMALLER_THAN_OR_EQUAL"] = "the value should be smaller or equal than <<A>>";
    ErrorMsg["SMALLER_THAN"] = "the value should be smaller than <<A>>";
    ErrorMsg["MIN_LENGTH"] = "the value should be longer than <<A>>";
    ErrorMsg["MAX_LENGTH"] = "the value should be shorter than <<A>>";
    ErrorMsg["PATTERN"] = "the value should be pattern of <<A>>";
    ErrorMsg["PATTERN_ONE_OF"] = "the value should be one of pattern of <<A>>";
    ErrorMsg["NO_PROPERTY"] = "the value should have property";
    ErrorMsg["AFTER_OR_SAME_DATE"] = "the value should be after or same date than <<A>>";
    ErrorMsg["AFTER_DATE"] = "the value should be after date than <<A>>";
    ErrorMsg["BEFORE_OR_SAME_DATE"] = "the value should be before or same date than <<A>>";
    ErrorMsg["BEFORE_DATE"] = "the value should be before date than <<A>>";
    ErrorMsg["UNIQUE_ITEMS"] = "the array should be unique items";
    ErrorMsg["ITEMS_TYPE"] = "the array should have items in type of <<A>>";
    ErrorMsg["ITEMS_SCHEMES"] = "the array should have items matched with schemes of <<A>>";
})(ErrorMsg = exports.ErrorMsg || (exports.ErrorMsg = {}));
//# sourceMappingURL=constants.js.map