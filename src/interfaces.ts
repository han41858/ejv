import { DataType, ErrorType, NumberFormat, StringFormat } from './constants';

export type AllDataType = string | string[] | DataType | DataType[];


interface CommonScheme {
	key?: string; // can be omitted in array items
	type?: AllDataType; // optional for not

	optional?: boolean; // false
	nullable?: boolean; // false

	not?: Scheme | Scheme[];
}

// no additional rule
export type BooleanScheme = CommonScheme;

export interface MinMaxScheme<T> extends CommonScheme {
	min?: T;
	exclusiveMin?: boolean; // default false

	max?: T;
	exclusiveMax?: boolean; // default false
}

export interface NumberScheme extends MinMaxScheme<number> {
	value?: number; // TODO: need to add

	enum?: number[];

	format?: string | string[] | NumberFormat | NumberFormat[];
}

export interface StringScheme extends CommonScheme {
	value?: string; // TODO: need to add

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
export interface DateScheme extends MinMaxScheme<number | string | Date> {
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
	reverse: boolean; // default false, for not

	parentScheme?: Scheme;
}

export class EjvError {
	public type: ErrorType;
	public message: string;

	public data: unknown;
	public path: string;

	public errorScheme: Scheme;
	public errorData: unknown;

	constructor (param: {
		type: ErrorType,
		message: string,

		data: unknown,
		path: string[],

		errorScheme: Scheme,
		errorData: unknown
	}) {
		this.type = param.type;
		this.message = param.message;

		this.data = param.data;
		this.path = param.path.join('/');

		this.errorScheme = param.errorScheme;
		this.errorData = param.errorData;
	}
}

export interface AnyObject {
	[key: string]: unknown;
}
