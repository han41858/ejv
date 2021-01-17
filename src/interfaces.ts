import { DataType, ErrorType, NumberFormat, StringFormat } from './constants';

// use common Scheme for multiple types
export interface Scheme {
	// common
	key? : string; // can be omitted in array items
	type : string | string[] | DataType | DataType[];
	optional? : boolean; // false
	nullable? : boolean; // false
	// reverse? not?

	// common - number & Date (date string, Date)
	min? : number | string | Date;
	exclusiveMin? : boolean; // false

	max? : number | string | Date;
	exclusiveMax? : boolean; // false

	// common - number & string
	enum? : number[] | string[];
	enumReverse? : number[] | string[];

	// common - number & string
	format? : string | string[] | NumberFormat | NumberFormat[] | StringFormat | StringFormat[];

	// common - string & array
	length? : number;
	minLength? : number;
	maxLength? : number;

	// string
	pattern? : string | string[] | RegExp | RegExp[];

	// object
	properties? : Scheme[];
	allowNoProperty? : boolean; // true

	// array
	unique? : boolean; // false
	items? : string | string[] | DataType | DataType[] | Scheme | Scheme[];
}

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

	constructor (public type : ErrorType,
	             public message : string,
	             path : string[],
	             public data : any,
	             public errorData : any) {
		this.path = path.join('/');
	}
}
