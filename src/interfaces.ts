import { DataType, NumberFormat, StringFormat } from './constants';

// use common Scheme for multiple types
export interface Scheme {
	// common
	key : string;
	type : DataType | DataType[];
	optional? : boolean; // false
	// reverse? not?

	// common - number & Date
	min? : number;
	exclusiveMin? : number;

	max? : number;
	exclusiveMax? : number;

	// common - number & string & Date
	enum? : number[] | string[] | Date[];

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
	// items? : Scheme[];
}

export interface Options {
}

export class EjvError {
	constructor (public keyword : string,
	             public path : string,
	             public data : any) {
	}
}