import { DataType, NumberFormat, StringFormat } from './constants';

export interface Scheme {
	key? : string;
	type : DataType | DataType[];
	optional? : boolean;
	min? : number | string | Date;
	exclusiveMin? : boolean;
	max? : number | string | Date;
	exclusiveMax? : boolean;
	enum? : number[] | string[];
	format? : NumberFormat | NumberFormat[] | StringFormat | StringFormat[];
	minLength? : number;
	maxLength? : number;
	pattern? : string | string[] | RegExp | RegExp[];
	properties? : Scheme[];
	unique? : boolean;
	items? : DataType | DataType[] | Scheme | Scheme[];
}

export interface InternalOptions {
	path : string[];
}

export interface Options {
}

export declare class EjvError {
	keyword : string;
	data : any;
	path : string;

	constructor (keyword : string, path : string[], data : any);
}
