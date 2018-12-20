import { EjvError, InternalOptions, Options, Scheme } from './interfaces';
import { DataType, ErrorMsg, ErrorMsgCursorA, NumberFormat, StringFormat } from './constants';

import {
	arrayTester,
	booleanTester,
	dateFormatTester,
	dateTester,
	dateTimeFormatTester,
	definedTester,
	emailTester,
	enumTester,
	exclusiveMaxNumberTester,
	exclusiveMinNumberTester,
	indexTester,
	integerTester,
	maxLengthTester,
	maxNumberTester,
	minLengthTester,
	minNumberTester,
	numberTester,
	objectTester,
	regExpTester,
	stringTester,
	timeFormatTester
} from './tester';

const _ejv : Function = (data : object, schemes : Scheme[], options : InternalOptions = {
	path : []
}) : null | EjvError => {
	// check data by schemes
	let result : EjvError = null;

	// use for() instead of forEach() to stop
	const schemeLength : number = schemes.length;

	for (let i = 0; i < schemeLength; i++) {
		const scheme : Scheme = schemes[i];
		const key : string = scheme.key;

		if (!(scheme.optional === true && !definedTester(data[key]))) {
			if (!definedTester(data[key])) {
				options.path.push(key);

				result = new EjvError(
					ErrorMsg.REQUIRED,
					options.path,
					data[key]
				);
				break;
			}

			let types : DataType[];
			let typeResolved : DataType = null;

			if (!arrayTester(scheme.type)) {
				types = [scheme.type as DataType];
			} else {
				types = scheme.type as DataType[];
			}

			const value : any = data[key];

			if (!types.some(type => {
				let valid : boolean = false;

				switch (type) {
					case DataType.BOOLEAN:
						valid = booleanTester(value);
						break;

					case DataType.NUMBER:
						valid = numberTester(value);
						break;

					case DataType.STRING:
						valid = stringTester(value);
						break;

					case DataType.OBJECT:
						valid = objectTester(value);
						break;

					case DataType.DATE:
						valid = dateTester(value);
						break;

					case DataType.REGEXP:
						valid = regExpTester(value);
						break;

					case DataType.ARRAY:
						valid = arrayTester(value);
						break;

					default:
						throw new Error('not defined data type'); // TODO: dev
				}

				if (valid) {
					typeResolved = type;
				}

				return valid;
			})) {
				options.path.push(key);

				if (!arrayTester(scheme.type)) {
					result = new EjvError(
						ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, scheme.type as DataType),
						options.path,
						value
					);
				} else {
					result = new EjvError(
						ErrorMsg.TYPE_MISMATCH_ONE_OF.replace(ErrorMsgCursorA, `[${(<DataType[]>scheme.type).join(', ')}]`),
						options.path,
						value
					);
				}
				break;
			}

			// common validation
			if (definedTester(scheme.enum) && !enumTester(value, scheme.enum)) {
				options.path.push(key);

				result = new EjvError(
					ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, `[${scheme.enum.join(', ')}]`),
					options.path,
					value
				);
				break;
			}

			// additional check for type resolved
			switch (typeResolved) {
				case DataType.NUMBER:
					if (definedTester(scheme.min)) {
						if (!definedTester(scheme.exclusiveMin) || scheme.exclusiveMin !== true) {
							if (!minNumberTester(value, scheme.min)) {
								options.path.push(key);

								result = new EjvError(
									ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.min),
									options.path,
									value
								);
								break;
							}
						} else {
							if (!exclusiveMinNumberTester(value, scheme.min)) {
								options.path.push(key);

								result = new EjvError(
									ErrorMsg.GREATER_THAN.replace(ErrorMsgCursorA, '' + scheme.min),
									options.path,
									value
								);
								break;
							}
						}
					}

					if (definedTester(scheme.max)) {
						if (!definedTester(scheme.exclusiveMax) || scheme.exclusiveMax !== true) {
							if (!maxNumberTester(value, scheme.max)) {
								options.path.push(key);

								result = new EjvError(
									ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.max),
									options.path,
									value
								);
								break;
							}
						} else {
							if (!exclusiveMaxNumberTester(value, scheme.max)) {
								options.path.push(key);

								result = new EjvError(
									ErrorMsg.SMALLER_THAN.replace(ErrorMsgCursorA, '' + scheme.max),
									options.path,
									value
								);
								break;
							}
						}
					}

					if (definedTester(scheme.format)) {
						let formats : NumberFormat[];

						if (!arrayTester(scheme.format)) {
							formats = [scheme.format as NumberFormat];
						} else {
							formats = scheme.format as NumberFormat[];
						}

						if (!formats.some(format => {
							let valid : boolean = false;

							switch (format) {
								case NumberFormat.INTEGER:
									valid = integerTester(value);
									break;

								case NumberFormat.INDEX:
									valid = indexTester(value);
									break;

								default:
									throw new Error('not defined number format'); // TODO: dev
							}

							return valid;
						})) {
							options.path.push(key);

							if (!arrayTester(scheme.format)) {
								result = new EjvError(
									ErrorMsg.FORMAT.replace(ErrorMsgCursorA, scheme.format as NumberFormat),
									options.path,
									value
								);
							} else {
								result = new EjvError(
									ErrorMsg.FORMAT.replace(ErrorMsgCursorA, `[${(<NumberFormat[]>scheme.format).join(', ')}]`),
									options.path,
									value
								);
							}
							break;
						}
					}
					break;

				case DataType.STRING:
					if (definedTester(scheme.minLength) && !minLengthTester(value, scheme.minLength)) {
						options.path.push(key);

						result = new EjvError(
							ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + scheme.minLength),
							options.path,
							value
						);
						break;
					}

					if (definedTester(scheme.maxLength) && !maxLengthTester(value, scheme.maxLength)) {
						options.path.push(key);

						result = new EjvError(
							ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + scheme.maxLength),
							options.path,
							value
						);
						break;
					}

					if (definedTester(scheme.format)) {
						switch (scheme.format) {
							case StringFormat.EMAIL:
								if (!emailTester(value)) {
									options.path.push(key);

									result = new EjvError(
										ErrorMsg.FORMAT.replace(ErrorMsgCursorA, scheme.format),
										options.path,
										value
									);
									break;
								}
								break;

							case StringFormat.DATE:
								if (!dateFormatTester(value)) {
									options.path.push(key);

									result = new EjvError(
										ErrorMsg.FORMAT.replace(ErrorMsgCursorA, scheme.format),
										options.path,
										value
									);
									break;
								}
								break;

							case StringFormat.TIME:
								if (!timeFormatTester(value)) {
									options.path.push(key);

									result = new EjvError(
										ErrorMsg.FORMAT.replace(ErrorMsgCursorA, scheme.format),
										options.path,
										value
									);
									break;
								}
								break;

							case StringFormat.DATE_TIME:
								if (!dateTimeFormatTester(value)) {
									options.path.push(key);

									result = new EjvError(
										ErrorMsg.FORMAT.replace(ErrorMsgCursorA, scheme.format),
										options.path,
										value
									);
									break;
								}
								break;

							default:
								throw new Error('not defined string format'); // TODO: dev
						}
					}
					break;

				case DataType.OBJECT:
					if (definedTester(scheme.properties)) {
						const partialData : object = data[key];
						const partialScheme : Scheme[] = scheme.properties;

						options.path.push(key);

						// call recursively
						result = _ejv(partialData, partialScheme, options);
					}
					break;

				case DataType.ARRAY:
					if (definedTester(scheme.minLength)) {
						if (!minLengthTester(value, scheme.minLength)) {
							options.path.push(key);

							result = new EjvError(
								ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + scheme.minLength),
								options.path,
								value
							);
						}
					}

					if (definedTester(scheme.maxLength)) {
						if (!maxLengthTester(value, scheme.maxLength)) {
							options.path.push(key);

							result = new EjvError(
								ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + scheme.maxLength),
								options.path,
								value
							);
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
