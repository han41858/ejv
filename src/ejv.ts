import { EjvError, InternalOptions, Options, Scheme } from './interfaces';
import { DataType, ErrorMsg, ErrorMsgCursorA, ErrorType, NumberFormat, StringFormat } from './constants';

import {
	arrayTester,
	arrayTypeOfTester,
	booleanTester,
	dateFormatTester,
	dateTester,
	dateTimeFormatTester,
	definedTester,
	emailTester,
	enumTester,
	exclusiveMaxDateTester,
	exclusiveMaxNumberTester,
	exclusiveMinDateTester,
	exclusiveMinNumberTester,
	hasPropertyTester,
	indexTester,
	integerTester,
	maxDateTester,
	maxLengthTester,
	maxNumberTester,
	minDateTester,
	minLengthTester,
	minNumberTester,
	numberTester,
	objectTester,
	regExpTester,
	stringRegExpTester,
	stringTester,
	timeFormatTester,
	typeTester,
	uniqueItemsTester
} from './tester';
import { clone } from './util';

const _ejv : Function = (data : object, schemes : Scheme[], options : InternalOptions = {
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

	// use for() instead of forEach() to stop
	const schemeLength : number = schemes.length;

	for (let i = 0; i < schemeLength; i++) {
		const _options : InternalOptions = clone(options); // divide instance

		if (!definedTester(_options.path)) {
			_options.path = [];
		}

		const scheme : Scheme = schemes[i];
		const key : string = scheme.key;
		const value : any = data[key];

		_options.path.push(key);

		if (definedTester(value)) {
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

			if (value === null && scheme.nullable !== true) {
				result = new EjvError(
					ErrorType.REQUIRED,
					ErrorMsg.REQUIRED,
					_options.path,
					data[key]
				);
				break;
			}

			if (!types.some(type => {
				const valid : boolean = typeTester(value, type);

				if (valid) {
					typeResolved = type;
				}

				return valid;
			})) {
				if (!arrayTester(scheme.type)) {
					result = new EjvError(
						ErrorType.TYPE_MISMATCH,
						ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, scheme.type as DataType),
						_options.path,
						value
					);
				} else {
					result = new EjvError(
						ErrorType.TYPE_MISMATCH_ONE_OF,
						ErrorMsg.TYPE_MISMATCH_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.type)),
						_options.path,
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
								ErrorType.ONE_OF,
								ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.enum)),
								_options.path,
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
										ErrorType.GREATER_THAN,
										ErrorMsg.GREATER_THAN.replace(ErrorMsgCursorA, '' + scheme.min),
										_options.path,
										value
									);
									break;
								}
							} else {
								if (!minNumberTester(value, scheme.min)) {
									result = new EjvError(
										ErrorType.GREATER_THAN_OR_EQUAL,
										ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.min),
										_options.path,
										value
									);
									break;
								}
							}
						} else {
							if (!minNumberTester(value, scheme.min)) {
								result = new EjvError(
									ErrorType.GREATER_THAN_OR_EQUAL,
									ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.min),
									_options.path,
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
										ErrorType.SMALLER_THAN,
										ErrorMsg.SMALLER_THAN.replace(ErrorMsgCursorA, '' + scheme.max),
										_options.path,
										value
									);
									break;
								}
							} else {
								if (!maxNumberTester(value, scheme.max)) {
									result = new EjvError(
										ErrorType.SMALLER_THAN_OR_EQUAL,
										ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.max),
										_options.path,
										value
									);
									break;
								}
							}
						} else {
							if (!maxNumberTester(value, scheme.max)) {
								result = new EjvError(
									ErrorType.SMALLER_THAN_OR_EQUAL,
									ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.max),
									_options.path,
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
									ErrorType.FORMAT,
									ErrorMsg.FORMAT.replace(ErrorMsgCursorA, scheme.format as NumberFormat),
									_options.path,
									value
								);
							} else {
								result = new EjvError(
									ErrorType.FORMAT_ONE_OF,
									ErrorMsg.FORMAT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.format)),
									_options.path,
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
								ErrorType.ONE_OF,
								ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.enum)),
								_options.path,
								value
							);
							break;
						}
					}

					if (definedTester(scheme.minLength)) {
						if (!(numberTester(scheme.minLength) && integerTester(scheme.minLength))) {
							throw new Error(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
						}

						if (!minLengthTester(value, scheme.minLength)) {
							result = new EjvError(
								ErrorType.MIN_LENGTH,
								ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + scheme.minLength),
								_options.path,
								value
							);
							break;
						}
					}

					if (definedTester(scheme.maxLength)) {
						if (!(numberTester(scheme.maxLength) && integerTester(scheme.maxLength))) {
							throw new Error(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
						}

						if (!maxLengthTester(value, scheme.maxLength)) {
							result = new EjvError(
								ErrorType.MAX_LENGTH,
								ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + scheme.maxLength),
								_options.path,
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
									ErrorType.FORMAT,
									ErrorMsg.FORMAT.replace(ErrorMsgCursorA, scheme.format as StringFormat),
									_options.path,
									value
								);
							} else {
								result = new EjvError(
									ErrorType.FORMAT_ONE_OF,
									ErrorMsg.FORMAT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.format)),
									_options.path,
									value
								);
							}
							break;
						}
					}

					if (definedTester(scheme.pattern)) {
						// check parameter
						if (scheme.pattern === null) {
							throw new Error(ErrorMsg.INVALID_STRING_PATTERN
								.replace(ErrorMsgCursorA, 'null'));
						}

						const isValidPattern = (pattern : string | RegExp) : boolean => {
							return (stringTester(pattern) && minLengthTester(pattern, 1))
								|| (regExpTester(pattern) && pattern.toString() !== '/(?:)/' && pattern.toString() !== '/null/');
						};

						const patternToString = (pattern : string | RegExp) : string => {
							let regExpStr : string;

							if (pattern === null) {
								regExpStr = '/null/';
							} else if (stringTester(pattern)) {
								if (minLengthTester(pattern, 1)) {
									regExpStr = new RegExp(pattern as string).toString();
								} else {
									regExpStr = '//';
								}
							} else {
								regExpStr = pattern.toString();
							}

							// empty regular expression
							if (regExpStr === '/(?:)/') {
								regExpStr = '//';
							}

							return regExpStr;
						};

						const createArrayErrorMsg = (patternsAsArray : (string | RegExp)[]) : string => {
							return '[' + patternsAsArray.map(onePattern => {
								return patternToString(onePattern);
							}).join(', ') + ']';
						};

						if (arrayTester(scheme.pattern)) {
							const patternsAsArray : (string | RegExp)[] = scheme.pattern as (string | RegExp)[];

							if (!minLengthTester(patternsAsArray, 1)) { // empty array
								throw new Error(ErrorMsg.INVALID_STRING_PATTERN
									.replace(ErrorMsgCursorA, createArrayErrorMsg(patternsAsArray)));
							}

							const regExpPatterns : RegExp[] = patternsAsArray.map(pattern => {
								if (!isValidPattern(pattern)) {
									throw new Error(ErrorMsg.INVALID_STRING_PATTERN
										.replace(ErrorMsgCursorA, createArrayErrorMsg(patternsAsArray)));
								}

								return new RegExp(pattern);
							}) as RegExp[];

							// check value
							if (!regExpPatterns.some((regexp : RegExp) => {
								return stringRegExpTester(value, regexp);
							})) {
								result = new EjvError(
									ErrorType.PATTERN_ONE_OF,
									ErrorMsg.PATTERN_ONE_OF
										.replace(ErrorMsgCursorA, createArrayErrorMsg(patternsAsArray)),
									_options.path,
									value
								);
							}

						} else {
							const patternAsOne : string | RegExp = scheme.pattern as string | RegExp;

							if (!isValidPattern(patternAsOne)) {
								throw new Error(ErrorMsg.INVALID_STRING_PATTERN
									.replace(ErrorMsgCursorA, patternToString(patternAsOne)));
							}

							// check value
							const regExp : RegExp = new RegExp(patternAsOne);

							if (!stringRegExpTester(value, regExp)) {
								result = new EjvError(
									ErrorType.PATTERN,
									ErrorMsg.PATTERN.replace(ErrorMsgCursorA, patternToString(patternAsOne)),
									_options.path,
									value
								);
							}
						}
					}
					break;

				case DataType.OBJECT:
					if (definedTester(scheme.allowNoProperty)) {
						if (!booleanTester(scheme.allowNoProperty)) {
							throw new Error(ErrorMsg.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN);
						}

						if (scheme.allowNoProperty !== true && !hasPropertyTester(value)) {
							result = new EjvError(
								ErrorType.NO_PROPERTY,
								ErrorMsg.NO_PROPERTY,
								_options.path,
								value
							);
							break;
						}
					}

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

						if (!objectTester(value) || value === null) {
							result = new EjvError(
								ErrorType.TYPE_MISMATCH,
								ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, 'object'),
								_options.path,
								value
							);
							break;
						}

						const partialData : object = data[key];
						const partialScheme : Scheme[] = scheme.properties;

						// call recursively
						result = _ejv(partialData, partialScheme, _options);
					}
					break;

				case DataType.DATE:
					if (definedTester(scheme.min)) {
						if (!(
							(stringTester(scheme.min) && (dateFormatTester(scheme.min) || dateTimeFormatTester(scheme.min)))
							|| dateTester(scheme.min)
						)) {
							throw new Error(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING);
						}

						if (definedTester(scheme.exclusiveMin) && !booleanTester(scheme.exclusiveMin)) {
							throw new Error(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
						}

						const minDate : Date = new Date(scheme.min);

						if (scheme.exclusiveMin !== true) {
							if (!minDateTester(value, minDate)) {
								result = new EjvError(
									ErrorType.AFTER_OR_SAME_DATE,
									ErrorMsg.AFTER_OR_SAME_DATE.replace(ErrorMsgCursorA, minDate.toISOString()),
									_options.path,
									value
								);
								break;
							}

						} else {
							if (!exclusiveMinDateTester(value, minDate)) {
								result = new EjvError(
									ErrorType.AFTER_DATE,
									ErrorMsg.AFTER_DATE.replace(ErrorMsgCursorA, minDate.toISOString()),
									_options.path,
									value
								);
								break;
							}
						}
					}

					if (definedTester(scheme.max)) {
						if (!(
							(stringTester(scheme.max) && (dateFormatTester(scheme.max) || dateTimeFormatTester(scheme.max)))
							|| dateTester(scheme.max)
						)) {
							throw new Error(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING);
						}

						if (definedTester(scheme.exclusiveMax) && !booleanTester(scheme.exclusiveMax)) {
							throw new Error(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
						}

						const maxDate : Date = new Date(scheme.max);

						if (scheme.exclusiveMax !== true) {
							if (!maxDateTester(value, maxDate)) {
								result = new EjvError(
									ErrorType.BEFORE_OR_SAME_DATE,
									ErrorMsg.BEFORE_OR_SAME_DATE.replace(ErrorMsgCursorA, maxDate.toISOString()),
									_options.path,
									value
								);
								break;
							}

						} else {
							if (!exclusiveMaxDateTester(value, maxDate)) {
								result = new EjvError(
									ErrorType.BEFORE_DATE,
									ErrorMsg.BEFORE_DATE.replace(ErrorMsgCursorA, maxDate.toISOString()),
									_options.path,
									value
								);
								break;
							}
						}
					}
					break;

				case DataType.ARRAY:
					if (definedTester(scheme.minLength)) {
						if (!(numberTester(scheme.minLength) && integerTester(scheme.minLength))) {
							throw new Error(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
						}

						if (!minLengthTester(value, scheme.minLength)) {
							result = new EjvError(
								ErrorType.MIN_LENGTH,
								ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + scheme.minLength),
								_options.path,
								value
							);
						}
					}

					if (definedTester(scheme.maxLength)) {
						if (!(numberTester(scheme.maxLength) && integerTester(scheme.maxLength))) {
							throw new Error(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
						}

						if (!maxLengthTester(value, scheme.maxLength)) {
							result = new EjvError(
								ErrorType.MAX_LENGTH,
								ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + scheme.maxLength),
								_options.path,
								value
							);
						}
					}

					if (definedTester(scheme.unique)) {
						if (!booleanTester(scheme.unique)) {
							throw new Error(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN);
						}

						if (scheme.unique === true && !uniqueItemsTester(value)) {
							result = new EjvError(
								ErrorType.UNIQUE_ITEMS,
								ErrorMsg.UNIQUE_ITEMS,
								_options.path,
								value
							);
						}
					}

					if (definedTester(scheme.items)) {
						// convert array to object
						const valueAsArray : any[] = value as any[];

						if (valueAsArray.length > 0) {
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
								const partialResult : EjvError = _ejv(partialData, partialSchemes, _options);

								// convert new EjvError
								if (!!partialResult) {
									let errorMsg : string;

									if (arrayTester(scheme.items)) {
										errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, JSON.stringify(itemTypes));
									} else {
										errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, scheme.items as string);
									}

									result = new EjvError(
										ErrorType.ITEMS_TYPE,
										errorMsg,
										_options.path,
										value
									);
								}
								break;
							} else if ((objectTester(scheme.items) && scheme.items !== null) // by Scheme
								|| (arrayTester(scheme.items) && arrayTypeOfTester(scheme.items, DataType.OBJECT)) // by Scheme[]
							) {
								let itemsAsSchemes : Scheme[] = [];

								if (arrayTester(scheme.items)) {
									itemsAsSchemes = scheme.items as Scheme[];
								} else {
									itemsAsSchemes = [scheme.items] as Scheme[];
								}

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
										const newScheme : Scheme = clone(oneScheme); // divide instance

										newScheme.key = tempKeyForThisValue;

										return newScheme;
									}));

									const partialResult : EjvError[] = partialSchemes.map((partialScheme : Scheme) => {
										// call recursively
										return _ejv(partialData, [partialScheme], _options);
									});

									if (!partialResult.some(oneResult => oneResult === null)) {
										partialValid = false;
										break;
									}
								}

								if (partialValid === false) {
									let errorKey : ErrorType;
									let errorMsg : string;

									if (arrayTester(scheme.items)) {
										errorKey = ErrorType.ITEMS_SCHEMES;
										errorMsg = ErrorMsg.ITEMS_SCHEMES.replace(ErrorMsgCursorA, JSON.stringify(itemsAsSchemes));
									} else {
										errorKey = ErrorType.ITEMS_SCHEME;
										errorMsg = ErrorMsg.ITEMS_SCHEME.replace(ErrorMsgCursorA, JSON.stringify(scheme.items));
									}

									result = new EjvError(
										errorKey,
										errorMsg,
										_options.path,
										value
									);
									break;
								}
							} else {
								throw new Error(ErrorMsg.INVALID_ITEMS_SCHEME.replace(ErrorMsgCursorA, JSON.stringify(scheme.items)));
							}
						}
					}
					break;
			}
		} else if (scheme.optional !== true) {
			result = new EjvError(
				ErrorType.REQUIRED,
				ErrorMsg.REQUIRED,
				_options.path,
				data[key]
			);
			break;
		}
	}

	if (definedTester(result) && definedTester(options.customErrorMsg)) {
		// override error message
		const customMsg : string = options.customErrorMsg[result.type];

		if (definedTester(customMsg)) {
			result.message = customMsg;
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

	return _ejv(data, schemes, options);
};
