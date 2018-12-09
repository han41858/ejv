interface ObjectScheme {
	properties : {
		[key : string] : any;
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