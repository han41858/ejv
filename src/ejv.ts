import { EjvError, Options, Scheme } from './interfaces';
import { DataType, ErrorMsg, ErrorMsgCursor } from './constants';

import { definedTester, objectTester, stringTester } from './tester';

export const ejv : Function = (data : object, scheme : Scheme, options : Options) : null | EjvError => {
	console.log('ejv() %o', { data, scheme });

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

	if (!objectTester(scheme) || scheme === null) {
		throw new Error(ErrorMsg.NO_JSON_SCHEME);
	}

	// root should have 'properties' keyword
	if (!definedTester(scheme.properties)) {
		throw new Error(ErrorMsg.NO_ROOT_PROPERTIES);
	}

	// check data by scheme
	let result : EjvError = null;

	const keyArr : string[] = Object.keys(scheme.properties);
	console.log(keyArr);

	// use for() instead of forEach() to use break
	const keyArrLength : number = keyArr.length;
	let key : string;
	let value : any;
	let path : string;

	for (let i = 0; i < keyArrLength; i++) {
		key = keyArr[i];
		value = data[key];

		// check defined
		if (!definedTester(data[key])) {
			result = new EjvError(ErrorMsg.REQUIRED, key, value);
		}

		// check DIFFERENT_TYPE
		const type : DataType = scheme.properties[key].type;
		console.log('type :', type);

		if (!result) {
			switch (type) {
				case DataType.string:
					if (!stringTester(value)) {
						result = new EjvError(ErrorMsg.DIFFERENT_TYPE, key, value);
						path = `${key}`;
					}
					break;

				default:
					path = `${key}`;

					if (type === undefined) {
						throw new Error(ErrorMsg.NO_TYPE_FOR.replace(ErrorMsgCursor, path));
					} else {
						throw new Error(ErrorMsg.INVALID_TYPE_FOR.replace(ErrorMsgCursor, path));
					}

			}
		}

		if (!!result) {
			break;
		}
	}

	console.log('result : %o', result);

	return result;
};
