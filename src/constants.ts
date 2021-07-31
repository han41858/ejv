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

export const ErrorMsgCursorNot = '<<not>>'; // includes tail space

export enum ErrorType {
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

	LENGTH = 'LENGTH',
	MIN_LENGTH = 'MIN_LENGTH',
	MAX_LENGTH = 'MAX_LENGTH',

	PATTERN = 'PATTERN',
	PATTERN_ONE_OF = 'PATTERN_ONE_OF',

	NO_PROPERTY = 'NO_PROPERTY',

	AFTER_OR_SAME_DATE = 'AFTER_OR_SAME_DATE',
	AFTER_DATE = 'AFTER_DATE',

	BEFORE_OR_SAME_DATE = 'BEFORE_OR_SAME_DATE',
	BEFORE_DATE = 'BEFORE_DATE',

	UNIQUE_ITEMS = 'UNIQUE_ITEMS',

	ITEMS_TYPE = 'ITEMS_TYPE',
	ITEMS_SCHEMES = 'ITEMS_SCHEMES'
}

export enum ErrorMsg {
	// about Error
	NO_DATA = 'no data to validate',

	NO_SCHEME = 'no scheme',
	NO_ARRAY_SCHEME = 'schemes should be array',
	NO_OBJECT_ARRAY_SCHEME = 'schemes should be array of object',

	EMPTY_SCHEME = 'scheme should not be empty',
	SCHEMES_SHOULD_HAVE_TYPE = 'scheme should have type',
	SCHEMES_HAS_INVALID_TYPE = 'schemes has invalid type: <<1>>',
	SCHEMES_HAS_DUPLICATED_TYPE = 'schemes has duplicated type: <<1>>',
	SCHEMES_HAS_RULES_CONTRARY = 'schemes has rules to the contrary', // for not

	ENUM_SHOULD_BE_ARRAY = 'enum should be array',
	ENUM_SHOULD_BE_NUMBERS = 'enum values should be numbers',
	ENUM_SHOULD_BE_STRINGS = 'enum values should be strings',

	MIN_SHOULD_BE_NUMBER = 'min should be number',
	EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN = 'exclusiveMin should be a boolean',

	MAX_SHOULD_BE_NUMBER = 'max should be number',
	EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN = 'exclusiveMax should be a boolean',

	INVALID_NUMBER_FORMAT = 'invalid number format: <<1>>',
	INVALID_STRING_FORMAT = 'invalid string format: <<1>>',
	INVALID_STRING_PATTERN = 'invalid string pattern: <<1>>',

	LENGTH_SHOULD_BE_INTEGER = 'length should be a integer',
	MIN_LENGTH_SHOULD_BE_INTEGER = 'minLength should be a integer',
	MAX_LENGTH_SHOULD_BE_INTEGER = 'maxLength should be a integer',

	PROPERTIES_SHOULD_BE_ARRAY = 'properties should be array',
	PROPERTIES_SHOULD_HAVE_ITEMS = 'properties should have items',
	PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT = 'properties should be array of object',

	ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN = 'allowNoProperty should be a boolean',

	MIN_DATE_SHOULD_BE_DATE_OR_STRING = 'min should be Date or string representing date',
	MAX_DATE_SHOULD_BE_DATE_OR_STRING = 'max should be Date or string representing date',

	UNIQUE_SHOULD_BE_BOOLEAN = 'unique should be a boolean',

	INVALID_ITEMS_SCHEME = 'invalid schemes of array items: <<1>>',

	// about EjvError
	REQUIRED = 'value is <<not>>required',

	TYPE_MISMATCH = 'the value should <<not>>be a <<1>>',
	TYPE_MISMATCH_ONE_OF = 'the value should <<not>>be one of <<1>>',

	ONE_OF = 'the value should <<not>>be one of <<1>>', // enum

	FORMAT = 'the value should <<not>>be a form of <<1>>', // format
	FORMAT_ONE_OF = 'the value should <<not>>be form of one of <<1>>',

	GREATER_THAN_OR_EQUAL = 'the value should <<not>>be greater or equal than <<1>>', // min
	GREATER_THAN = 'the value should <<not>>be greater than <<1>>', // min

	SMALLER_THAN_OR_EQUAL = 'the value should <<not>>be smaller or equal than <<1>>', // max
	SMALLER_THAN = 'the value should <<not>>be smaller than <<1>>', // max

	LENGTH = 'the value should <<not>>be length of <<1>>', // length
	MIN_LENGTH = 'the value should <<not>>be longer than <<1>>', // minLength
	MAX_LENGTH = 'the value should <<not>>be shorter than <<1>>', // maxLength

	PATTERN = 'the value should <<not>>be pattern of <<1>>', // pattern
	PATTERN_ONE_OF = 'the value should <<not>>be one of pattern of <<1>>', // pattern

	NO_PROPERTY = 'the value should <<not>>have property',

	AFTER_OR_SAME_DATE = 'the value should <<not>>be after or same date than <<1>>', // date
	AFTER_DATE = 'the value should <<not>>be after date than <<1>>', // date

	BEFORE_OR_SAME_DATE = 'the value should <<not>>be before or same date than <<1>>', // date
	BEFORE_DATE = 'the value should <<not>>be before date than <<1>>', // date

	UNIQUE_ITEMS = 'the array should <<not>>be unique items',

	ITEMS_TYPE = 'the array should <<not>>have items in type of <<1>>',
	ITEMS_SCHEMES = 'the array should <<not>>have items matched with schemes of <<1>>'
}
