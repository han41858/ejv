import { DATA_TYPE, ERROR_TYPE, NUMBER_FORMAT, STRING_FORMAT } from './constants';

// type names : string literal or DATA_TYPE value (ex. 'number', DATA_TYPE.NUMBER)
type Named<T extends string> = T | `${ T }`;

export type DataTypeName = Named<DATA_TYPE>;
export type AllDataType = DataTypeName | DataTypeName[];

export type NumberFormatName = Named<NUMBER_FORMAT>;
export type StringFormatName = Named<STRING_FORMAT>;


// common rules for all schemes. V is the type of the value passed to validate()
interface BaseScheme<V = unknown> {
	key?: string; // can be omitted in array items

	optional?: boolean; // false
	nullable?: boolean; // false

	// custom validation, called after the other rules of the scheme pass.
	// value : the value to validate, data : the data passed to ejv()
	// returns null if the value is valid, or an error message
	validate?(value: V, data: unknown): string | null;
}

export interface MinMax<T> {
	min?: T;
	exclusiveMin?: boolean; // default false

	max?: T;
	exclusiveMax?: boolean; // default false
}

interface NumberRules extends MinMax<number> {
	enum?: number[];
	notEnum?: number[];

	format?: NumberFormatName | NumberFormatName[];
}

interface StringRules {
	enum?: string[];
	notEnum?: string[];

	format?: StringFormatName | StringFormatName[];
	pattern?: string | string[] | RegExp | RegExp[];

	length?: number;
	minLength?: number;
	maxLength?: number;
}

interface ObjectRules {
	properties?: Scheme[];
	allowNoProperty?: boolean; // true
	allowUnknownProperty?: boolean; // true
}

// min, max string for date string
type DateRules = MinMax<string | Date>;

interface ArrayRules {
	unique?: boolean; // false
	items?: AllDataType | Scheme | Scheme[];

	length?: number;
	minLength?: number;
	maxLength?: number;
}

export type BufferLike = ArrayBuffer
	| SharedArrayBuffer
	| Exclude<ArrayBufferView, DataView>;

interface BufferRules {
	byteLength?: number;
	minByteLength?: number;
	maxByteLength?: number;
}

// schemes of a single type : only the rules of the type are allowed
export interface BooleanScheme extends BaseScheme<boolean> {
	type: Named<DATA_TYPE.BOOLEAN>;
}

export interface NumberScheme extends BaseScheme<number>, NumberRules {
	type: Named<DATA_TYPE.NUMBER>;
}

export interface StringScheme extends BaseScheme<string>, StringRules {
	type: Named<DATA_TYPE.STRING>;
}

export interface ObjectScheme extends BaseScheme<object>, ObjectRules {
	type: Named<DATA_TYPE.OBJECT>;
}

export interface DateScheme extends BaseScheme<Date>, DateRules {
	type: Named<DATA_TYPE.DATE>;
}

export interface RegExpScheme extends BaseScheme<RegExp> {
	type: Named<DATA_TYPE.REGEXP>;
}

export interface ArrayScheme extends BaseScheme<unknown[]>, ArrayRules {
	type: Named<DATA_TYPE.ARRAY>;
}

export interface BufferScheme extends BaseScheme<BufferLike>, BufferRules {
	type: Named<DATA_TYPE.BUFFER>;
}

// rules of all types, for the schemes whose type is decided by the value
interface AnyTypeRules extends ObjectRules, BufferRules {
	enum?: (number | string)[];
	notEnum?: (number | string)[];

	format?: NumberFormatName | StringFormatName | (NumberFormatName | StringFormatName)[];
	pattern?: string | string[] | RegExp | RegExp[];

	min?: number | string | Date;
	exclusiveMin?: boolean;
	max?: number | string | Date;
	exclusiveMax?: boolean;

	length?: number;
	minLength?: number;
	maxLength?: number;

	unique?: boolean;
	items?: AllDataType | Scheme | Scheme[];
}

// several types (ex. ['number', 'string']) : the rules of the type resolved by the value are used
export interface MultiTypeScheme extends BaseScheme, AnyTypeRules {
	type: DataTypeName[];
}

export type Scheme =
	BooleanScheme
	| NumberScheme
	| StringScheme
	| ObjectScheme
	| DateScheme
	| RegExpScheme
	| ArrayScheme
	| BufferScheme
	| MultiTypeScheme;

// internal : reference to the upper scheme to follow its type and rules.
// not a part of the public scheme, but read for the schemes passed with it
export type SchemeWithParent = Scheme & {
	parent?: SchemeWithParent | null;
};


export interface Options {
	customErrorMsg?: {
		[key in ERROR_TYPE]?: string;
	};

	allowUnknownProperty?: boolean; // true, for the top level data
}

export interface InternalOptions extends Options {
	path: string[];
	rootData?: AnyObject; // data passed to ejv(), for custom validation
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
