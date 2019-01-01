"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var ErrorMsg;
(function (ErrorMsg) {
    // about Error
    ErrorMsg["NO_DATA"] = "no data to validate";
    ErrorMsg["NO_JSON_DATA"] = "no JSON data to validate";
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
    ErrorMsg["MIN_SHOULD_BE_NUMBER"] = "min should be number";
    ErrorMsg["EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN"] = "exclusiveMin should be boolean";
    ErrorMsg["MAX_SHOULD_BE_NUMBER"] = "max should be number";
    ErrorMsg["EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN"] = "exclusiveMax should be boolean";
    ErrorMsg["INVALID_NUMBER_FORMAT"] = "invalid number format : <<A>>";
    ErrorMsg["INVALID_STRING_FORMAT"] = "invalid string format : <<A>>";
    ErrorMsg["INVALID_STRING_PATTERN"] = "invalid string pattern : <<A>>";
    ErrorMsg["MIN_LENGTH_SHOULD_BE_INTEGER"] = "minLength should be a integer";
    ErrorMsg["MAX_LENGTH_SHOULD_BE_INTEGER"] = "maxLength should be a integer";
    ErrorMsg["PROPERTIES_SHOULD_BE_ARRAY"] = "properties should be array";
    ErrorMsg["PROPERTIES_SHOULD_HAVE_ITEMS"] = "properties should have items";
    ErrorMsg["PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT"] = "properties should be array of object";
    ErrorMsg["MIN_DATE_SHOULD_BE_DATE_OR_STRING"] = "min should be Date or string representing date";
    ErrorMsg["MAX_DATE_SHOULD_BE_DATE_OR_STRING"] = "max should be Date or string representing date";
    ErrorMsg["UNIQUE_SHOULD_BE_BOOLEAN"] = "unique should be boolean";
    ErrorMsg["INVALID_ITEMS_SCHEME"] = "invalid schemes of array items : <<A>>";
    // about EjvError
    ErrorMsg["REQUIRED"] = "required";
    ErrorMsg["TYPE_MISMATCH"] = "the value should be a <<A>>";
    ErrorMsg["TYPE_MISMATCH_ONE_OF"] = "the value should be one of <<A>>";
    ErrorMsg["ONE_OF"] = "the value should be one of <<A>>";
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
    ErrorMsg["AFTER_OR_SAME_DATE"] = "the value should be after or same date than <<A>>";
    ErrorMsg["AFTER_DATE"] = "the value should be after date than <<A>>";
    ErrorMsg["BEFORE_OR_SAME_DATE"] = "the value should be before or same date than <<A>>";
    ErrorMsg["BEFORE_DATE"] = "the value should be before date than <<A>>";
    ErrorMsg["UNIQUE_ITEMS"] = "the array should be unique items";
    ErrorMsg["ITEMS_TYPE"] = "the array should have items in type of <<A>>";
    ErrorMsg["ITEMS_SCHEME"] = "the array should have items matched with scheme of <<A>>";
    ErrorMsg["ITEMS_SCHEMES"] = "the array should have items matched with schemes of <<A>>";
})(ErrorMsg = exports.ErrorMsg || (exports.ErrorMsg = {}));
//# sourceMappingURL=constants.js.map