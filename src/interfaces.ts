import { DataType, ErrorType, NumberFormat, StringFormat } from './constants';

export type AllDataType = string | string[] | DataType | DataType[];


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

	format?: string | string[] | NumberFormat | NumberFormat[];
}

export interface StringScheme extends CommonScheme {
	enum?: string[];

	format?: string | string[] | StringFormat | StringFormat[];
	pattern?: string | string[] | RegExp | RegExp[];

	length?: number;
	minLength?: number;
	maxLength?: number;
}

export interface ObjectScheme extends CommonScheme {
	properties?: Scheme[];
	allowNoProperty?: boolean; // true
}


/* eslint-disable @typescript-eslint/no-empty-interface */
export interface DateScheme extends MinMaxScheme<string | Date> {
	// min, max string for date string
}

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
		[key in ErrorType]?: string;
	};
}

export interface InternalOptions extends Options {
	path: string[];
}

export class EjvError {
	public type: ErrorType;
	public message: string;

	public data: unknown;
	public path: string | undefined;

	public errorScheme: Scheme | undefined;
	public errorData: unknown | undefined;

	public isSchemeError: boolean;
	public isDataError: boolean;

	constructor (param: {
		type: ErrorType,
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
