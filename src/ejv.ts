import { EjvError, Options, Scheme } from './interfaces';
import { DataType, ErrorMsg, ErrorMsgCursorA } from './constants';

import {
	arrayTester,
	definedTester,
	enumTester,
	exclusiveMaxNumberTester,
	exclusiveMinNumberTester,
	maxNumberTester,
	minNumberTester,
	numberTester,
	objectTester
} from './tester';

const _ejv : Function = (data : object, schemes : Scheme[], options : Options) : null | EjvError => {
	// check data by schemes
	let result : EjvError = null;

	// use for() instead of forEach() to stop
	const schemeLength : number = schemes.length;

	for (let i = 0; i < schemeLength; i++) {
		const scheme : Scheme = schemes[i];
		const key : string = scheme.key;

		if (!(scheme.optional === true && !definedTester(data[key]))) {
			if (!definedTester(data[key])) {
				result = new EjvError(ErrorMsg.REQUIRED, key, data[key]);
				break;
			}

			let types : DataType[];
			let typeResolved : DataType;

			if (arrayTester(scheme.type)) {
				types = scheme.type as DataType[];
			} else {
				types = [scheme.type as DataType];
			}

			const value : any = data[key];

			if (!types.some(type => {
				let valid : boolean = false;

				switch (type) {
					case DataType.NUMBER:
						valid = numberTester(value);
						if (valid) {
							typeResolved = type;
						}
						break;
				}

				return valid;
			})) {
				if (!arrayTester(scheme.type)) {
					result = new EjvError(ErrorMsg.TYPE_MISMATCH
						.replace(ErrorMsgCursorA, scheme.type as DataType)
						, key, value);
				} else {
					result = new EjvError(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, `[${(<DataType[]>scheme.type).join(', ')}]`)
						, key, value);
				}
				break;
			}

			// additional check for type resolved
			switch (typeResolved) {
				case DataType.NUMBER:
					if (definedTester(scheme.enum) && !enumTester(value, scheme.enum)) {
						result = new EjvError(
							ErrorMsg.ONE_OF
								.replace(ErrorMsgCursorA, `[${scheme.enum.join(', ')}]`),
							key,
							value
						);
						break;
					}

					if (definedTester(scheme.min)) {
						if (!definedTester(scheme.exclusiveMin) || scheme.exclusiveMin !== true) {
							if (!minNumberTester(value, scheme.min)) {
								result = new EjvError(
									ErrorMsg.GREATER_THAN_OR_EQUAL
										.replace(ErrorMsgCursorA, '' + scheme.min),
									key,
									value
								);
								break;
							}
						} else {
							if (!exclusiveMinNumberTester(value, scheme.min)) {
								result = new EjvError(
									ErrorMsg.GREATER_THAN
										.replace(ErrorMsgCursorA, '' + scheme.min),
									key,
									value
								);
								break;
							}
						}
					}

					if (definedTester(scheme.max)) {
						if (!definedTester(scheme.exclusiveMax) || scheme.exclusiveMax !== true) {
							if (!maxNumberTester(value, scheme.max)) {
								result = new EjvError(
									ErrorMsg.SMALLER_THAN_OR_EQUAL
										.replace(ErrorMsgCursorA, '' + scheme.max),
									key,
									value
								);
								break;
							}
						} else {
							if (!exclusiveMaxNumberTester(value, scheme.max)) {
								result = new EjvError(
									ErrorMsg.SMALLER_THAN
										.replace(ErrorMsgCursorA, '' + scheme.max),
									key,
									value
								);
								break;
							}
						}
					}
					break;
			}
		}
	}

	return result;
};

export const ejv : Function = (data : object, schemes : Scheme[], options : Options) : null | EjvError => {
	// check data itself
	if (!definedTester(data)) {
		throw new Error(ErrorMsg.NO_DATA);
	}

	if (!objectTester(data) || data === null) {
		throw new Error(ErrorMsg.NO_JSON_DATA);
	}

	// check schemes itself
	if (!definedTester(schemes)) {
		throw new Error(ErrorMsg.NO_SCHEME);
	}

	if (!arrayTester(schemes) || schemes === null) {
		throw new Error(ErrorMsg.NO_ARRAY_SCHEME);
	}

	if (schemes.length === 0) {
		throw new Error(ErrorMsg.EMPTY_ROOT_SCHEME);
	}

	// TODO: check schemes

	return _ejv(data, schemes);
};
