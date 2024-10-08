import { DATA_TYPE, ERROR_TYPE, NUMBER_FORMAT, STRING_FORMAT } from './constants';

export type AllDataType = string | string[] | DATA_TYPE | DATA_TYPE[];


interface CommonScheme {
	parent?: Scheme;

	key?: string; // can be omitted in array items
	type?: AllDataType; // optional for not

	optional?: boolean; // false
	nullable?: boolean; // false
}

// no additional rule
export type BooleanScheme = CommonScheme;

export interface MinMax<T> {
	min?: T;
	exclusiveMin?: boolean; // default false

	max?: T;
	exclusiveMax?: boolean; // default false
}

export interface MinMaxScheme<T> extends CommonScheme, MinMax<T> {
}

export interface NumberScheme extends MinMaxScheme<number> {
	enum?: number[];
	notEnum?: number[];

	format?: string | string[] | NUMBER_FORMAT | NUMBER_FORMAT[];
}

export interface StringScheme extends CommonScheme {
	enum?: string[];
	notEnum?: string[];

	format?: string | string[] | STRING_FORMAT | STRING_FORMAT[];
	pattern?: string | string[] | RegExp | RegExp[];

	length?: number;
	minLength?: number;
	maxLength?: number;
}

export interface ObjectScheme extends CommonScheme {
	properties?: Scheme[];
	allowNoProperty?: boolean; // true
}

// min, max string for date string
export type DateScheme = MinMaxScheme<string | Date>

// no additional rule
export type RegExpScheme = CommonScheme;

export interface ArrayScheme extends CommonScheme {
	unique?: boolean; // false
	items?: AllDataType | Scheme | Scheme[];

	length?: number;
	minLength?: number;
	maxLength?: number;
}

export type Scheme =
	BooleanScheme
	| NumberScheme
	| StringScheme
	| ObjectScheme
	| DateScheme
	| RegExpScheme
	| ArrayScheme;


export interface Options {
	customErrorMsg?: {
		[key in ERROR_TYPE]?: string;
	};
}

export interface InternalOptions extends Options {
	path: string[];
}

export class EjvError {
	public type: ERROR_TYPE;
	public message: string;

	public data: unknown;
	public path: string | undefined;

	public errorScheme: Scheme | undefined;
	public errorData: unknown | undefined;

	public isSchemeError: boolean;
	public isDataError: boolean;

	constructor (param: {
		type: ERROR_TYPE,
		message: string,

		data: unknown,
		path?: string[],

		errorScheme?: Scheme,
		errorData?: unknown,

		isSchemeError?: boolean
	}) {
		this.type = param.type;
		this.message = param.message;

		this.data = param.data;

		if ('path' in param && param.path !== undefined) {
			this.path = param.path.join('/');
		}

		if ('errorScheme' in param) {
			this.errorScheme = param.errorScheme;
		}

		if ('errorData' in param) {
			this.errorData = param.errorData;
		}

		if (param.isSchemeError) {
			this.isSchemeError = true;
			this.isDataError = false;
		}
		else {
			this.isSchemeError = false;
			this.isDataError = true;
		}
	}
}

export interface AnyObject {
	[key: string]: unknown;
}
