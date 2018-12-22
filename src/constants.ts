export enum DataType {
	NULL = 'null',
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

	URL = 'url',

	IP = 'ip', // ipv4 || ipv6
	IPV4 = 'ipv4',
	IPV6 = 'ipv6'
}

export const ErrorMsgCursorA : string = '<<A>>';

export enum ErrorMsg {
	// about Error
	NO_DATA = 'no data to validate',
	NO_JSON_DATA = 'no JSON data to validate',

	NO_SCHEME = 'no scheme',
	NO_ARRAY_SCHEME = 'scheme should be array',

	EMPTY_ROOT_SCHEME = 'root scheme should not be empty',
	INVALID_TYPE_ENUM = 'scheme has invalid type enum',

	// about EjvError
	REQUIRED = 'required',
	TYPE_MISMATCH = 'the value should be a <<A>>',
	TYPE_MISMATCH_ONE_OF = 'the value should be one of <<A>>',

	ONE_OF = 'the value should be one of <<A>>', // enum

	FORMAT = 'the value should be a form of <<A>>', // format

	GREATER_THAN_OR_EQUAL = 'the value should be greater or equal than <<A>>', // min
	GREATER_THAN = 'the value should be greater than <<A>>', // min

	SMALLER_THAN_OR_EQUAL = 'the value should be smaller or equal than <<A>>', // max
	SMALLER_THAN = 'the value should be smaller than <<A>>', // max

	MIN_LENGTH = 'the value should be longer than <<A>>', // minLength
	MAX_LENGTH = 'the value should be shorter than <<A>>', // maxLength

	UNIQUE_ITEMS = 'the array should be unique items',

	ITEMS_TYPE = 'the array should have items in type of <<A>>',
	ITEMS_SCHEME = 'the array should have items matched with schemes of <<A>>'
}