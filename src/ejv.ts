import { EjvError, InternalOptions, Options, Scheme } from './interfaces';
import { DataType, ErrorMsg, ErrorMsgCursorA, NumberFormat, StringFormat } from './constants';

import {
	arrayTester,
	arrayTypeOfTester,
	dateFormatTester,
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
	objectTester,
	stringTester,
	timeFormatTester,
	typeTester,
	uniqueItemsTester
} from './tester';

const _ejv : Function = (data : object, schemes : Scheme[], _options : InternalOptions = {
	path : []
}) : null | EjvError => {
	// check data by schemes
	let result : EjvError = null;
	const options : InternalOptions = JSON.parse(JSON.stringify(_options)); // divide instance

	// use for() instead of forEach() to stop
	const schemeLength : number = schemes.length;

	for (let i = 0; i < schemeLength; i++) {
		const scheme : Scheme = schemes[i];
		const key : string = scheme.key;

		options.path.push(key);

		if (!(scheme.optional === true && !definedTester(data[key]))) {
			if (!definedTester(data[key])) {
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
				const valid : boolean = typeTester(value, type);

				if (valid) {
					typeResolved = type;
				}

				return valid;
			})) {
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

			// additional check for type resolved
			switch (typeResolved) {
				case DataType.NUMBER:
					if (definedTester(scheme.enum) && !enumTester(value, scheme.enum)) {
						result = new EjvError(
							ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, `[${scheme.enum.join(', ')}]`),
							options.path,
							value
						);
						break;
					}

					if (definedTester(scheme.min)) {
						if (!definedTester(scheme.exclusiveMin) || scheme.exclusiveMin !== true) {
							if (!minNumberTester(value, scheme.min)) {
								result = new EjvError(
									ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.min),
									options.path,
									value
								);
								break;
							}
						} else {
							if (!exclusiveMinNumberTester(value, scheme.min)) {
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
								result = new EjvError(
									ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.max),
									options.path,
									value
								);
								break;
							}
						} else {
							if (!exclusiveMaxNumberTester(value, scheme.max)) {
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
					if (definedTester(scheme.enum) && !enumTester(value, scheme.enum)) {
						result = new EjvError(
							ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, `[${scheme.enum.join(', ')}]`),
							options.path,
							value
						);
						break;
					}

					if (definedTester(scheme.minLength) && !minLengthTester(value, scheme.minLength)) {
						result = new EjvError(
							ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + scheme.minLength),
							options.path,
							value
						);
						break;
					}

					if (definedTester(scheme.maxLength) && !maxLengthTester(value, scheme.maxLength)) {
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

						// call recursively
						result = _ejv(partialData, partialScheme, options);
					}
					break;

				case DataType.ARRAY:
					if (definedTester(scheme.minLength) && !minLengthTester(value, scheme.minLength)) {
						result = new EjvError(
							ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + scheme.minLength),
							options.path,
							value
						);
					}

					if (definedTester(scheme.maxLength) && !maxLengthTester(value, scheme.maxLength)) {
						result = new EjvError(
							ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + scheme.maxLength),
							options.path,
							value
						);
					}

					if (definedTester(scheme.unique) && !uniqueItemsTester(value)) {
						result = new EjvError(
							ErrorMsg.UNIQUE_ITEMS,
							options.path,
							value
						);
					}

					if (definedTester(scheme.items)) {
						// convert array to object
						const valueAsArray : any[] = value as any[];

						const now : Date = new Date;
						const tempKeyArr : string[] = valueAsArray.map((value : any, i : number) => {
							return now.toISOString() + i;
						});

						if (stringTester(scheme.items) // by DataType
							|| (arrayTester(scheme.items) && arrayTypeOfTester(scheme.items, DataType.STRING)) // by DataType[]
						) {
							let itemTypes : DataType[];

							if (arrayTester(scheme.items)) {
								itemTypes = scheme.items as DataType[];
							} else {
								itemTypes = [scheme.items] as DataType[];
							}

							const partialData : object = {};
							const partialSchemes : Scheme[] = [];

							tempKeyArr.forEach((tempKey : string, i : number) => {
								partialData[tempKey] = valueAsArray[i];
								partialSchemes.push({
									key : tempKey,
									type : itemTypes
								});
							});

							// call recursively
							const partialResult : EjvError = _ejv(partialData, partialSchemes, options);

							// convert new EjvError
							if (!!partialResult) {
								let errorMsg : string;

								if (arrayTester(scheme.items)) {
									errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, `[${itemTypes.join(', ')}]`);
								} else {
									errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, scheme.items as string);
								}

								result = new EjvError(
									errorMsg,
									options.path,
									value
								);
							}
							break;
						} else {
							// by scheme
							const itemsAsSchemes : Scheme[] = scheme.items as Scheme[];

							let partialValid : boolean = true;

							// use for() instead of forEach() to break
							const valueLength : number = valueAsArray.length;

							for (let j = 0; j < valueLength; j++) {
								const oneValue : any = value[j];

								const partialData : object = {};
								const partialSchemes : Scheme[] = [];

								const tempKeyForThisValue : string = tempKeyArr[j];

								partialData[tempKeyForThisValue] = oneValue;

								partialSchemes.push(...itemsAsSchemes.map((oneScheme : Scheme) => {
									const newScheme : Scheme = JSON.parse(JSON.stringify(oneScheme)); // divide instance

									newScheme.key = tempKeyForThisValue;

									return newScheme;
								}));

								const partialResult : EjvError[] = partialSchemes.map((partialScheme : Scheme) => {
									// call recursively
									return _ejv(partialData, [partialScheme], options);
								});

								if (!partialResult.some(oneResult => oneResult === null)) {
									partialValid = false;
									break;
								}
							}

							if (partialValid === false) {
								result = new EjvError(
									ErrorMsg.ITEMS_SCHEME.replace(ErrorMsgCursorA, JSON.stringify(itemsAsSchemes)),
									options.path,
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
