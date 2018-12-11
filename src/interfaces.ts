import { DataType, NumberFormat, StringFormat } from './constants';

interface CommonScheme {
	type : DataType;
	optional? : boolean; // false
}

interface BooleanScheme extends CommonScheme {
	type : DataType.BOOLEAN;
}

interface NumberScheme extends CommonScheme {
	type : DataType.NUMBER;

	min? : number;
	exclusiveMin? : number;

	max? : number;
	exclusiveMax? : number;

	enum? : number[];

	format? : NumberFormat;
}

interface StringScheme extends CommonScheme {
	type : DataType.STRING;

	minLength? : number;
	maxLength? : number;

	enum? : string[];

	pattern? : string | RegExp;

	format? : StringFormat;
}

export interface ObjectScheme extends CommonScheme {
	type : DataType.OBJECT;
	properties? : {
		type : DataType | DataType[];
	}
}

export interface RootObjectScheme {
	properties : {
		type : DataType | DataType[];
	}
}

interface DateScheme extends CommonScheme {
	type : DataType.DATE;

	min? : string | Date;
	exclusiveMin? : string | Date;

	max? : string | Date;
	exclusiveMax? : string | Date;

	enum? : (string | Date)[];
}

interface RegExpScheme extends CommonScheme {
	type : DataType.REGEXP;
}

interface ArrayScheme extends CommonScheme {
	type : DataType.ARRAY;

	minLength? : number;
	maxLength? : number;

	unique? : boolean; // false

	items? : Scheme[];
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
}

export class EjvError {
	constructor (private keyword : string,
	             private path : string,
	             private data : any) {
	}
}