import { DataType, NumberFormat, StringFormat } from './constants';

// use common Scheme for multiple types
export interface Scheme {
	// common
	key? : string; // can be omitted in array items
	type : DataType | DataType[];
	optional? : boolean; // false
	// reverse? not?

	// common - number & Date
	min? : number;
	exclusiveMin? : boolean; // false

	max? : number;
	exclusiveMax? : boolean; // false

	// common - number & string
	enum? : number[] | string[];

	// common - number & string
	format? : NumberFormat | NumberFormat[] | StringFormat | StringFormat[];

	// common - string & array
	minLength? : number;
	maxLength? : number;

	// string
	pattern? : string | string[] | RegExp | RegExp[];

	// object
	properties? : Scheme[];

	// array
	unique? : boolean; // false
	items? : DataType | DataType[] | Scheme | Scheme[];
}

export interface InternalOptions {
	path : string[];
}

export interface Options {
}

export class EjvError {
	public path : string;

	constructor (public keyword : string,
	             path : string[],
	             public data : any) {
		this.path = path.join('/');
	}
}