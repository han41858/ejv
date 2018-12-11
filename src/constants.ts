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
	DATE_TILE = 'date-time',
	TIME = 'time',

	URL = 'url',

	IP = 'ip', // ipv4 || ipv6
	IPV4 = 'ipv4',
	IPV6 = 'ipv6'
}

export enum ErrorMsg {
	// about Error
	NO_DATA = 'no data to validate',
	NO_JSON_DATA = 'no JSON data to validate',

	NO_SCHEME = 'no scheme',
	NO_ARRAY_SCHEME = 'scheme should be array',

	EMPTY_ROOT_SCHEME = 'root scheme should not be empty',
	INVALID_TYPE = 'scheme has invalid type enum',

	// about EjvError
	REQUIRED = 'required',
	TYPE_MISMATCH = 'type mismatch'
}