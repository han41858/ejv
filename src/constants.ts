export enum DataType {
	BOOLEAN = 'boolean',
	NUMBER = 'number',
	STRING = 'string',
	OBJECT = 'object',
	DATE = 'date',
	REGEXP = 'regexp',
	ARRAY = 'array'
}

export enum NumberFormat {
	INTEGER = 'integer',
	INDEX = 'index'
}

export enum StringFormat {
	EMAIL = 'email',

	DATE = 'date',
	DATE_TIME = 'date-time',
	TIME = 'time',

	// URL = 'url',

	// IP = 'ip', // ipv4 || ipv6
	// IPV4 = 'ipv4',
	// IPV6 = 'ipv6'
}

export const ErrorMsgCursorA : string = '<<A>>';

export enum ErrorKey {
	REQUIRED = 'REQUIRED',
	TYPE_MISMATCH = 'TYPE_MISMATCH',
	TYPE_MISMATCH_ONE_OF = 'TYPE_MISMATCH_ONE_OF',

	ONE_OF = 'ONE_OF',

	FORMAT = 'FORMAT',
	FORMAT_ONE_OF = 'FORMAT_ONE_OF',

	GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
	GREATER_THAN = 'GREATER_THAN',

	SMALLER_THAN_OR_EQUAL = 'SMALLER_THAN_OR_EQUAL',
	SMALLER_THAN = 'SMALLER_THAN',

	MIN_LENGTH = 'MIN_LENGTH',
	MAX_LENGTH = 'MAX_LENGTH',

	PATTERN = 'PATTERN',
	PATTERN_ONE_OF = 'PATTERN_ONE_OF',

	AFTER_OR_SAME_DATE = 'AFTER_OR_SAME_DATE',
	AFTER_DATE = 'AFTER_DATE',

	BEFORE_OR_SAME_DATE = 'BEFORE_OR_SAME_DATE',
	BEFORE_DATE = 'BEFORE_DATE',

	UNIQUE_ITEMS = 'UNIQUE_ITEMS',

	ITEMS_TYPE = 'ITEMS_TYPE',
	ITEMS_SCHEME = 'ITEMS_SCHEME',
	ITEMS_SCHEMES = 'ITEMS_SCHEMES',
}

export enum ErrorMsg {
	// about Error
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

	// about EjvError
	REQUIRED = 'required',
	TYPE_MISMATCH = 'the value should be a <<A>>',
	TYPE_MISMATCH_ONE_OF = 'the value should be one of <<A>>',

	ONE_OF = 'the value should be one of <<A>>', // enum

	FORMAT = 'the value should be a form of <<A>>', // format
	FORMAT_ONE_OF = 'the value should be form of one of <<A>>',

	GREATER_THAN_OR_EQUAL = 'the value should be greater or equal than <<A>>', // min
	GREATER_THAN = 'the value should be greater than <<A>>', // min

	SMALLER_THAN_OR_EQUAL = 'the value should be smaller or equal than <<A>>', // max
	SMALLER_THAN = 'the value should be smaller than <<A>>', // max

	MIN_LENGTH = 'the value should be longer than <<A>>', // minLength
	MAX_LENGTH = 'the value should be shorter than <<A>>', // maxLength

	PATTERN = 'the value should be pattern of <<A>>', // pattern
	PATTERN_ONE_OF = 'the value should be one of pattern of <<A>>', // pattern

	AFTER_OR_SAME_DATE = 'the value should be after or same date than <<A>>', // date
	AFTER_DATE = 'the value should be after date than <<A>>', // date

	BEFORE_OR_SAME_DATE = 'the value should be before or same date than <<A>>', // date
	BEFORE_DATE = 'the value should be before date than <<A>>', // date

	UNIQUE_ITEMS = 'the array should be unique items',

	ITEMS_TYPE = 'the array should have items in type of <<A>>',
	ITEMS_SCHEME = 'the array should have items matched with scheme of <<A>>',
	ITEMS_SCHEMES = 'the array should have items matched with schemes of <<A>>'
}