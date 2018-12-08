import { EjvError } from './interfaces';

export const definedTester : Function = (value : any,) : null | EjvError => {
	let valid : boolean = value !== undefined;

	return valid ? null : new EjvError();
};
