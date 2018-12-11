import { EjvError, Options, Scheme } from './interfaces';
import { DataType, ErrorMsg } from './constants';

import { arrayTester, definedTester, numberTester, objectTester } from './tester';

const _ejv : Function = (data : object, scheme : Scheme[], options : Options) : null | EjvError => {
	// check data by scheme
	let result : EjvError = null;

	// use for() instead of forEach() to stop
	const schemeLength : number = scheme.length;

	for (let i = 0; i < schemeLength; i++) {
		const unitScheme : Scheme = scheme[i];
		const key : string = unitScheme.key;

		if (!(unitScheme.optional === true && !definedTester(data[key]))) {
			if (!definedTester(data[key])) {
				result = new EjvError(ErrorMsg.REQUIRED, key, data[key]);
			} else {
				let types : DataType[];

				if (arrayTester(unitScheme.type)) {
					types = unitScheme.type as DataType[];
				} else {
					types = [unitScheme.type as DataType];
				}

				const value : any = data[key];

				if (!types.some(type => {
					switch (type) {
						case DataType.NUMBER:
							return numberTester(value);
					}
				})) {
					result = new EjvError(ErrorMsg.TYPE_MISMATCH, key, value);
				}
			}
		}
		// else optional skip

		if (!!result) {
			break;
		}
	}

	return result;
};

export const ejv : Function = (data : object, scheme : Scheme[], options : Options) : null | EjvError => {
	// check data itself
	if (!definedTester(data)) {
		throw new Error(ErrorMsg.NO_DATA);
	}

	if (!objectTester(data) || data === null) {
		throw new Error(ErrorMsg.NO_JSON_DATA);
	}

	// check scheme itself
	if (!definedTester(scheme)) {
		throw new Error(ErrorMsg.NO_SCHEME);
	}

	if (!arrayTester(scheme) || scheme === null) {
		throw new Error(ErrorMsg.NO_ARRAY_SCHEME);
	}

	if (scheme.length === 0) {
		throw new Error(ErrorMsg.EMPTY_ROOT_SCHEME);
	}

	// TODO: check scheme

	return _ejv(data, scheme);
};
