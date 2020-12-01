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
	lengthTester,
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


interface AnyObject {
	[key : string] : any;
}


const _ejv = <T>(data : T, schemes : Scheme[], options : InternalOptions = {
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
	let result : EjvError | null = null;

	// use for() instead of forEach() to stop
	const schemeLength : number = schemes.length;

	for (let i = 0; i < schemeLength; i++) {
		const _options : InternalOptions = clone(options); // divide instance

		if (!definedTester(_options.path)) {
			_options.path = [];
		}

		const scheme : Scheme = schemes[i];
		const key : keyof T = scheme.key as keyof T;

		let value : any;

		if (!!key) {
			value = data[key];

			_options.path.push(key as string);
		}

		let types : DataType[];

		if (!definedTester(scheme.type)) {
			throw new Error(ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE);
		}

		if (!arrayTester(scheme.type)) {
			types = [scheme.type as DataType];
		} else {
			types = scheme.type as DataType[];
		}

		const allDataType : DataType[] = Object.values(DataType);


		const errorType : string | undefined = types.find(type => {
			return !(stringTester(type) && enumTester(type, allDataType));
		});

		if (!!errorType) {
			throw new Error(ErrorMsg.SCHEMES_HAS_INVALID_TYPE.replace(ErrorMsgCursorA, errorType));
		}

		if (!uniqueItemsTester(types)) {
			throw new Error(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE);
		}

		if (!definedTester(value)) {
			if (scheme.optional !== true) {
				result = new EjvError(
					ErrorType.REQUIRED,
					ErrorMsg.REQUIRED,
					_options.path,
					data,
					value
				);
				break;
			} else {
				continue;
			}
		}

		if (value === null) {
			if (scheme.nullable !== true) {
				result = new EjvError(
					ErrorType.REQUIRED,
					ErrorMsg.REQUIRED,
					_options.path,
					data,
					value
				);
				break;
			} else {
				continue;
			}
		}

		const typeResolved : DataType | undefined = types.find(type => {
			return typeTester(value, type);
		});

		if (!typeResolved) {
			if (!arrayTester(scheme.type)) {
				result = new EjvError(
					ErrorType.TYPE_MISMATCH,
					ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, scheme.type as DataType),
					_options.path,
					data,
					value
				);
			} else {
				result = new EjvError(
					ErrorType.TYPE_MISMATCH_ONE_OF,
					ErrorMsg.TYPE_MISMATCH_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.type)),
					_options.path,
					data,
					value
				);
			}
			break;
		}

		// additional check for type resolved
		switch (typeResolved) {
			case DataType.NUMBER:
				const valueAsNumber : number = value as unknown as number;

				if (definedTester(scheme.enum)) {
					if (!arrayTester(scheme.enum)) {
						throw new Error(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
					}

					const enumArr : number[] = scheme.enum as number[];

					if (!arrayTypeOfTester(enumArr, DataType.NUMBER)) {
						throw new Error(ErrorMsg.ENUM_SHOULD_BE_NUMBERS);
					}

					if (!enumTester(valueAsNumber, enumArr)) {
						result = new EjvError(
							ErrorType.ONE_OF,
							ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(enumArr)),
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.enumReverse)) {
					const enumReverseArr : number[] = scheme.enumReverse as number[];

					if (!arrayTester(enumReverseArr)) {
						throw new Error(ErrorMsg.ENUM_REVERSE_SHOULD_BE_ARRAY);
					}

					if (!arrayTypeOfTester(enumReverseArr, DataType.NUMBER)) {
						throw new Error(ErrorMsg.ENUM_REVERSE_SHOULD_BE_NUMBERS);
					}

					if (enumTester(valueAsNumber, enumReverseArr)) {
						result = new EjvError(
							ErrorType.NOT_ONE_OF,
							ErrorMsg.NOT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(enumReverseArr)),
							_options.path,
							data,
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
							if (!exclusiveMinNumberTester(valueAsNumber, scheme.min as number)) {
								result = new EjvError(
									ErrorType.GREATER_THAN,
									ErrorMsg.GREATER_THAN.replace(ErrorMsgCursorA, '' + scheme.min),
									_options.path,
									data,
									value
								);
								break;
							}
						} else {
							if (!minNumberTester(valueAsNumber, scheme.min as number)) {
								result = new EjvError(
									ErrorType.GREATER_THAN_OR_EQUAL,
									ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.min),
									_options.path,
									data,
									value
								);
								break;
							}
						}
					} else {
						if (!minNumberTester(valueAsNumber, scheme.min as number)) {
							result = new EjvError(
								ErrorType.GREATER_THAN_OR_EQUAL,
								ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.min),
								_options.path,
								data,
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
							if (!exclusiveMaxNumberTester(valueAsNumber, scheme.max as number)) {
								result = new EjvError(
									ErrorType.SMALLER_THAN,
									ErrorMsg.SMALLER_THAN.replace(ErrorMsgCursorA, '' + scheme.max),
									_options.path,
									data,
									value
								);
								break;
							}
						} else {
							if (!maxNumberTester(valueAsNumber, scheme.max as number)) {
								result = new EjvError(
									ErrorType.SMALLER_THAN_OR_EQUAL,
									ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.max),
									_options.path,
									data,
									value
								);
								break;
							}
						}
					} else {
						if (!maxNumberTester(valueAsNumber, scheme.max as number)) {
							result = new EjvError(
								ErrorType.SMALLER_THAN_OR_EQUAL,
								ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + scheme.max),
								_options.path,
								data,
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

						const errorFormat : string | undefined = formatAsArray.find(format => {
							return !enumTester(format, allNumberFormat);
						});

						if (!!errorFormat) {
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
								data,
								value
							);
						} else {
							result = new EjvError(
								ErrorType.FORMAT_ONE_OF,
								ErrorMsg.FORMAT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.format)),
								_options.path,
								data,
								value
							);
						}
						break;
					}
				}
				break;

			case DataType.STRING:
				const valueAsString : string = value as unknown as string;

				if (definedTester(scheme.enum)) {
					if (!arrayTester(scheme.enum)) {
						throw new Error(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
					}

					const enumArr : string[] = scheme.enum as string[];

					if (!arrayTypeOfTester(enumArr, DataType.STRING)) {
						throw new Error(ErrorMsg.ENUM_SHOULD_BE_STRINGS);
					}

					if (!enumTester(valueAsString, enumArr)) {
						result = new EjvError(
							ErrorType.ONE_OF,
							ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.enum)),
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.enumReverse)) {
					if (!arrayTester(scheme.enumReverse)) {
						throw new Error(ErrorMsg.ENUM_REVERSE_SHOULD_BE_ARRAY);
					}

					const enumReverseArr : string[] = scheme.enumReverse as string[];

					if (!arrayTypeOfTester(enumReverseArr, DataType.STRING)) {
						throw new Error(ErrorMsg.ENUM_REVERSE_SHOULD_BE_STRINGS);
					}

					if (enumTester(valueAsString, enumReverseArr)) {
						result = new EjvError(
							ErrorType.NOT_ONE_OF,
							ErrorMsg.NOT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(enumReverseArr)),
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.length)) {
					const length : number = scheme.length as number;

					if (!(numberTester(length) && integerTester(length))) {
						throw new Error(ErrorMsg.LENGTH_SHOULD_BE_INTEGER);
					}

					if (!lengthTester(valueAsString, length)) {
						result = new EjvError(
							ErrorType.LENGTH,
							ErrorMsg.LENGTH.replace(ErrorMsgCursorA, '' + length),
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.minLength)) {
					const minLength : number = scheme.minLength as number;

					if (!(numberTester(minLength) && integerTester(minLength))) {
						throw new Error(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
					}

					if (!minLengthTester(valueAsString, minLength)) {
						result = new EjvError(
							ErrorType.MIN_LENGTH,
							ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + minLength),
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.maxLength)) {
					const maxLength : number = scheme.maxLength as number;

					if (!(numberTester(maxLength) && integerTester(maxLength))) {
						throw new Error(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
					}

					if (!maxLengthTester(valueAsString, maxLength)) {
						result = new EjvError(
							ErrorType.MAX_LENGTH,
							ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + maxLength),
							_options.path,
							data,
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
						const errorFormat : string | undefined = formatAsArray.find(format => {
							return !enumTester(format, allStringFormat);
						});

						if (!!errorFormat) {
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
								data,
								value
							);
						} else {
							result = new EjvError(
								ErrorType.FORMAT_ONE_OF,
								ErrorMsg.FORMAT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.format)),
								_options.path,
								data,
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
						return (stringTester(pattern) && minLengthTester(pattern as string, 1))
							|| (regExpTester(pattern) && pattern.toString() !== '/(?:)/' && pattern.toString() !== '/null/');
					};

					const patternToString = (pattern : string | RegExp) : string => {
						let regExpStr : string;

						if (pattern === null) {
							regExpStr = '/null/';
						} else if (stringTester(pattern)) {
							if (minLengthTester(pattern as string, 1)) {
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
								data,
								value
							);
							break;
						}

					} else {
						const patternAsOne : string | RegExp = scheme.pattern as string | RegExp;

						if (!isValidPattern(patternAsOne)) {
							throw new Error(ErrorMsg.INVALID_STRING_PATTERN
								.replace(ErrorMsgCursorA, patternToString(patternAsOne)));
						}

						// check value
						const regExp : RegExp = new RegExp(patternAsOne);

						if (!stringRegExpTester(valueAsString, regExp)) {
							result = new EjvError(
								ErrorType.PATTERN,
								ErrorMsg.PATTERN.replace(ErrorMsgCursorA, patternToString(patternAsOne)),
								_options.path,
								data,
								value
							);
							break;
						}
					}
				}
				break;

			case DataType.OBJECT:
				const valueAsObject = value as unknown as { [key : string] : any };

				if (definedTester(scheme.allowNoProperty)) {
					if (!booleanTester(scheme.allowNoProperty)) {
						throw new Error(ErrorMsg.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN);
					}

					if (scheme.allowNoProperty !== true && !hasPropertyTester(valueAsObject)) {
						result = new EjvError(
							ErrorType.NO_PROPERTY,
							ErrorMsg.NO_PROPERTY,
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.properties)) {
					if (!arrayTester(scheme.properties)) {
						throw new Error(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY);
					}

					const properties : Scheme[] = scheme.properties as Scheme[];

					if (!minLengthTester(properties, 1)) {
						throw new Error(ErrorMsg.PROPERTIES_SHOULD_HAVE_ITEMS);
					}

					if (!arrayTypeOfTester(properties, DataType.OBJECT)) {
						throw new Error(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT);
					}

					if (!objectTester(value)) {
						result = new EjvError(
							ErrorType.TYPE_MISMATCH,
							ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, 'object'),
							_options.path,
							data,
							value
						);
						break;
					}

					const partialData : T[keyof T] = data[key];
					const partialScheme : Scheme[] = scheme.properties as Scheme[];

					// call recursively
					result = _ejv(partialData, partialScheme, _options);

					if (!!result) {
						// inject original data
						result.data = data;
					}
				}
				break;

			case DataType.DATE:
				const valueAsDate : Date = value as unknown as Date;

				if (definedTester(scheme.min)) {
					if (!(
						(stringTester(scheme.min) && (dateFormatTester(scheme.min as string) || dateTimeFormatTester(scheme.min as string)))
						|| dateTester(scheme.min)
					)) {
						throw new Error(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING);
					}

					if (definedTester(scheme.exclusiveMin) && !booleanTester(scheme.exclusiveMin)) {
						throw new Error(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
					}

					let minDate : Date = new Date(scheme.min as string | Date);

					// adjust timezone
					if (stringTester(scheme.min)) {
						// by minutes
						const timezoneOffset : number = minDate.getTimezoneOffset();

						minDate = new Date(+minDate + (timezoneOffset * 60 * 1000));
					}

					if (scheme.exclusiveMin !== true) {
						if (!minDateTester(valueAsDate, minDate)) {
							result = new EjvError(
								ErrorType.AFTER_OR_SAME_DATE,
								ErrorMsg.AFTER_OR_SAME_DATE.replace(ErrorMsgCursorA, minDate.toISOString()),
								_options.path,
								data,
								value
							);
							break;
						}

					} else {
						if (!exclusiveMinDateTester(valueAsDate, minDate)) {
							result = new EjvError(
								ErrorType.AFTER_DATE,
								ErrorMsg.AFTER_DATE.replace(ErrorMsgCursorA, minDate.toISOString()),
								_options.path,
								data,
								value
							);
							break;
						}
					}
				}

				if (definedTester(scheme.max)) {
					if (!(
						(stringTester(scheme.max) && (dateFormatTester(scheme.max as string) || dateTimeFormatTester(scheme.max as string)))
						|| dateTester(scheme.max)
					)) {
						throw new Error(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING);
					}

					if (definedTester(scheme.exclusiveMax) && !booleanTester(scheme.exclusiveMax)) {
						throw new Error(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
					}

					let maxDate : Date = new Date(scheme.max as string | Date);

					// adjust timezone
					if (stringTester(scheme.max)) {
						// by minutes
						const timezoneOffset : number = maxDate.getTimezoneOffset();

						maxDate = new Date(+maxDate + (timezoneOffset * 60 * 1000));
					}

					if (scheme.exclusiveMax !== true) {
						if (!maxDateTester(valueAsDate, maxDate)) {
							result = new EjvError(
								ErrorType.BEFORE_OR_SAME_DATE,
								ErrorMsg.BEFORE_OR_SAME_DATE.replace(ErrorMsgCursorA, maxDate.toISOString()),
								_options.path,
								data,
								value
							);
							break;
						}

					} else {
						if (!exclusiveMaxDateTester(valueAsDate, maxDate)) {
							result = new EjvError(
								ErrorType.BEFORE_DATE,
								ErrorMsg.BEFORE_DATE.replace(ErrorMsgCursorA, maxDate.toISOString()),
								_options.path,
								data,
								value
							);
							break;
						}
					}
				}
				break;

			case DataType.ARRAY:
				const valueAsArray : any[] = value as unknown as any[];

				if (definedTester(scheme.length)) {
					const length : number = scheme.length as number;

					if (!(numberTester(length) && integerTester(length))) {
						throw new Error(ErrorMsg.LENGTH_SHOULD_BE_INTEGER);
					}

					if (!lengthTester(valueAsArray, length)) {
						result = new EjvError(
							ErrorType.LENGTH,
							ErrorMsg.LENGTH.replace(ErrorMsgCursorA, '' + length),
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.minLength)) {
					const minLength : number = scheme.minLength as number;

					if (!(numberTester(scheme.minLength) && integerTester(minLength))) {
						throw new Error(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
					}

					if (!minLengthTester(valueAsArray, minLength)) {
						result = new EjvError(
							ErrorType.MIN_LENGTH,
							ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + minLength),
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.maxLength)) {
					const maxLength : number = scheme.maxLength as number;

					if (!(numberTester(scheme.maxLength) && integerTester(maxLength))) {
						throw new Error(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
					}

					if (!maxLengthTester(valueAsArray, maxLength)) {
						result = new EjvError(
							ErrorType.MAX_LENGTH,
							ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + maxLength),
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.unique)) {
					if (!booleanTester(scheme.unique)) {
						throw new Error(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN);
					}

					if (scheme.unique === true && !uniqueItemsTester(valueAsArray)) {
						result = new EjvError(
							ErrorType.UNIQUE_ITEMS,
							ErrorMsg.UNIQUE_ITEMS,
							_options.path,
							data,
							value
						);
						break;
					}
				}

				if (definedTester(scheme.items)) {
					// convert array to object
					if (valueAsArray.length > 0) {
						const now : Date = new Date;
						const tempKeyArr : string[] = valueAsArray.map((value : any, i : number) => {
							return '' + (+now + i);
						});

						if (stringTester(scheme.items) // by DataType
							|| (arrayTester(scheme.items) && arrayTypeOfTester(scheme.items as DataType[], DataType.STRING)) // by DataType[]
						) {
							const itemTypes : DataType[] = (arrayTester(scheme.items) ? scheme.items : [scheme.items]) as DataType[];

							const partialData : AnyObject = {};
							const partialSchemes : Scheme[] = [];

							tempKeyArr.forEach((tempKey : string, i : number) => {
								partialData[tempKey] = valueAsArray[i];
								partialSchemes.push({
									key : tempKey,
									type : itemTypes
								});
							});

							// call recursively
							const partialResult : EjvError | null = _ejv(partialData, partialSchemes, _options);

							// convert new EjvError
							if (!!partialResult) {
								let errorMsg : string;

								if (arrayTester(scheme.items)) {
									errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, JSON.stringify(itemTypes));
								} else {
									errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, scheme.items as string);
								}

								const partialKeys : string[] = partialResult.path.split('/');
								const partialKey : string = partialKeys[partialKeys.length - 1];

								const partialScheme : Scheme = partialSchemes.find(scheme => {
									return scheme.key === partialKey;
								}) as Scheme;

								const partialKeyIndex : number = partialSchemes.indexOf(partialScheme);

								result = new EjvError(
									ErrorType.ITEMS_TYPE,
									errorMsg,
									[..._options.path, '' + partialKeyIndex],
									data,
									partialData[partialKey]
								);
							}
							break;
						} else if ((objectTester(scheme.items) && scheme.items !== null) // by Scheme
							|| (arrayTester(scheme.items) && arrayTypeOfTester(scheme.items as Scheme[], DataType.OBJECT)) // by Scheme[]
						) {
							const itemsAsSchemes : Scheme[] = (arrayTester(scheme.items) ? scheme.items : [scheme.items]) as Scheme[];

							let partialError : EjvError | null | undefined = null;

							// use for() instead of forEach() to break
							const valueLength : number = valueAsArray.length;

							for (let arrIndex = 0; arrIndex < valueLength; arrIndex++) {
								const oneValue : any = valueAsArray[arrIndex];

								const partialData : AnyObject = {};
								const partialSchemes : Scheme[] = [];

								const tempKeyForThisValue : string = tempKeyArr[arrIndex];

								partialData[tempKeyForThisValue] = oneValue;

								partialSchemes.push(...itemsAsSchemes.map((oneScheme : Scheme) => {
									const newScheme : Scheme = clone(oneScheme); // divide instance

									newScheme.key = tempKeyForThisValue;

									return newScheme;
								}));

								const partialResults : (EjvError | null)[] = partialSchemes.map((partialScheme : Scheme) => {
									// call recursively
									const partialResult : EjvError | null = _ejv(partialData, [partialScheme], _options);

									if (!!partialResult) {
										partialResult.path = partialResult.path.replace(tempKeyForThisValue, '' + arrIndex);
									}

									return partialResult;
								});

								if (!partialResults.some(oneResult => oneResult === null)) {
									partialError = partialResults.find(oneResult => {
										return !!oneResult;
									});
									break;
								}
							}

							if (!!partialError) {
								let errorType : ErrorType;
								let errorMsg : string;

								if (!!itemsAsSchemes && itemsAsSchemes.length > 1) {
									errorType = ErrorType.ITEMS_SCHEMES;
									errorMsg = ErrorMsg.ITEMS_SCHEMES.replace(ErrorMsgCursorA, JSON.stringify(itemsAsSchemes));
								} else {
									errorType = partialError.type;
									errorMsg = partialError.message;

									if (errorType === ErrorType.REQUIRED) {
										// REQUIRED in array is TYPE_MISMATCH except with nullable === true
										errorType = ErrorType.TYPE_MISMATCH;
										errorMsg = ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, JSON.stringify(scheme.items));
									}
								}

								result = new EjvError(
									errorType,
									errorMsg,
									partialError.path.split('/'),
									data,
									partialError.errorData
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

		if (!!result) {
			break;
		}
	}

	if (definedTester(result) && definedTester(options.customErrorMsg)) {
		const resultAsNotNull : EjvError = result as NonNullable<EjvError>;
		const customErrorMsgObj : {
			[key in ErrorType]? : string;
		} = options.customErrorMsg as {
			[key in ErrorType]? : string;
		};

		// override error message
		const customMsg : string = customErrorMsgObj[resultAsNotNull.type] as string;

		if (definedTester(customMsg)) {
			resultAsNotNull.message = customMsg;
		}
	}

	return result;
};

export const ejv = (data : object, schemes : Scheme[], options? : Options) : null | EjvError => {
	// check data itself
	if (!definedTester(data) || !objectTester(data) || data === null) {
		return new EjvError(ErrorType.REQUIRED, ErrorMsg.NO_DATA, ['/'], data, undefined);
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

	return _ejv(data, schemes, options as InternalOptions);
};
