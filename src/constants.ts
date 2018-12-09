export enum DataType {
	undefined = 'undefined',
	null = 'null',

	boolean = 'boolean',

	number = 'number',
	integer = 'integer',
	index = 'index',

	string = 'string',
	email = 'email',
	url = 'url',
	ipv4 = 'ipv4',
	ipv6 = 'ipv6',

	object = 'object',

	date = 'date',

	regexp = 'regexp',

	array = 'array'
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