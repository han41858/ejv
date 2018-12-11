import { EjvError, ObjectScheme, Options, RootObjectScheme, Scheme } from './interfaces';
import { DataType, ErrorMsg, ErrorMsgCursor } from './constants';

import { arrayTester, definedTester, objectTester, stringTester, typeArrayTester } from './tester';

const _ejv : Function = (data : object, scheme : Scheme, options : Options) : null | EjvError => {
	// check data by scheme
	let result : EjvError = null;

	switch (scheme.type) {
		case DataType.OBJECT:
			const keyArr : string[] = Object.keys(scheme.properties);

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
					const schemeAsAny : any = scheme.properties[key];

					if (!definedTester(schemeAsAny) || schemeAsAny === null) {
						throw new Error(ErrorMsg.NO_SCHEME_FOR.replace(ErrorMsgCursor, path));
					}

					let types : DataType[];

					if (stringTester(schemeAsAny)) {
						// short syntax - single type
						types = [schemeAsAny];
					} else if (arrayTester(schemeAsAny)) {
						// short syntax - multiple types
						types = schemeAsAny;
					} else {
						// normal syntax
						const typeOrTypes : DataType | DataType[] = schemeAsAny.type;

						if (arrayTester(typeOrTypes)) {
							types = typeOrTypes as DataType[];
						} else {
							types = [typeOrTypes as DataType];
						}
					}

					// TODO: use ejv() to filter invalid type
					if (!definedTester(types) || types.filter(type => !!type).length === 0) {
						throw new Error(ErrorMsg.NO_TYPE_FOR.replace(ErrorMsgCursor, path));
					}

					// TODO: use ejv() string enum
					if (!types.every(type => {
						return Object.values(DataType).includes(type);
					})) {
						throw new Error(ErrorMsg.INVALID_TYPE_FOR.replace(ErrorMsgCursor, key));
					}

					if (!typeArrayTester(types, value)) {
						result = new EjvError(ErrorMsg.DIFFERENT_TYPE, key, value);
					}
				}

				if (!!result) {
					break;
				}
			}
			break;
	}

	return result;
};

export const ejv : Function = (data : object, scheme : RootObjectScheme, options : Options) : null | EjvError => {
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

	// create new ObjectScheme using RootObjectScheme
	const objScheme : ObjectScheme = {
		type : DataType.OBJECT,
		properties : scheme.properties
	};

	return _ejv(data, objScheme);
};
