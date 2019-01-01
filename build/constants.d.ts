export declare enum DataType {
	BOOLEAN = 'boolean',
	NUMBER = 'number',
	STRING = 'string',
	OBJECT = 'object',
	DATE = 'date',
	REGEXP = 'regexp',
	ARRAY = 'array'
}

export declare enum NumberFormat {
	INTEGER = 'integer',
	INDEX = 'index'
}

export declare enum StringFormat {
	EMAIL = 'email',
	DATE = 'date',
	DATE_TIME = 'date-time',
	TIME = 'time'
}

export declare const ErrorMsgCursorA : string;

export declare enum ErrorMsg {
	NO_DATA = 'no data to validate',
	NO_JSON_DATA = 'no JSON data to validate',
	NO_SCHEME = 'no scheme',
	NO_ARRAY_SCHEME = 'schemes should be array',
	NO_OBJECT_ARRAY_SCHEME = 'schemes should be array of object',
	EMPTY_SCHEME = 'scheme should not be empty',
	SCHEMES_SHOULD_HAVE_TYPE = 'scheme should have type',
	SCHEMES_HAS_INVALID_TYPE = 'schemes has invalid type : <<A>>',
	SCHEMES_HAS_DUPLICATED_TYPE = 'schemes has duplicated type : <<A>>',
	ENUM_SHOULD_BE_ARRAY = 'enum should be array',
	ENUM_SHOULD_BE_NUMBERS = 'enum values should be numbers',
	ENUM_SHOULD_BE_STRINGS = 'enum values should be strings',
	MIN_SHOULD_BE_NUMBER = 'min should be number',
	EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN = 'exclusiveMin should be boolean',
	MAX_SHOULD_BE_NUMBER = 'max should be number',
	EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN = 'exclusiveMax should be boolean',
	INVALID_NUMBER_FORMAT = 'invalid number format : <<A>>',
	INVALID_STRING_FORMAT = 'invalid string format : <<A>>',
	INVALID_STRING_PATTERN = 'invalid string pattern : <<A>>',
	MIN_LENGTH_SHOULD_BE_INTEGER = 'minLength should be a integer',
	MAX_LENGTH_SHOULD_BE_INTEGER = 'maxLength should be a integer',
	PROPERTIES_SHOULD_BE_ARRAY = 'properties should be array',
	PROPERTIES_SHOULD_HAVE_ITEMS = 'properties should have items',
	PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT = 'properties should be array of object',
	MIN_DATE_SHOULD_BE_DATE_OR_STRING = 'min should be Date or string representing date',
	MAX_DATE_SHOULD_BE_DATE_OR_STRING = 'max should be Date or string representing date',
	UNIQUE_SHOULD_BE_BOOLEAN = 'unique should be boolean',
	INVALID_ITEMS_SCHEME = 'invalid schemes of array items : <<A>>',
	REQUIRED = 'required',
	TYPE_MISMATCH = 'the value should be a <<A>>',
	TYPE_MISMATCH_ONE_OF = 'the value should be one of <<A>>',
	ONE_OF = 'the value should be one of <<A>>',
	FORMAT = 'the value should be a form of <<A>>',
	FORMAT_ONE_OF = 'the value should be form of one of <<A>>',
	GREATER_THAN_OR_EQUAL = 'the value should be greater or equal than <<A>>',
	GREATER_THAN = 'the value should be greater than <<A>>',
	SMALLER_THAN_OR_EQUAL = 'the value should be smaller or equal than <<A>>',
	SMALLER_THAN = 'the value should be smaller than <<A>>',
	MIN_LENGTH = 'the value should be longer than <<A>>',
	MAX_LENGTH = 'the value should be shorter than <<A>>',
	PATTERN = 'the value should be pattern of <<A>>',
	PATTERN_ONE_OF = 'the value should be one of pattern of <<A>>',
	AFTER_OR_SAME_DATE = 'the value should be after or same date than <<A>>',
	AFTER_DATE = 'the value should be after date than <<A>>',
	BEFORE_OR_SAME_DATE = 'the value should be before or same date than <<A>>',
	BEFORE_DATE = 'the value should be before date than <<A>>',
	UNIQUE_ITEMS = 'the array should be unique items',
	ITEMS_TYPE = 'the array should have items in type of <<A>>',
	ITEMS_SCHEME = 'the array should have items matched with scheme of <<A>>',
	ITEMS_SCHEMES = 'the array should have items matched with schemes of <<A>>'
}