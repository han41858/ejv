export enum DataType {
	UNDEFINED = 'undefined',
	NULL = 'null',

	BOOLEAN = 'boolean',

	NUMBER = 'number',
	INTEGER = 'integer',
	INDEX = 'index',

	STRING = 'string',
	EMAIL = 'email',
	URL = 'url',
	IPV4 = 'ipv4',
	IPV6 = 'ipv6',

	OBJECT = 'object',

	DATE = 'date',

	REGEXP = 'regexp',

	ARRAY = 'array'
}

export const ErrorMsgCursor : string = '###';

export enum ErrorMsg {
	// about Error
	NO_DATA = 'no data to validate',
	NO_JSON_DATA = 'no JSON data to validate',
	NO_SCHEME = 'no scheme',
	NO_JSON_SCHEME = 'no JSON scheme',
	NO_ROOT_PROPERTIES = 'no root properties',

	NO_TYPE_FOR = 'no type for [###]',
	INVALID_TYPE_FOR = 'invalid type enum for [###]',

	// about EjvError
	REQUIRED = 'required',
	DIFFERENT_TYPE = 'type'
}