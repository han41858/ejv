import { DataType, ErrorType, NumberFormat, StringFormat } from './constants';


interface CommonScheme {
	key? : string; // can be omitted in array items
	type : string | string[] | DataType | DataType[];

	optional? : boolean; // false
	nullable? : boolean; // false

	// TODO
	// not? : Scheme | Scheme[];
}

// no additional rule
export type BooleanScheme = CommonScheme;

export interface NumberScheme extends CommonScheme {
	min? : number;
	exclusiveMin? : boolean; // false

	max? : number;
	exclusiveMax? : boolean; // false

	enum? : number[];
	enumReverse? : number[]; // TODO: deprecate with not

	format? : string | string[] | NumberFormat | NumberFormat[];
}

export interface StringScheme extends CommonScheme {
	enum? : string[];
	enumReverse? : string[]; // TODO: deprecate with not

	format? : string | string[] | StringFormat | StringFormat[];
	pattern? : string | string[] | RegExp | RegExp[];

	length? : number;
	minLength? : number;
	maxLength? : number;
}

export interface ObjectScheme extends CommonScheme {
	properties? : Scheme[];
	allowNoProperty? : boolean; // true
}

export interface DateScheme extends CommonScheme {
	min? : number | string | Date; // string for date string
	exclusiveMin? : boolean; // false

	max? : number | string | Date; // string for date string
	exclusiveMax? : boolean; // false
}

// no additional rule
export type RegExpScheme = CommonScheme;

export interface ArrayScheme extends CommonScheme {
	unique? : boolean; // false
	items? : string | string[] | DataType | DataType[] | Scheme | Scheme[];

	length? : number;
	minLength? : number;
	maxLength? : number;
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
	customErrorMsg? : {
		[key in ErrorType]? : string;
	};
}

export interface InternalOptions extends Options {
	path : string[];
}

export class EjvError {
	public path : string;

	constructor (
		public type : ErrorType,
		public message : string,
		path : string[],
		public data : unknown,
		public errorData : unknown
	) {
		this.path = path.join('/');
	}
}

export interface AnyObject {
	[key : string] : unknown;
}
