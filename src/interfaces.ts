import { DataType } from './constants';

interface ObjectScheme {
	properties : {
		type : DataType | DataType[];
	}
}

export type Scheme = ObjectScheme;

export interface Options {
}

export class EjvError {
	constructor (private keyword : string,
	             private path : string,
	             private data : any) {
	}
}