import {
	AnyObject,
	ArrayScheme,
	DateScheme,
	EjvError,
	InternalOptions,
	NumberScheme,
	ObjectScheme,
	Options,
	Scheme,
	StringScheme
} from './interfaces';
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


const _ejv = <T> (data: T, schemes: Scheme[], options: InternalOptions): null | EjvError => {
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
	let result: EjvError | null = null;

	// use for() instead of forEach() to stop
	for (const scheme of schemes) {
		const key: keyof T = scheme.key as keyof T;

		const _options: InternalOptions = clone(options); // divide instance

		let value: unknown;

		if (key) {
			value = data[key];

			_options.path.push(key as string);
		}


		// if use not, type can be omitted
		if (!definedTester(scheme.not)) {
			// without not
			if (!definedTester(scheme.type)) {
				throw new Error(ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE);
			}

			let types: DataType[];

			if (!arrayTester(scheme.type)) {
				types = [scheme.type as DataType];
			}
			else {
				types = scheme.type as DataType[];
			}

			const allDataType: DataType[] = Object.values(DataType);

			const typeError: string | undefined = types.find(type => {
				return !definedTester(type)
					|| !stringTester(type)
					|| !enumTester(type, allDataType);
			});

			if (typeError) {
				throw new Error(ErrorMsg.SCHEMES_HAS_INVALID_TYPE.replace(ErrorMsgCursorA, typeError));
			}

			if (!uniqueItemsTester(types)) {
				throw new Error(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE);
			}

			if (!definedTester(value)) {
				if (scheme.optional !== true) {
					result = new EjvError({
						type: ErrorType.REQUIRED,
						message: ErrorMsg.REQUIRED,

						data,
						path: _options.path,

						errorScheme: scheme,
						errorData: value
					});
					break;
				}
				else {
					continue;
				}
			}

			if (value === null) {
				if (scheme.nullable !== true) {
					result = new EjvError({
						type: ErrorType.REQUIRED,
						message: ErrorMsg.REQUIRED,

						data,
						path: _options.path,

						errorScheme: scheme,
						errorData: value
					});
					break;
				}
				else {
					continue;
				}
			}


			const typeResolved: DataType | undefined = types.find(type => {
				return typeTester(value, type);
			});

			const hasAdditionalRule: boolean = Object.keys(scheme).some((key: string) => {
				const _key: keyof Scheme = key as keyof Scheme;

				return _key !== 'key'
					&& _key !== 'type';
			});

			if (
				(_options.positiveTrue && !typeResolved)
				|| (!_options.positiveTrue && typeResolved && !hasAdditionalRule)
			) {
				if (!arrayTester(scheme.type)) {
					result = new EjvError({
						type: ErrorType.TYPE_MISMATCH,
						message: ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, scheme.type as DataType),

						data,
						path: _options.path,

						errorScheme: scheme,
						errorData: value
					});
				}
				else {
					result = new EjvError({
						type: ErrorType.TYPE_MISMATCH_ONE_OF,
						message: ErrorMsg.TYPE_MISMATCH_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(scheme.type)),

						data,
						path: _options.path,

						errorScheme: scheme,
						errorData: value
					});
				}

				break;
			}

			// additional check for type resolved
			switch (typeResolved) {
				case DataType.NUMBER: {
					const valueAsNumber: number = value as unknown as number;
					const numberScheme: NumberScheme = scheme as NumberScheme;

					if (definedTester(numberScheme.enum)) {
						if (!arrayTester(numberScheme.enum)) {
							throw new Error(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
						}

						const enumArr: number[] = numberScheme.enum;

						if (!arrayTypeOfTester(enumArr, DataType.NUMBER)) {
							throw new Error(ErrorMsg.ENUM_SHOULD_BE_NUMBERS);
						}

						if (!enumTester(valueAsNumber, enumArr)) {
							result = new EjvError({
								type: ErrorType.ONE_OF,
								message: ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(enumArr)),

								data,
								path: _options.path,

								errorScheme: numberScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(numberScheme.enumReverse)) {
						const enumReverseArr: number[] = numberScheme.enumReverse;

						if (!arrayTester(enumReverseArr)) {
							throw new Error(ErrorMsg.ENUM_REVERSE_SHOULD_BE_ARRAY);
						}

						if (!arrayTypeOfTester(enumReverseArr, DataType.NUMBER)) {
							throw new Error(ErrorMsg.ENUM_REVERSE_SHOULD_BE_NUMBERS);
						}

						if (enumTester(valueAsNumber, enumReverseArr)) {
							result = new EjvError({
								type: ErrorType.NOT_ONE_OF,
								message: ErrorMsg.NOT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(enumReverseArr)),

								data,
								path: _options.path,

								errorScheme: numberScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(numberScheme.min)) {
						if (!numberTester(numberScheme.min)) {
							throw new Error(ErrorMsg.MIN_SHOULD_BE_NUMBER);
						}

						if (definedTester(numberScheme.exclusiveMin)) {
							if (!booleanTester(numberScheme.exclusiveMin)) {
								throw new Error(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
							}

							if (numberScheme.exclusiveMin) {
								if (!exclusiveMinNumberTester(valueAsNumber, numberScheme.min)) {
									result = new EjvError({
										type: ErrorType.GREATER_THAN,
										message: ErrorMsg.GREATER_THAN.replace(ErrorMsgCursorA, '' + numberScheme.min),

										data,
										path: _options.path,

										errorScheme: numberScheme,
										errorData: value
									});
									break;
								}
							}
							else {
								if (!minNumberTester(valueAsNumber, numberScheme.min)) {
									result = new EjvError({
										type: ErrorType.GREATER_THAN_OR_EQUAL,
										message: ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + numberScheme.min),

										data,
										path: _options.path,

										errorScheme: numberScheme,
										errorData: value
									});
									break;
								}
							}
						}
						else {
							if (!minNumberTester(valueAsNumber, numberScheme.min)) {
								result = new EjvError({
									type: ErrorType.GREATER_THAN_OR_EQUAL,
									message: ErrorMsg.GREATER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + numberScheme.min),

									data,
									path: _options.path,

									errorScheme: numberScheme,
									errorData: value
								});
								break;
							}
						}
					}

					if (definedTester(numberScheme.max)) {
						if (!numberTester(numberScheme.max)) {
							throw new Error(ErrorMsg.MAX_SHOULD_BE_NUMBER);
						}

						if (definedTester(numberScheme.exclusiveMax)) {
							if (!booleanTester(numberScheme.exclusiveMax)) {
								throw new Error(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
							}

							if (numberScheme.exclusiveMax) {
								if (!exclusiveMaxNumberTester(valueAsNumber, numberScheme.max)) {
									result = new EjvError({
										type: ErrorType.SMALLER_THAN,
										message: ErrorMsg.SMALLER_THAN.replace(ErrorMsgCursorA, '' + numberScheme.max),

										data,
										path: _options.path,

										errorScheme: numberScheme,
										errorData: value
									});
									break;
								}
							}
							else {
								if (!maxNumberTester(valueAsNumber, numberScheme.max)) {
									result = new EjvError({
										type: ErrorType.SMALLER_THAN_OR_EQUAL,
										message: ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + numberScheme.max),

										data,
										path: _options.path,

										errorScheme: numberScheme,
										errorData: value
									});
									break;
								}
							}
						}
						else {
							if (!maxNumberTester(valueAsNumber, numberScheme.max)) {
								result = new EjvError({
									type: ErrorType.SMALLER_THAN_OR_EQUAL,
									message: ErrorMsg.SMALLER_THAN_OR_EQUAL.replace(ErrorMsgCursorA, '' + numberScheme.max),

									data,
									path: _options.path,

									errorScheme: numberScheme,
									errorData: value
								});
								break;
							}
						}
					}

					if (definedTester(numberScheme.format)) {
						let formats: NumberFormat[];

						const allNumberFormat: NumberFormat[] = Object.values(NumberFormat);

						if (!arrayTester(numberScheme.format)) {
							const formatAsString: NumberFormat = numberScheme.format as NumberFormat;

							if (!enumTester(formatAsString, allNumberFormat)) {
								throw new Error(ErrorMsg.INVALID_NUMBER_FORMAT.replace(ErrorMsgCursorA, formatAsString));
							}

							formats = [numberScheme.format as NumberFormat];
						}
						else {
							const formatAsArray: NumberFormat[] = numberScheme.format as NumberFormat[];

							const errorFormat: string | undefined = formatAsArray.find(format => {
								return !enumTester(format, allNumberFormat);
							});

							if (errorFormat) {
								throw new Error(ErrorMsg.INVALID_NUMBER_FORMAT.replace(ErrorMsgCursorA, errorFormat));
							}

							formats = numberScheme.format as NumberFormat[];
						}

						if (!formats.some(format => {
							let valid = false;

							switch (format) {
								case NumberFormat.INTEGER:
									valid = integerTester(valueAsNumber);
									break;

								case NumberFormat.INDEX:
									valid = indexTester(valueAsNumber);
									break;
							}

							return valid;
						})) {
							if (!arrayTester(numberScheme.format)) {
								result = new EjvError({
									type: ErrorType.FORMAT,
									message: ErrorMsg.FORMAT.replace(ErrorMsgCursorA, numberScheme.format as NumberFormat),

									data,
									path: _options.path,

									errorScheme: numberScheme,
									errorData: value
								});
							}
							else {
								result = new EjvError({
									type: ErrorType.FORMAT_ONE_OF,
									message: ErrorMsg.FORMAT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(numberScheme.format)),

									data,
									path: _options.path,

									errorScheme: numberScheme,
									errorData: value
								});
							}
							break;
						}
					}
					break;
				}

				case DataType.STRING: {
					const valueAsString: string = value as unknown as string;
					const stringScheme: StringScheme = scheme as StringScheme;

					if (definedTester(stringScheme.enum)) {
						if (!arrayTester(stringScheme.enum)) {
							throw new Error(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
						}

						const enumArr: string[] = stringScheme.enum;

						if (!arrayTypeOfTester(enumArr, DataType.STRING)) {
							throw new Error(ErrorMsg.ENUM_SHOULD_BE_STRINGS);
						}

						if (!enumTester(valueAsString, enumArr)) {
							result = new EjvError({
								type: ErrorType.ONE_OF,
								message: ErrorMsg.ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(stringScheme.enum)),

								data,
								path: _options.path,

								errorScheme: stringScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(stringScheme.enumReverse)) {
						if (!arrayTester(stringScheme.enumReverse)) {
							throw new Error(ErrorMsg.ENUM_REVERSE_SHOULD_BE_ARRAY);
						}

						const enumReverseArr: string[] = stringScheme.enumReverse;

						if (!arrayTypeOfTester(enumReverseArr, DataType.STRING)) {
							throw new Error(ErrorMsg.ENUM_REVERSE_SHOULD_BE_STRINGS);
						}

						if (enumTester(valueAsString, enumReverseArr)) {
							result = new EjvError({
								type: ErrorType.NOT_ONE_OF,
								message: ErrorMsg.NOT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(enumReverseArr)),

								data,
								path: _options.path,

								errorScheme: stringScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(stringScheme.length)) {
						const length: number = stringScheme.length;

						if (!(numberTester(length) && integerTester(length))) {
							throw new Error(ErrorMsg.LENGTH_SHOULD_BE_INTEGER);
						}

						if (!lengthTester(valueAsString, length)) {
							result = new EjvError({
								type: ErrorType.LENGTH,
								message: ErrorMsg.LENGTH.replace(ErrorMsgCursorA, '' + length),

								data,
								path: _options.path,

								errorScheme: stringScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(stringScheme.minLength)) {
						const minLength: number = stringScheme.minLength;

						if (!(numberTester(minLength) && integerTester(minLength))) {
							throw new Error(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
						}

						if (!minLengthTester(valueAsString, minLength)) {
							result = new EjvError({
								type: ErrorType.MIN_LENGTH,
								message: ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + minLength),

								data,
								path: _options.path,

								errorScheme: stringScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(stringScheme.maxLength)) {
						const maxLength: number = stringScheme.maxLength;

						if (!(numberTester(maxLength) && integerTester(maxLength))) {
							throw new Error(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
						}

						if (!maxLengthTester(valueAsString, maxLength)) {
							result = new EjvError({
								type: ErrorType.MAX_LENGTH,
								message: ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + maxLength),

								data,
								path: _options.path,

								errorScheme: stringScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(stringScheme.format)) {
						let formats: StringFormat[];

						const allStringFormat: StringFormat[] = Object.values(StringFormat);

						if (!arrayTester(stringScheme.format)) {
							const formatAsString: string = stringScheme.format;

							if (!enumTester(formatAsString, allStringFormat)) {
								throw new Error(ErrorMsg.INVALID_STRING_FORMAT.replace(ErrorMsgCursorA, formatAsString));
							}

							formats = [stringScheme.format] as StringFormat[];
						}
						else {
							const formatAsArray: string[] = stringScheme.format;
							const errorFormat: string | undefined = formatAsArray.find(format => {
								return !enumTester(format, allStringFormat);
							});

							if (errorFormat) {
								throw new Error(ErrorMsg.INVALID_STRING_FORMAT.replace(ErrorMsgCursorA, errorFormat));
							}

							formats = stringScheme.format as StringFormat[];
						}

						if (!formats.some(format => {
							let valid = false;

							switch (format) {
								case StringFormat.EMAIL:
									valid = emailTester(valueAsString);
									break;

								case StringFormat.DATE:
									valid = dateFormatTester(valueAsString);
									break;

								case StringFormat.TIME:
									valid = timeFormatTester(valueAsString);
									break;

								case StringFormat.DATE_TIME:
									valid = dateTimeFormatTester(valueAsString);
									break;
							}

							return valid;
						})) {
							if (!arrayTester(stringScheme.format)) {
								result = new EjvError({
									type: ErrorType.FORMAT,
									message: ErrorMsg.FORMAT.replace(ErrorMsgCursorA, stringScheme.format as StringFormat),

									data,
									path: _options.path,

									errorScheme: stringScheme,
									errorData: value
								});
							}
							else {
								result = new EjvError({
									type: ErrorType.FORMAT_ONE_OF,
									message: ErrorMsg.FORMAT_ONE_OF.replace(ErrorMsgCursorA, JSON.stringify(stringScheme.format)),

									data,
									path: _options.path,

									errorScheme: stringScheme,
									errorData: value
								});
							}
							break;
						}
					}

					if (definedTester(stringScheme.pattern)) {
						// check parameter
						if (stringScheme.pattern === null) {
							throw new Error(ErrorMsg.INVALID_STRING_PATTERN
								.replace(ErrorMsgCursorA, 'null'));
						}

						const isValidPattern = (pattern: string | RegExp): boolean => {
							return (stringTester(pattern) && minLengthTester(pattern as string, 1))
								|| (regExpTester(pattern) && pattern.toString() !== '/(?:)/' && pattern.toString() !== '/null/');
						};

						const patternToString = (pattern: string | RegExp): string => {
							let regExpStr: string;

							if (pattern === null) {
								regExpStr = '/null/';
							}
							else if (stringTester(pattern)) {
								if (minLengthTester(pattern as string, 1)) {
									regExpStr = new RegExp(pattern as string).toString();
								}
								else {
									regExpStr = '//';
								}
							}
							else {
								regExpStr = pattern.toString();
							}

							// empty regular expression
							if (regExpStr === '/(?:)/') {
								regExpStr = '//';
							}

							return regExpStr;
						};

						const createArrayErrorMsg = (patternsAsArray: (string | RegExp)[]): string => {
							return '[' + patternsAsArray.map(onePattern => {
								return patternToString(onePattern);
							}).join(', ') + ']';
						};

						if (arrayTester(stringScheme.pattern)) {
							const patternsAsArray: (string | RegExp)[] = stringScheme.pattern as (string | RegExp)[];

							if (!minLengthTester(patternsAsArray, 1)) { // empty array
								throw new Error(ErrorMsg.INVALID_STRING_PATTERN
									.replace(ErrorMsgCursorA, createArrayErrorMsg(patternsAsArray)));
							}

							const regExpPatterns: RegExp[] = patternsAsArray.map(pattern => {
								if (!isValidPattern(pattern)) {
									throw new Error(ErrorMsg.INVALID_STRING_PATTERN
										.replace(ErrorMsgCursorA, createArrayErrorMsg(patternsAsArray)));
								}

								return new RegExp(pattern);
							}) as RegExp[];

							// check value
							if (!regExpPatterns.some((regexp: RegExp) => {
								return stringRegExpTester(valueAsString, regexp);
							})) {
								result = new EjvError({
									type: ErrorType.PATTERN_ONE_OF,
									message: ErrorMsg.PATTERN_ONE_OF.replace(ErrorMsgCursorA, createArrayErrorMsg(patternsAsArray)),

									data,
									path: _options.path,

									errorScheme: stringScheme,
									errorData: value
								});
								break;
							}

						}
						else {
							const patternAsOne: string | RegExp = stringScheme.pattern as string | RegExp;

							if (!isValidPattern(patternAsOne)) {
								throw new Error(ErrorMsg.INVALID_STRING_PATTERN
									.replace(ErrorMsgCursorA, patternToString(patternAsOne)));
							}

							// check value
							const regExp = new RegExp(patternAsOne);

							if (!stringRegExpTester(valueAsString, regExp)) {
								result = new EjvError({
									type: ErrorType.PATTERN,
									message: ErrorMsg.PATTERN.replace(ErrorMsgCursorA, patternToString(patternAsOne)),

									data,
									path: _options.path,

									errorScheme: stringScheme,
									errorData: value
								});
								break;
							}
						}
					}
					break;
				}

				case DataType.OBJECT: {
					const valueAsObject = value as unknown as AnyObject;
					const objectScheme: ObjectScheme = scheme as ObjectScheme;

					if (definedTester(objectScheme.allowNoProperty)) {
						if (!booleanTester(objectScheme.allowNoProperty)) {
							throw new Error(ErrorMsg.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN);
						}

						if (!objectScheme.allowNoProperty && !hasPropertyTester(valueAsObject)) {
							result = new EjvError({
								type: ErrorType.NO_PROPERTY,
								message: ErrorMsg.NO_PROPERTY,

								data,
								path: _options.path,

								errorScheme: objectScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(objectScheme.properties)) {
						if (!arrayTester(objectScheme.properties)) {
							throw new Error(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY);
						}

						const properties: Scheme[] = objectScheme.properties as Scheme[];

						if (!minLengthTester(properties, 1)) {
							throw new Error(ErrorMsg.PROPERTIES_SHOULD_HAVE_ITEMS);
						}

						if (!arrayTypeOfTester(properties, DataType.OBJECT)) {
							throw new Error(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT);
						}

						if (!objectTester(value)) {
							result = new EjvError({
								type: ErrorType.TYPE_MISMATCH,
								message: ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, 'object'),

								data,
								path: _options.path,

								errorScheme: objectScheme,
								errorData: value
							});
							break;
						}

						const partialData: T[keyof T] = data[key];
						const partialScheme: Scheme[] = objectScheme.properties as Scheme[];

						// call recursively
						result = _ejv(partialData, partialScheme, _options);

						if (result) {
							// inject original data
							result.data = data;
						}
					}
					break;
				}

				case DataType.DATE: {
					const valueAsDate: Date = value as unknown as Date;
					const dateScheme: DateScheme = scheme as DateScheme;

					if (definedTester(dateScheme.min)) {
						if (!(
							(stringTester(dateScheme.min)
								&& (
									dateFormatTester(dateScheme.min as string)
									|| dateTimeFormatTester(dateScheme.min as string)
								)
							)
							|| dateTester(dateScheme.min)
						)) {
							throw new Error(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING);
						}

						if (definedTester(dateScheme.exclusiveMin) && !booleanTester(dateScheme.exclusiveMin)) {
							throw new Error(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
						}

						let minDate: Date = new Date(dateScheme.min as string | Date);

						// adjust timezone
						if (stringTester(dateScheme.min)) {
							// by minutes
							const timezoneOffset: number = minDate.getTimezoneOffset();

							minDate = new Date(+minDate + (timezoneOffset * 60 * 1000));
						}

						if (dateScheme.exclusiveMin !== true) {
							if (!minDateTester(valueAsDate, minDate)) {
								result = new EjvError({
									type: ErrorType.AFTER_OR_SAME_DATE,
									message: ErrorMsg.AFTER_OR_SAME_DATE.replace(ErrorMsgCursorA, minDate.toISOString()),

									data,
									path: _options.path,

									errorScheme: dateScheme,
									errorData: value
								});
								break;
							}
						}
						else {
							if (!exclusiveMinDateTester(valueAsDate, minDate)) {
								result = new EjvError({
									type: ErrorType.AFTER_DATE,
									message: ErrorMsg.AFTER_DATE.replace(ErrorMsgCursorA, minDate.toISOString()),

									data,
									path: _options.path,

									errorScheme: dateScheme,
									errorData: value
								});
								break;
							}
						}
					}

					if (definedTester(dateScheme.max)) {
						if (!(
							(stringTester(dateScheme.max)
								&& (
									dateFormatTester(dateScheme.max as string)
									|| dateTimeFormatTester(dateScheme.max as string)
								)
							)
							|| dateTester(dateScheme.max)
						)) {
							throw new Error(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING);
						}

						if (definedTester(dateScheme.exclusiveMax) && !booleanTester(dateScheme.exclusiveMax)) {
							throw new Error(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
						}

						let maxDate: Date = new Date(dateScheme.max as string | Date);

						// adjust timezone
						if (stringTester(dateScheme.max)) {
							// by minutes
							const timezoneOffset: number = maxDate.getTimezoneOffset();

							maxDate = new Date(+maxDate + (timezoneOffset * 60 * 1000));
						}

						if (dateScheme.exclusiveMax !== true) {
							if (!maxDateTester(valueAsDate, maxDate)) {
								result = new EjvError({
									type: ErrorType.BEFORE_OR_SAME_DATE,
									message: ErrorMsg.BEFORE_OR_SAME_DATE.replace(ErrorMsgCursorA, maxDate.toISOString()),

									data,
									path: _options.path,

									errorScheme: dateScheme,
									errorData: value
								});
								break;
							}

						}
						else {
							if (!exclusiveMaxDateTester(valueAsDate, maxDate)) {
								result = new EjvError({
									type: ErrorType.BEFORE_DATE,
									message: ErrorMsg.BEFORE_DATE.replace(ErrorMsgCursorA, maxDate.toISOString()),

									data,
									path: _options.path,

									errorScheme: dateScheme,
									errorData: value
								});
								break;
							}
						}
					}
					break;
				}

				case DataType.ARRAY: {
					const valueAsArray: unknown[] = value as unknown as unknown[];
					const arrayScheme: ArrayScheme = scheme as ArrayScheme;

					if (definedTester(arrayScheme.length)) {
						const length: number = arrayScheme.length;

						if (!(numberTester(length) && integerTester(length))) {
							throw new Error(ErrorMsg.LENGTH_SHOULD_BE_INTEGER);
						}

						if (!lengthTester(valueAsArray, length)) {
							result = new EjvError({
								type: ErrorType.LENGTH,
								message: ErrorMsg.LENGTH.replace(ErrorMsgCursorA, '' + length),

								data,
								path: _options.path,

								errorScheme: arrayScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(arrayScheme.minLength)) {
						const minLength: number = arrayScheme.minLength;

						if (!(numberTester(arrayScheme.minLength) && integerTester(minLength))) {
							throw new Error(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
						}

						if (!minLengthTester(valueAsArray, minLength)) {
							result = new EjvError({
								type: ErrorType.MIN_LENGTH,
								message: ErrorMsg.MIN_LENGTH.replace(ErrorMsgCursorA, '' + minLength),

								data,
								path: _options.path,

								errorScheme: arrayScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(arrayScheme.maxLength)) {
						const maxLength: number = arrayScheme.maxLength;

						if (!(numberTester(arrayScheme.maxLength) && integerTester(maxLength))) {
							throw new Error(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
						}

						if (!maxLengthTester(valueAsArray, maxLength)) {
							result = new EjvError({
								type: ErrorType.MAX_LENGTH,
								message: ErrorMsg.MAX_LENGTH.replace(ErrorMsgCursorA, '' + maxLength),

								data,
								path: _options.path,

								errorScheme: arrayScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(arrayScheme.unique)) {
						if (!booleanTester(arrayScheme.unique)) {
							throw new Error(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN);
						}

						if (arrayScheme.unique && !uniqueItemsTester(valueAsArray)) {
							result = new EjvError({
								type: ErrorType.UNIQUE_ITEMS,
								message: ErrorMsg.UNIQUE_ITEMS,

								data,
								path: _options.path,

								errorScheme: arrayScheme,
								errorData: value
							});
							break;
						}
					}

					if (definedTester(arrayScheme.items)) {
						// convert array to object
						if (valueAsArray.length > 0) {
							const now: Date = new Date;
							const tempKeyArr: string[] = valueAsArray.map((value: unknown, i: number) => {
								return '' + (+now + i);
							});

							if (stringTester(arrayScheme.items) // by DataType
								|| (arrayTester(arrayScheme.items) && arrayTypeOfTester(arrayScheme.items as DataType[], DataType.STRING)) // by DataType[]
							) {
								// const itemTypes : DataType[] = (arrayTester(arrayScheme.items)
								// 	? arrayScheme.items
								// 	: [arrayScheme.items]) as DataType[];
								const itemTypes: DataType[] = (arrayTester(arrayScheme.items) ? arrayScheme.items : [arrayScheme.items]) as DataType[];

								const partialData: AnyObject = {};
								const partialSchemes: Scheme[] = [];

								tempKeyArr.forEach((tempKey: string, i: number) => {
									partialData[tempKey] = valueAsArray[i];
									partialSchemes.push({
										key: tempKey,
										type: itemTypes
									});
								});

								// call recursively
								const partialResult: EjvError | null = _ejv(partialData, partialSchemes, _options);

								// convert new EjvError
								if (partialResult) {
									let errorMsg: string;

									if (arrayTester(arrayScheme.items)) {
										errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, JSON.stringify(itemTypes));
									}
									else {
										errorMsg = ErrorMsg.ITEMS_TYPE.replace(ErrorMsgCursorA, arrayScheme.items as string);
									}

									const partialKeys: string[] = partialResult.path.split('/');
									const partialKey: string = partialKeys[partialKeys.length - 1];

									const partialScheme: Scheme = partialSchemes.find((scheme: Scheme) => {
										return scheme.key === partialKey;
									}) as Scheme;

									const partialKeyIndex: number = partialSchemes.indexOf(partialScheme);

									result = new EjvError({
										type: ErrorType.ITEMS_TYPE,
										message: errorMsg,

										data,
										path: [..._options.path, '' + partialKeyIndex],

										errorScheme: partialScheme,
										errorData: partialData[partialKey]
									});
								}
								break;
							}
							else if ((objectTester(arrayScheme.items) && arrayScheme.items !== null) // by Scheme
								|| (arrayTester(arrayScheme.items) && arrayTypeOfTester(arrayScheme.items as Scheme[], DataType.OBJECT)) // by Scheme[]
							) {
								const itemsAsSchemes: Scheme[] = (arrayTester(arrayScheme.items) ? arrayScheme.items : [arrayScheme.items]) as Scheme[];

								let partialError: EjvError | null | undefined = null;

								// use for() instead of forEach() to break
								const valueLength: number = valueAsArray.length;

								for (let arrIndex = 0; arrIndex < valueLength; arrIndex++) {
									const oneValue: unknown = valueAsArray[arrIndex];

									const partialData: AnyObject = {};
									const partialSchemes: Scheme[] = [];

									const tempKeyForThisValue: string = tempKeyArr[arrIndex];

									partialData[tempKeyForThisValue] = oneValue;

									partialSchemes.push(...itemsAsSchemes.map((oneScheme: Scheme) => {
										const newScheme: Scheme = clone(oneScheme); // divide instance

										newScheme.key = tempKeyForThisValue;

										return newScheme;
									}));

									const partialResults: (EjvError | null)[] = partialSchemes.map((partialScheme: Scheme) => {
										// call recursively
										const partialResult: EjvError | null = _ejv(partialData, [partialScheme], _options);

										if (partialResult) {
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

								if (partialError) {
									let errorType: ErrorType;
									let errorMsg: string;

									if (!!itemsAsSchemes && itemsAsSchemes.length > 1) {
										errorType = ErrorType.ITEMS_SCHEMES;
										errorMsg = ErrorMsg.ITEMS_SCHEMES.replace(ErrorMsgCursorA, JSON.stringify(itemsAsSchemes));
									}
									else {
										errorType = partialError.type;
										errorMsg = partialError.message;

										if (errorType === ErrorType.REQUIRED) {
											// REQUIRED in array is TYPE_MISMATCH except with nullable === true
											errorType = ErrorType.TYPE_MISMATCH;
											errorMsg = ErrorMsg.TYPE_MISMATCH.replace(ErrorMsgCursorA, JSON.stringify(arrayScheme.items));
										}
									}

									result = new EjvError({
										type: errorType,
										message: errorMsg,

										data,
										path: partialError.path.split('/'),

										errorScheme: partialError.errorScheme,
										errorData: partialError.errorData
									});
									break;
								}
							}
							else {
								throw new Error(ErrorMsg.INVALID_ITEMS_SCHEME.replace(ErrorMsgCursorA, JSON.stringify(arrayScheme.items)));
							}
						}
					}
					break;
				}
			}

			if (result) {
				break;
			}
		}
		else {
			// with not
			let newSchemes: Scheme[];

			const tempKey: string = '' + +new Date();

			if (arrayTester(scheme.not)) {
				newSchemes = scheme.not.map((one: Scheme) => {
					const newOne: Scheme = clone(one);
					newOne.key = tempKey;

					return newOne;
				});
			}
			else {
				const newScheme: Scheme = clone(scheme.not);
				newScheme.key = tempKey;

				newSchemes = [newScheme];
			}

			// TODO: check duplicated rule
			// if(Object.keys(notSchemes).some(scheme => {
			// 	return Object.keys(scheme)
			// })){
			//
			// }

			const optionsForNot: InternalOptions = clone(options);
			optionsForNot.positiveTrue = !optionsForNot.positiveTrue;

			result = _ejv({
				[tempKey]: value
			}, newSchemes, optionsForNot);


			if (result) {
				// replace data for not
				result.data = data;
				result.path = result.path.replace(tempKey, key as string);

				break;
			}
		}
	}

	if (result !== null && definedTester(options.customErrorMsg)) {
		const customErrorMsgObj: {
			[key in ErrorType]?: string;
		} = options.customErrorMsg as {
			[key in ErrorType]?: string;
		};

		// override error message
		const customMsg: string | undefined = customErrorMsgObj[result.type];

		if (definedTester(customMsg)) {
			result.message = customMsg;
		}
	}

	return result;
};

export const ejv = (data: object, schemes: Scheme[], options?: Options): null | EjvError => {
	// check data itself
	if (!definedTester(data) || !objectTester(data) || data === null) {
		return new EjvError({
			type: ErrorType.REQUIRED,
			message: ErrorMsg.NO_DATA,

			data,
			path: ['/']
		});
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


	const internalOption: InternalOptions = (options
		? {
			...options
		}
		: {}) as InternalOptions;

	if (!definedTester(internalOption.path)) {
		internalOption.path = [];
	}

	if (!definedTester(internalOption.positiveTrue)) {
		internalOption.positiveTrue = true;
	}


	return _ejv(data, schemes, internalOption);
};
