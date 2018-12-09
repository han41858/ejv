import { EjvError, Options, Scheme } from './interfaces';
import { DataType, ErrorMsg, ErrorMsgCursor } from './constants';

import { arrayTester, definedTester, objectTester, typeTester } from './tester';

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
		path = `${key}`;

		// check defined
		if (!definedTester(data[key])) {
			result = new EjvError(ErrorMsg.REQUIRED, key, value);
		}

		if (!result) {
			// check type
			const type : DataType | DataType[] = scheme.properties[key].type;
			console.log('type :', type);

			if (!definedTester(type)) {
				throw new Error(ErrorMsg.NO_TYPE_FOR.replace(ErrorMsgCursor, path));
			}

			if (arrayTester(type)) {
				const typeAsArray : DataType[] = type as DataType[];

				// TODO: use ejv() array empty
				if (typeAsArray.length === 0) {
					throw new Error(ErrorMsg.NO_TYPE_FOR.replace(ErrorMsgCursor, key));
				}

				// TODO: use ejv() string enum
				if (!typeAsArray.every(type => {
					return Object.values(DataType).includes(type);
				})) {
					throw new Error(ErrorMsg.INVALID_TYPE_FOR.replace(ErrorMsgCursor, key));
				}

				if (!typeAsArray.some((type : DataType) => {
					return typeTester(type, value);
				})) {
					result = new EjvError(ErrorMsg.DIFFERENT_TYPE, key, value);
				}
			} else {
				const typeAsString : DataType = type as DataType;

				if (!typeTester(typeAsString, value)) {
					result = new EjvError(ErrorMsg.DIFFERENT_TYPE, key, value);
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
