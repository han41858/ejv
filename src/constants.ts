export enum DataType {
	UNDEFINED = 'undefined',
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
	DATE_TILE = 'date-time',
	TIME = 'time',

	URL = 'url',

	IP = 'ip', // ipv4 || ipv6
	IPV4 = 'ipv4',
	IPV6 = 'ipv6'
}

export const ErrorMsgCursor : string = '###';

export enum ErrorMsg {
	// about Error
	NO_DATA = 'no data to validate',
	NO_JSON_DATA = 'no JSON data to validate',
	NO_SCHEME = 'no scheme',
	NO_SCHEME_FOR = 'no scheme for [###]',
	NO_JSON_SCHEME = 'no JSON scheme',
	NO_ROOT_PROPERTIES = 'no root properties',

	NO_TYPE_FOR = 'no type for [###]',
	INVALID_TYPE_FOR = 'invalid type enum for [###]',

	// about EjvError
	REQUIRED = 'required',
	DIFFERENT_TYPE = 'type'
}