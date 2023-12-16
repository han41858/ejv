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

export enum ErrorType {
	// about ejv() running
	NO_DATA = 'NO_DATA',

	NO_SCHEME = 'NO_SCHEME',
	INVALID_SCHEMES = 'INVALID_SCHEMES',

	// not match with scheme
	REQUIRED = 'REQUIRED',

	TYPE_MISMATCH = 'TYPE_MISMATCH',
	TYPE_MISMATCH_ONE_OF = 'TYPE_MISMATCH_ONE_OF',

	ONE_VALUE_OF = 'ONE_VALUE_OF',

	FORMAT = 'FORMAT',
	FORMAT_ONE_OF = 'FORMAT_ONE_OF',

	BIGGER_THAN_OR_EQUAL = 'BIGGER_THAN_OR_EQUAL',
	BIGGER_THAN = 'BIGGER_THAN',

	SMALLER_THAN_OR_EQUAL = 'SMALLER_THAN_OR_EQUAL',
	SMALLER_THAN = 'SMALLER_THAN',

	LENGTH = 'LENGTH',
	MIN_LENGTH = 'MIN_LENGTH',
	MAX_LENGTH = 'MAX_LENGTH',

	PATTERN = 'PATTERN',
	PATTERN_ONE_OF = 'PATTERN_ONE_OF',

	PROPERTY = 'PROPERTY',

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

	EMPTY_SCHEME = 'schemes should not be empty',
	SCHEMES_SHOULD_HAVE_TYPE = 'schemes should have type',
	SCHEMES_HAS_INVALID_TYPE = 'schemes has invalid type: <<1>>',
	SCHEMES_HAS_DUPLICATED_TYPE = 'schemes has duplicated type: <<1>>',

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
	REQUIRED = 'value is required',

	TYPE_MISMATCH = 'the value should be a <<1>>',
	TYPE_MISMATCH_ONE_OF = 'the value should be type of <<1>>',

	ONE_VALUE_OF = 'the value should be one of <<1>>', // enum

	FORMAT = 'the value should be a form of <<1>>', // format
	FORMAT_ONE_OF = 'the value should be form of one of <<1>>',

	BIGGER_THAN_OR_EQUAL = 'the value should be bigger or equal than <<1>>', // min
	BIGGER_THAN = 'the value should be bigger than <<1>>', // min

	SMALLER_THAN_OR_EQUAL = 'the value should be smaller or equal than <<1>>', // max
	SMALLER_THAN = 'the value should be smaller than <<1>>', // max

	LENGTH = 'the value should be length of <<1>>', // length
	MIN_LENGTH = 'the value should be longer than <<1>>', // minLength
	MAX_LENGTH = 'the value should be shorter than <<1>>', // maxLength

	PATTERN = 'the value should be pattern of <<1>>', // pattern
	PATTERN_ONE_OF = 'the value should be one of pattern of <<1>>', // pattern

	PROPERTY = 'the value should have property',

	AFTER_OR_SAME_DATE = 'the value should be after or same date than <<1>>', // date
	AFTER_DATE = 'the value should be after date than <<1>>', // date

	BEFORE_OR_SAME_DATE = 'the value should be before or same date than <<1>>', // date
	BEFORE_DATE = 'the value should be before date than <<1>>', // date

	UNIQUE_ITEMS = 'the array should be unique items',

	ITEMS_TYPE = 'the array should have items in type of <<1>>',
	ITEMS_SCHEMES = 'the array should have items matched with schemes of <<1>>'
}
