import { EjvError, InternalOptions, Options, Scheme } from './interfaces';
import { DataType, ErrorMsg, ErrorMsgCursorA, NumberFormat, StringFormat } from './constants';

import {
	arrayTester,
	arrayTypeOfTester,
	booleanTester,
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
	numberTester,
	objectTester,
	stringTester,
	timeFormatTester,
	typeTester,
	uniqueItemsTester
} from './tester';

const _ejv : Function = (data : object, schemes : Scheme[], _options : InternalOptions = {
	path : []
}) : null | EjvError => {
	// check schemes
	if (!arrayTester(schemes)) {
		throw new Error(ErrorMsg.NO_ARRAY_SCHEME);
	}

	if (!arrayTypeOfTester(schemes, DataType.OBJECT)) {
		throw new Error(ErrorMsg.NO_OBJECT_ARRAY_SCHEME);
	}

	if (!minLengthTester(schemes, 1)) {
		throw new Error(ErrorMsg.EMPTY_SCHEME);
	}

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

			if (!definedTester(scheme.type)) {
				throw new Error(ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE);
			}

			if (!arrayTester(scheme.type)) {
				types = [scheme.type as DataType];
			} else {
				types = scheme.type as DataType[];
			}

			const allDataType : DataType[] = Object.values(DataType);
			let errorType : string;

			if (!types.every(type => {
				const valid : boolean = stringTester(type) && enumTester(type, allDataType);

				if (valid === false) {
					errorType = type;
				}

				return valid;
			})) {
				throw new Error(ErrorMsg.SCHEMES_HAS_INVALID_TYPE.replace(ErrorMsgCursorA, errorType));
			}

			if (!uniqueItemsTester(types)) {
				throw new Error(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE);
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
						ErrorMsg.TYPE_MISMATCH_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.type)),
						options.path,
						value
					);
				}
				break;
			}

			// additional check for type resolved
			switch (typeResolved) {
				case DataType.NUMBER:
					if (definedTester(scheme.enum)) {
						if (!arrayTester(scheme.enum)) {
							throw new Error(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
						}

						if (!arrayTypeOfTester(scheme.enum, DataType.NUMBER)) {
							throw new Error(ErrorMsg.ENUM_SHOULD_BE_NUMBERS);
						}

						if (!enumTester(value, scheme.enum)) {
							result = new EjvError(
								ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.enum)),
								options.path,
								value
							);
							break;
						}
					}

					if (definedTester(scheme.min)) {
						if (!numberTester(scheme.min)) {
							throw new Error(ErrorMsg.MIN_SHOULD_BE_NUMBER);
						}

						if (definedTester(scheme.exclusiveMin)) {
							if (!booleanTester(scheme.exclusiveMin)) {
								throw new Error(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
							}

							if (scheme.exclusiveMin === true) {
								if (!exclusiveMinNumberTester(value, scheme.min)) {
									result = new EjvError(
										ErrorMsg.GREATER_THAN.replace(ErrorMsgCursorA, '' + scheme.min),
										options.path,
										value
									);
									break;
								}
							} else {
								if (!minNumberTester(value, scheme.min)) {
									result = new EjvError(
										ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.min),
										options.path,
										value
									);
									break;
								}
							}
						} else {
							if (!minNumberTester(value, scheme.min)) {
								result = new EjvError(
									ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.min),
									options.path,
									value
								);
								break;
							}
						}
					}

					if (definedTester(scheme.max)) {
						if (!numberTester(scheme.max)) {
							throw new Error(ErrorMsg.MAX_SHOULD_BE_NUMBER);
						}

						if (definedTester(scheme.exclusiveMax)) {
							if (!booleanTester(scheme.exclusiveMax)) {
								throw new Error(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
							}

							if (scheme.exclusiveMax === true) {
								if (!exclusiveMaxNumberTester(value, scheme.max)) {
									result = new EjvError(
										ErrorMsg.SMALLER_THAN.replace(ErrorMsgCursorA, '' + scheme.max),
										options.path,
										value
									);
									break;
								}
							} else {
								if (!maxNumberTester(value, scheme.max)) {
									result = new EjvError(
										ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.max),
										options.path,
										value
									);
									break;
								}
							}
						} else {
							if (!maxNumberTester(value, scheme.max)) {
								result = new EjvError(
									ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.max),
									options.path,
									value
								);
								break;
							}
						}
					}

					if (definedTester(scheme.format)) {
						let formats : NumberFormat[];

						const allNumberFormat : NumberFormat[] = Object.values(NumberFormat);

						if (!arrayTester(scheme.format)) {
							const formatAsString : NumberFormat = scheme.format as NumberFormat;

							if (!enumTester(formatAsString, allNumberFormat)) {
								throw new Error(ErrorMsg.INVALID_NUMBER_FORMAT.replace(ErrorMsgCursorA, formatAsString));
							}

							formats = [scheme.format as NumberFormat];
						} else {
							const formatAsArray : NumberFormat[] = scheme.format as NumberFormat[];

							let errorFormat : string;

							if (!formatAsArray.every(format => {
								const valid : boolean = enumTester(format, allNumberFormat);

								if (!valid) {
									errorFormat = format;
								}

								return valid;
							})) {
								throw new Error(ErrorMsg.INVALID_NUMBER_FORMAT.replace(ErrorMsgCursorA, errorFormat));
							}

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
									ErrorMsg.FORMAT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.format)),
									options.path,
									value
								);
							}
							break;
						}
					}
					break;

				case DataType.STRING:
					if (definedTester(scheme.enum)) {
						if (!arrayTester(scheme.enum)) {
							throw new Error(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
						}

						if (!arrayTypeOfTester(scheme.enum, DataType.STRING)) {
							throw new Error(ErrorMsg.ENUM_SHOULD_BE_STRINGS);
						}

						if (!enumTester(value, scheme.enum)) {
							result = new EjvError(
								ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.enum)),
								options.path,
								value
							);
							break;
						}
					}

					if (definedTester(scheme.minLength)) {
						if (!numberTester(scheme.minLength)) {
							throw new Error(ErrorMsg.MIN_LENGTH_SHOULD_BE_NUMBER);
						}

						if (!minLengthTester(value, scheme.minLength)) {
							result = new EjvError(
								ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + scheme.minLength),
								options.path,
								value
							);
							break;
						}
					}

					if (definedTester(scheme.maxLength)) {
						if (!numberTester(scheme.maxLength)) {
							throw new Error(ErrorMsg.MAX_LENGTH_SHOULD_BE_NUMBER);
						}

						if (!maxLengthTester(value, scheme.maxLength)) {
							result = new EjvError(
								ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + scheme.maxLength),
								options.path,
								value
							);
							break;
						}
					}

					if (definedTester(scheme.format)) {
						let formats : StringFormat[];

						const allStringFormat : StringFormat[] = Object.values(StringFormat);

						if (!arrayTester(scheme.format)) {
							const formatAsString : string = scheme.format as string;

							if (!enumTester(formatAsString, allStringFormat)) {
								throw new Error(ErrorMsg.INVALID_STRING_FORMAT.replace(ErrorMsgCursorA, formatAsString));
							}

							formats = [scheme.format] as StringFormat[];
						} else {
							const formatAsArray : string[] = scheme.format as string[];
							let errorFormat : string;

							if (!formatAsArray.every(format => {
								const valid : boolean = enumTester(format, allStringFormat);

								if (valid === false) {
									errorFormat = format;
								}

								return valid;
							})) {
								throw new Error(ErrorMsg.INVALID_STRING_FORMAT.replace(ErrorMsgCursorA, errorFormat));
							}

							formats = scheme.format as StringFormat[];
						}

						if (!formats.some(format => {
							let valid : boolean = false;

							switch (format) {
								case StringFormat.EMAIL:
									valid = emailTester(value);
									break;

								case StringFormat.DATE:
									valid = dateFormatTester(value);
									break;

								case StringFormat.TIME:
									valid = timeFormatTester(value);
									break;

								case StringFormat.DATE_TIME:
									valid = dateTimeFormatTester(value);
									break;
							}

							return valid;
						})) {
							if (!arrayTester(scheme.format)) {
								result = new EjvError(
									ErrorMsg.FORMAT.replace(ErrorMsgCursorA, scheme.format as StringFormat),
									options.path,
									value
								);
							} else {
								result = new EjvError(
									ErrorMsg.FORMAT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.format)),
									options.path,
									value
								);
							}
							break;
						}
					}
					break;

				case DataType.OBJECT:
					if (definedTester(scheme.properties)) {
						if (!arrayTester(scheme.properties)) {
							throw new Error(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY);
						}

						if (!minLengthTester(scheme.properties, 1)) {
							throw new Error(ErrorMsg.PROPERTIES_SHOULD_HAVE_ITEMS);
						}

						if (!arrayTypeOfTester(scheme.properties, DataType.OBJECT)) {
							throw new Error(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT);
						}

						const partialData : object = data[key];
						const partialScheme : Scheme[] = scheme.properties;

						// call recursively
						result = _ejv(partialData, partialScheme, options);
					}
					break;

				case DataType.ARRAY:
					if (definedTester(scheme.minLength)) {
						if (!numberTester(scheme.minLength)) {
							throw new Error(ErrorMsg.MIN_LENGTH_SHOULD_BE_NUMBER);
						}

						if (!minLengthTester(value, scheme.minLength)) {
							result = new EjvError(
								ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + scheme.minLength),
								options.path,
								value
							);
						}
					}

					if (definedTester(scheme.maxLength)) {
						if (!numberTester(scheme.maxLength)) {
							throw new Error(ErrorMsg.MAX_LENGTH_SHOULD_BE_NUMBER);
						}

						if (!maxLengthTester(value, scheme.maxLength)) {
							result = new EjvError(
								ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + scheme.maxLength),
								options.path,
								value
							);
						}
					}

					if (definedTester(scheme.unique)) {
						if (!booleanTester(scheme.unique)) {
							throw new Error(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN);
						}

						if (!uniqueItemsTester(value)) {
							result = new EjvError(
								ErrorMsg.UNIQUE_ITEMS,
								options.path,
								value
							);
						}
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
									errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, JSON.stringify(itemTypes));
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

export const ejv : Function = (data : object, schemes : Scheme[], options? : Options) : null | EjvError => {
	// check data itself
	if (!definedTester(data)) {
		throw new Error(ErrorMsg.NO_DATA);
	}

	if (!objectTester(data) || data === null) {
		throw new Error(ErrorMsg.NO_JSON_DATA);
	}

	// check schemes itself
	if (!definedTester(schemes) || schemes === null) {
		throw new Error(ErrorMsg.NO_SCHEME);
	}

	if (!arrayTester(schemes)) {
		throw new Error(ErrorMsg.NO_ARRAY_SCHEME);
	}

	if (!arrayTypeOfTester(schemes, DataType.OBJECT)) {
		throw new Error(ErrorMsg.NO_OBJECT_ARRAY_SCHEME);
	}

	if (!minLengthTester(schemes, 1)) {
		throw new Error(ErrorMsg.EMPTY_SCHEME);
	}

	return _ejv(data, schemes);
};
