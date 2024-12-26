import {
	AllDataType,
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
import { DATA_TYPE, ERROR_MESSAGE, ERROR_TYPE, NUMBER_FORMAT, STRING_FORMAT } from './constants';

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
	jsonStrTester,
	lengthTester,
	maxDateTester,
	maxLengthTester,
	maxNumberTester,
	minDateTester,
	minLengthTester,
	minNumberTester,
	notEnumTester,
	numberTester,
	objectTester,
	regExpTester,
	stringRegExpTester,
	stringTester,
	timeFormatTester,
	typeTester,
	uniqueItemsTester
} from './tester';
import { clone, createErrorMsg, sift } from './util';


function _getEffectiveTypes (scheme: Scheme): DATA_TYPE[] | undefined {
	let result: DATA_TYPE[] | undefined;

	if (definedTester(scheme.type)) {
		result = (arrayTester(scheme.type)
			? scheme.type
			: [scheme.type]) as DATA_TYPE[];
	}
	else if (definedTester(scheme.parent)) {
		result = _getEffectiveTypes(scheme.parent);
	}

	return result;
}

const _ejv = <T> (data: T, schemes: Scheme[], options: InternalOptions): null | EjvError => {
	// check schemes
	if (!definedTester(schemes) || schemes === null) {
		return new EjvError({
			type: ERROR_TYPE.NO_SCHEME,
			message: ERROR_MESSAGE.NO_SCHEME,

			data: data,

			errorScheme: schemes,
			isSchemeError: true
		});
	}

	if (!arrayTester(schemes)) {
		return new EjvError({
			type: ERROR_TYPE.INVALID_SCHEMES,
			message: ERROR_MESSAGE.NO_ARRAY_SCHEME,

			data: data,

			errorScheme: schemes,
			isSchemeError: true
		});
	}

	if (!arrayTypeOfTester(schemes, DATA_TYPE.OBJECT)) {
		return new EjvError({
			type: ERROR_TYPE.INVALID_SCHEMES,
			message: ERROR_MESSAGE.NO_OBJECT_ARRAY_SCHEME,

			data: data,

			errorScheme: schemes,
			isSchemeError: true
		});
	}

	if (!minLengthTester(schemes, 1)) {
		return new EjvError({
			type: ERROR_TYPE.INVALID_SCHEMES,
			message: ERROR_MESSAGE.EMPTY_SCHEME,

			data: data,

			errorScheme: schemes,
			isSchemeError: true
		});
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

		const types: DATA_TYPE[] | undefined = _getEffectiveTypes(scheme);

		if (!definedTester(types)) {
			return new EjvError({
				type: ERROR_TYPE.INVALID_SCHEMES,
				message: ERROR_MESSAGE.SCHEMES_SHOULD_HAVE_TYPE,

				data: data,

				errorScheme: scheme,
				isSchemeError: true
			});
		}


		const allDataType: DATA_TYPE[] = Object.values(DATA_TYPE);

		const typeError: string | undefined = types.find((type: DATA_TYPE): boolean => {
			return !definedTester(type)
				|| !stringTester(type)
				|| !enumTester(type, allDataType);
		});

		if (typeError) {
			return new EjvError({
				type: ERROR_TYPE.INVALID_SCHEMES,
				message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_INVALID_TYPE, {
					placeholders: [typeError]
				}),

				data: data,

				errorScheme: scheme,
				isSchemeError: true
			});
		}

		if (!uniqueItemsTester(types)) {
			const notUniqueItems: string[] = types.filter((type: string): boolean => {
				return types.filter((_type: unknown): boolean => _type === type).length > 1;
			});

			const notUniqueItemsSifted: string[] = sift(notUniqueItems);

			return new EjvError({
				type: ERROR_TYPE.INVALID_SCHEMES,
				message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_DUPLICATED_TYPE, {
					placeholders: [notUniqueItemsSifted.join(', ')]
				}),

				data: data,

				errorScheme: scheme,
				isSchemeError: true
			});
		}

		if (!definedTester(value)) {
			if (scheme.optional !== true) {
				result = new EjvError({
					type: ERROR_TYPE.REQUIRED,
					message: createErrorMsg(ERROR_MESSAGE.REQUIRED),

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
					type: ERROR_TYPE.REQUIRED,
					message: createErrorMsg(ERROR_MESSAGE.REQUIRED),

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

		const typeResolved: DATA_TYPE | undefined = types.find((type: DATA_TYPE): type is DATA_TYPE => {
			return typeTester(value, type);
		});

		if (typeResolved) {
			if (definedTester(scheme.type)) {
				if (!arrayTester(scheme.type)) {
					if (scheme.type !== typeResolved) {
						result = new EjvError({
							type: ERROR_TYPE.TYPE_MISMATCH,
							message: createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
								placeholders: [scheme.type]
							}),

							data,
							path: _options.path,

							errorScheme: scheme,
							errorData: value
						});
					}
				}
				else {
					if (!scheme.type.includes(typeResolved)) {
						result = new EjvError({
							type: ERROR_TYPE.TYPE_MISMATCH_ONE_OF,
							message: createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH_ONE_OF, {
								placeholders: [JSON.stringify(scheme.type)]
							}),

							data,
							path: _options.path,

							errorScheme: scheme,
							errorData: value
						});
					}
				}
			}
			// else do additional validation
		}
		else {
			// type is not resolved
			const typesForMsg: AllDataType = scheme.type || scheme.parent?.type as AllDataType;

			if (!arrayTester(typesForMsg)) {
				result = new EjvError({
					type: ERROR_TYPE.TYPE_MISMATCH,
					message: createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
						placeholders: [typesForMsg]
					}),

					data,
					path: _options.path,

					errorScheme: scheme,
					errorData: value
				});
			}
			else {
				result = new EjvError({
					type: ERROR_TYPE.TYPE_MISMATCH_ONE_OF,
					message: createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH_ONE_OF, {
						placeholders: [JSON.stringify(typesForMsg)]
					}),

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
			case DATA_TYPE.NUMBER: {
				const valueAsNumber: number = value as unknown as number;
				const numberScheme: NumberScheme = scheme as NumberScheme;

				if (definedTester(numberScheme.enum)) {
					if (!arrayTester(numberScheme.enum)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.ENUM_SHOULD_BE_ARRAY),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					const enumArr: number[] = numberScheme.enum;

					if (!arrayTypeOfTester(enumArr, DATA_TYPE.NUMBER)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.ENUM_SHOULD_BE_NUMBERS),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					if (!enumTester(valueAsNumber, enumArr)) {
						result = new EjvError({
							type: ERROR_TYPE.ONE_VALUE_OF,
							message: createErrorMsg(ERROR_MESSAGE.ONE_VALUE_OF, {
								placeholders: [JSON.stringify(enumArr)]
							}),

							data,
							path: _options.path,

							errorScheme: numberScheme,
							errorData: value
						});
						break;
					}
				}

				if (definedTester(numberScheme.notEnum)) {
					if (!arrayTester(numberScheme.notEnum)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.NOT_ENUM_SHOULD_BE_ARRAY),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					const enumArr: number[] = numberScheme.notEnum;

					if (!arrayTypeOfTester(enumArr, DATA_TYPE.NUMBER)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.NOT_ENUM_SHOULD_BE_NUMBERS),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					if (!notEnumTester(valueAsNumber, enumArr)) {
						result = new EjvError({
							type: ERROR_TYPE.NOT_ONE_VALUE_OF,
							message: createErrorMsg(ERROR_MESSAGE.NOT_ONE_VALUE_OF, {
								placeholders: [JSON.stringify(enumArr)]
							}),

							data,
							path: _options.path,

							errorScheme: numberScheme,
							errorData: value
						});
						break;
					}
				}

				if (
					definedTester(numberScheme.min)
					|| definedTester((scheme.parent as NumberScheme)?.min)
				) {
					const effectiveMin: number = definedTester(numberScheme.min)
						? numberScheme.min
						: (scheme.parent as NumberScheme)?.min as number;

					if (!numberTester(effectiveMin)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.MIN_SHOULD_BE_NUMBER),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					if (definedTester(numberScheme.exclusiveMin)) {
						if (!booleanTester(numberScheme.exclusiveMin)) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN),

								data: data,

								errorScheme: numberScheme,
								isSchemeError: true
							});
						}
					}

					if (numberScheme.exclusiveMin) {
						if (!exclusiveMinNumberTester(valueAsNumber, effectiveMin)) {
							result = new EjvError({
								type: ERROR_TYPE.BIGGER_THAN,
								message: createErrorMsg(ERROR_MESSAGE.BIGGER_THAN, {
									placeholders: [effectiveMin]
								}),

								data,
								path: _options.path,

								errorScheme: numberScheme,
								errorData: value
							});
							break;
						}
					}
					else {
						if (!minNumberTester(valueAsNumber, effectiveMin)) {
							result = new EjvError({
								type: ERROR_TYPE.BIGGER_THAN_OR_EQUAL,
								message: createErrorMsg(ERROR_MESSAGE.BIGGER_THAN_OR_EQUAL, {
									placeholders: [effectiveMin]
								}),

								data,
								path: _options.path,

								errorScheme: numberScheme,
								errorData: value
							});
							break;
						}
					}
				}

				if (definedTester(numberScheme.max)
					|| definedTester((scheme.parent as NumberScheme)?.max)) {
					const effectiveMax: number = definedTester(numberScheme.max)
						? numberScheme.max
						: (scheme.parent as NumberScheme)?.max as number;

					if (!numberTester(effectiveMax)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.MAX_SHOULD_BE_NUMBER),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					if (definedTester(numberScheme.exclusiveMax)) {
						if (!booleanTester(numberScheme.exclusiveMax)) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN),

								data: data,

								errorScheme: numberScheme,
								isSchemeError: true
							});
						}
					}

					if (numberScheme.exclusiveMax) {
						if (!exclusiveMaxNumberTester(valueAsNumber, effectiveMax)) {
							result = new EjvError({
								type: ERROR_TYPE.SMALLER_THAN,
								message: createErrorMsg(ERROR_MESSAGE.SMALLER_THAN, {
									placeholders: [effectiveMax]
								}),

								data,
								path: _options.path,

								errorScheme: numberScheme,
								errorData: value
							});
							break;
						}
					}
					else {
						if (!maxNumberTester(valueAsNumber, effectiveMax)) {
							result = new EjvError({
								type: ERROR_TYPE.SMALLER_THAN_OR_EQUAL,
								message: createErrorMsg(ERROR_MESSAGE.SMALLER_THAN_OR_EQUAL, {
									placeholders: [effectiveMax]
								}),

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
					let formats: NUMBER_FORMAT[];

					const allNumberFormat: NUMBER_FORMAT[] = Object.values(NUMBER_FORMAT);

					if (!arrayTester(numberScheme.format)) {
						const formatAsString: NUMBER_FORMAT = numberScheme.format as NUMBER_FORMAT;

						if (!enumTester(formatAsString, allNumberFormat)) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.INVALID_NUMBER_FORMAT, {
									placeholders: [formatAsString]
								}),

								data: data,

								errorScheme: numberScheme,
								isSchemeError: true
							});
						}

						formats = [numberScheme.format as NUMBER_FORMAT];
					}
					else {
						const formatAsArray: NUMBER_FORMAT[] = numberScheme.format as NUMBER_FORMAT[];

						const errorFormat: string | undefined = formatAsArray.find((format: NUMBER_FORMAT): boolean => {
							return !enumTester(format, allNumberFormat);
						});

						if (errorFormat) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.INVALID_NUMBER_FORMAT, {
									placeholders: [errorFormat]
								}),

								data: data,

								errorScheme: numberScheme,
								isSchemeError: true
							});
						}

						formats = numberScheme.format as NUMBER_FORMAT[];
					}

					const someFormatIsWrong: boolean = formats.some((format: NUMBER_FORMAT): boolean => {
						let valid: boolean = false;

						switch (format) {
							case NUMBER_FORMAT.INTEGER:
								valid = integerTester(valueAsNumber);
								break;

							case NUMBER_FORMAT.INDEX:
								valid = indexTester(valueAsNumber);
								break;
						}

						return valid;
					});

					if (!someFormatIsWrong) {
						if (!arrayTester(numberScheme.format)) {
							result = new EjvError({
								type: ERROR_TYPE.FORMAT,
								message: createErrorMsg(ERROR_MESSAGE.FORMAT, {
									placeholders: [numberScheme.format]
								}),

								data,
								path: _options.path,

								errorScheme: numberScheme,
								errorData: value
							});
						}
						else {
							result = new EjvError({
								type: ERROR_TYPE.FORMAT_ONE_OF,
								message: createErrorMsg(ERROR_MESSAGE.FORMAT_ONE_OF, {
									placeholders: [JSON.stringify(numberScheme.format)]
								}),

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

			case DATA_TYPE.STRING: {
				const valueAsString: string = value as unknown as string;
				const stringScheme: StringScheme = scheme as StringScheme;

				if (definedTester(stringScheme.enum)) {
					if (!arrayTester(stringScheme.enum)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.ENUM_SHOULD_BE_ARRAY),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					const enumArr: string[] = stringScheme.enum;

					if (!arrayTypeOfTester(enumArr, DATA_TYPE.STRING)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.ENUM_SHOULD_BE_STRINGS),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!enumTester(valueAsString, enumArr)) {
						result = new EjvError({
							type: ERROR_TYPE.ONE_VALUE_OF,
							message: createErrorMsg(ERROR_MESSAGE.ONE_VALUE_OF, {
								placeholders: [JSON.stringify(stringScheme.enum)]
							}),

							data,
							path: _options.path,

							errorScheme: stringScheme,
							errorData: value
						});
						break;
					}
				}

				if (definedTester(stringScheme.notEnum)) {
					if (!arrayTester(stringScheme.notEnum)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.NOT_ENUM_SHOULD_BE_ARRAY),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					const enumArr: string[] = stringScheme.notEnum;

					if (!arrayTypeOfTester(enumArr, DATA_TYPE.STRING)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.NOT_ENUM_SHOULD_BE_STRINGS),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!notEnumTester(valueAsString, enumArr)) {
						result = new EjvError({
							type: ERROR_TYPE.NOT_ONE_VALUE_OF,
							message: createErrorMsg(ERROR_MESSAGE.NOT_ONE_VALUE_OF, {
								placeholders: [JSON.stringify(stringScheme.notEnum)]
							}),

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
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!lengthTester(valueAsString, length)) {
						result = new EjvError({
							type: ERROR_TYPE.LENGTH,
							message: createErrorMsg(ERROR_MESSAGE.LENGTH, {
								placeholders: [length]
							}),

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
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.MIN_LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!minLengthTester(valueAsString, minLength)) {
						result = new EjvError({
							type: ERROR_TYPE.MIN_LENGTH,
							message: createErrorMsg(ERROR_MESSAGE.MIN_LENGTH, {
								placeholders: ['' + minLength]
							}),

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
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.MAX_LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!maxLengthTester(valueAsString, maxLength)) {
						result = new EjvError({
							type: ERROR_TYPE.MAX_LENGTH,
							message: createErrorMsg(ERROR_MESSAGE.MAX_LENGTH, {
								placeholders: ['' + maxLength]
							}),

							data,
							path: _options.path,

							errorScheme: stringScheme,
							errorData: value
						});
						break;
					}
				}

				if (definedTester(stringScheme.format)) {
					let formats: STRING_FORMAT[];

					const allStringFormat: STRING_FORMAT[] = Object.values(STRING_FORMAT);

					if (!arrayTester(stringScheme.format)) {
						const formatAsString: string = stringScheme.format;

						if (!enumTester(formatAsString, allStringFormat)) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.INVALID_STRING_FORMAT, {
									placeholders: [formatAsString]
								}),

								data: data,

								errorScheme: stringScheme,
								isSchemeError: true
							});
						}

						formats = [stringScheme.format] as STRING_FORMAT[];
					}
					else {
						const formatAsArray: string[] = stringScheme.format;
						const errorFormat: string | undefined = formatAsArray.find((format: string): boolean => {
							return !enumTester(format, allStringFormat);
						});

						if (errorFormat) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.INVALID_STRING_FORMAT, {
									placeholders: [errorFormat]
								}),

								data: data,

								errorScheme: stringScheme,
								isSchemeError: true
							});
						}

						formats = stringScheme.format as STRING_FORMAT[];
					}

					const foundFormatMatching: boolean = formats.some((format: STRING_FORMAT): boolean => {
						let valid: boolean = false;

						switch (format) {
							case STRING_FORMAT.EMAIL:
								valid = emailTester(valueAsString);
								break;

							case STRING_FORMAT.JSON:
								valid = jsonStrTester(valueAsString);
								break;

							case STRING_FORMAT.DATE:
								valid = dateFormatTester(valueAsString);
								break;

							case STRING_FORMAT.TIME:
								valid = timeFormatTester(valueAsString);
								break;

							case STRING_FORMAT.DATE_TIME:
								valid = dateTimeFormatTester(valueAsString);
								break;
						}

						return valid;
					});

					if (!foundFormatMatching) {
						if (!arrayTester(stringScheme.format)) {
							result = new EjvError({
								type: ERROR_TYPE.FORMAT,
								message: createErrorMsg(ERROR_MESSAGE.FORMAT, {
									placeholders: [stringScheme.format as STRING_FORMAT]
								}),

								data,
								path: _options.path,

								errorScheme: stringScheme,
								errorData: value
							});
						}
						else {
							result = new EjvError({
								type: ERROR_TYPE.FORMAT_ONE_OF,
								message: createErrorMsg(ERROR_MESSAGE.FORMAT_ONE_OF, {
									placeholders: [JSON.stringify(stringScheme.format)]
								}),

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
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
								placeholders: ['null']
							}),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
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
						return '[' + patternsAsArray.map((onePattern: string | RegExp): string => {
							return patternToString(onePattern);
						}).join(', ') + ']';
					};

					if (arrayTester(stringScheme.pattern)) {
						const patternsAsArray: (string | RegExp)[] = stringScheme.pattern as (string | RegExp)[];

						if (!minLengthTester(patternsAsArray, 1)) { // empty array
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
									placeholders: [createArrayErrorMsg(patternsAsArray)]
								}),

								data: data,

								errorScheme: stringScheme,
								isSchemeError: true
							});
						}

						try {
							const regExpPatterns: RegExp[] = patternsAsArray.map((pattern: string | RegExp): RegExp => {
								if (!isValidPattern(pattern)) {
									throw new Error(createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
										placeholders: [createArrayErrorMsg(patternsAsArray)]
									}));
								}

								return new RegExp(pattern);
							}) as RegExp[];

							// check value
							const foundMatchPattern: boolean = regExpPatterns.some((regexp: RegExp): boolean => {
								return stringRegExpTester(valueAsString, regexp);
							});

							if (!foundMatchPattern) {
								result = new EjvError({
									type: ERROR_TYPE.PATTERN_ONE_OF,
									message: createErrorMsg(ERROR_MESSAGE.PATTERN_ONE_OF, {
										placeholders: [createArrayErrorMsg(patternsAsArray)]
									}),

									data,
									path: _options.path,

									errorScheme: stringScheme,
									errorData: value
								});
								break;
							}
						}
						catch (e: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
									placeholders: [createArrayErrorMsg(patternsAsArray)]
								}),

								data: data,

								errorScheme: stringScheme,
								isSchemeError: true
							});
						}
					}
					else {
						const patternAsOne: string | RegExp = stringScheme.pattern as string | RegExp;

						if (!isValidPattern(patternAsOne)) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
									placeholders: [patternToString(patternAsOne)]
								}),

								data: data,

								errorScheme: stringScheme,
								isSchemeError: true
							});
						}

						// check value
						const regExp: RegExp = new RegExp(patternAsOne);

						if (!stringRegExpTester(valueAsString, regExp)) {
							result = new EjvError({
								type: ERROR_TYPE.PATTERN,
								message: createErrorMsg(ERROR_MESSAGE.PATTERN, {
									placeholders: [patternToString(patternAsOne)]
								}),

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

			case DATA_TYPE.OBJECT: {
				const valueAsObject: AnyObject = value as unknown as AnyObject;
				const objectScheme: ObjectScheme = scheme as ObjectScheme;

				if (definedTester(objectScheme.allowNoProperty)) {
					if (!booleanTester(objectScheme.allowNoProperty)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN),

							data: data,

							errorScheme: objectScheme,
							isSchemeError: true
						});
					}

					if (!objectScheme.allowNoProperty && !hasPropertyTester(valueAsObject)) {
						result = new EjvError({
							type: ERROR_TYPE.PROPERTY,
							message: ERROR_MESSAGE.PROPERTY,

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
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY),

							data: data,

							errorScheme: objectScheme,
							isSchemeError: true
						});
					}

					const properties: Scheme[] = objectScheme.properties as Scheme[];

					if (!minLengthTester(properties, 1)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.PROPERTIES_SHOULD_HAVE_ITEMS),

							data: data,

							errorScheme: objectScheme,
							isSchemeError: true
						});
					}

					if (!arrayTypeOfTester(properties, DATA_TYPE.OBJECT)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT),

							data: data,

							errorScheme: objectScheme,
							isSchemeError: true
						});
					}

					if (!objectTester(value)) {
						result = new EjvError({
							type: ERROR_TYPE.TYPE_MISMATCH,
							message: createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
								placeholders: ['object']
							}),

							data,
							path: _options.path,

							errorScheme: objectScheme,
							errorData: value
						});
						break;
					}

					const partialData: T[keyof T] = data[key];
					const partialScheme: Scheme[] = objectScheme.properties as Scheme[];
					scheme.parent = objectScheme;

					// call recursively
					result = _ejv(partialData, partialScheme, _options);

					if (result) {
						// inject original data
						result.data = data;
					}
				}
				break;
			}

			case DATA_TYPE.DATE: {
				const valueAsDate: Date = value as unknown as Date;
				const dateScheme: DateScheme = scheme as DateScheme;
				const parentDateScheme: DateScheme | undefined = scheme.parent as DateScheme | undefined;

				if (definedTester(dateScheme.min)
					|| definedTester(parentDateScheme?.min)) {
					const minDateCandidate: string | Date = dateScheme.min || parentDateScheme?.min as string | Date;

					if (!(
						(stringTester(minDateCandidate)
							&& (
								dateFormatTester(minDateCandidate as string)
								|| dateTimeFormatTester(minDateCandidate as string)
							)
						)
						|| dateTester(minDateCandidate)
					)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.MIN_DATE_SHOULD_BE_DATE_OR_STRING),

							data: data,

							errorScheme: dateScheme,
							isSchemeError: true
						});
					}

					const effectiveMin: Date = new Date(minDateCandidate);

					if (definedTester(dateScheme.exclusiveMin)) {
						if (!booleanTester(dateScheme.exclusiveMin)) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN),

								data: data,

								errorScheme: dateScheme,
								isSchemeError: true
							});
						}


						if (dateScheme.exclusiveMin) {
							if (!exclusiveMinDateTester(valueAsDate, effectiveMin)) {
								result = new EjvError({
									type: ERROR_TYPE.AFTER_DATE,
									message: createErrorMsg(ERROR_MESSAGE.AFTER_DATE, {
										placeholders: [effectiveMin.toISOString()]
									}),

									data,
									path: _options.path,

									errorScheme: dateScheme,
									errorData: value
								});
								break;

							}
						}
						else {
							if (!minDateTester(valueAsDate, effectiveMin)) {
								result = new EjvError({
									type: ERROR_TYPE.AFTER_OR_SAME_DATE,
									message: createErrorMsg(ERROR_MESSAGE.AFTER_OR_SAME_DATE, {
										placeholders: [effectiveMin.toISOString()]
									}),

									data,
									path: _options.path,

									errorScheme: dateScheme,
									errorData: value
								});
								break;
							}
						}


					}
					else {
						if (!minDateTester(valueAsDate, effectiveMin)) {
							result = new EjvError({
								type: ERROR_TYPE.AFTER_OR_SAME_DATE,
								message: createErrorMsg(ERROR_MESSAGE.AFTER_OR_SAME_DATE, {
									placeholders: [effectiveMin.toISOString()]
								}),

								data,
								path: _options.path,

								errorScheme: dateScheme,
								errorData: value
							});
							break;
						}
					}
				}

				if (definedTester(dateScheme.max)
					|| definedTester(parentDateScheme?.max)) {
					const maxDateCandidate: string | Date = dateScheme.max || parentDateScheme?.max as string | Date;

					if (!(
						(stringTester(maxDateCandidate)
							&& (
								dateFormatTester(maxDateCandidate as string)
								|| dateTimeFormatTester(maxDateCandidate as string)
							)
						)
						|| dateTester(maxDateCandidate)
					)) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.MAX_DATE_SHOULD_BE_DATE_OR_STRING),

							data: data,

							errorScheme: dateScheme,
							isSchemeError: true
						});
					}

					const effectiveMax: Date = new Date(maxDateCandidate);

					if (definedTester(dateScheme.exclusiveMax)) {
						if (!booleanTester(dateScheme.exclusiveMax)) {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN),

								data: data,

								errorScheme: dateScheme,
								isSchemeError: true
							});
						}
					}

					if (dateScheme.exclusiveMax) {
						if (!exclusiveMaxDateTester(valueAsDate, effectiveMax)) {
							result = new EjvError({
								type: ERROR_TYPE.BEFORE_DATE,
								message: createErrorMsg(ERROR_MESSAGE.BEFORE_DATE, {
									placeholders: [effectiveMax.toISOString()]
								}),

								data,
								path: _options.path,

								errorScheme: dateScheme,
								errorData: value
							});
							break;
						}
					}
					else {
						if (!maxDateTester(valueAsDate, effectiveMax)) {
							result = new EjvError({
								type: ERROR_TYPE.BEFORE_OR_SAME_DATE,
								message: createErrorMsg(ERROR_MESSAGE.BEFORE_OR_SAME_DATE, {
									placeholders: [effectiveMax.toISOString()]
								}),

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

			case DATA_TYPE.ARRAY: {
				const valueAsArray: unknown[] = value as unknown as unknown[];
				const arrayScheme: ArrayScheme = scheme as ArrayScheme;

				if (definedTester(arrayScheme.length)) {
					const length: number = arrayScheme.length;

					if (!(numberTester(length) && integerTester(length))) {
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: arrayScheme,
							isSchemeError: true
						});
					}

					if (!lengthTester(valueAsArray, length)) {
						result = new EjvError({
							type: ERROR_TYPE.LENGTH,
							message: createErrorMsg(ERROR_MESSAGE.LENGTH, {
								placeholders: ['' + length]
							}),

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
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.MIN_LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: arrayScheme,
							isSchemeError: true
						});
					}

					if (!minLengthTester(valueAsArray, minLength)) {
						result = new EjvError({
							type: ERROR_TYPE.MIN_LENGTH,
							message: createErrorMsg(ERROR_MESSAGE.MIN_LENGTH, {
								placeholders: ['' + minLength]
							}),

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
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.MAX_LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: arrayScheme,
							isSchemeError: true
						});
					}

					if (!maxLengthTester(valueAsArray, maxLength)) {
						result = new EjvError({
							type: ERROR_TYPE.MAX_LENGTH,
							message: createErrorMsg(ERROR_MESSAGE.MAX_LENGTH, {
								placeholders: ['' + maxLength]
							}),

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
						return new EjvError({
							type: ERROR_TYPE.INVALID_SCHEMES,
							message: createErrorMsg(ERROR_MESSAGE.UNIQUE_SHOULD_BE_BOOLEAN),

							data: data,

							errorScheme: arrayScheme,
							isSchemeError: true
						});
					}

					if (arrayScheme.unique && !uniqueItemsTester(valueAsArray)) {
						result = new EjvError({
							type: ERROR_TYPE.UNIQUE_ITEMS,
							message: ERROR_MESSAGE.UNIQUE_ITEMS,

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
						const now: Date = new Date();
						const tempKeyArr: string[] = valueAsArray.map((_value: unknown, i: number): string => {
							return '' + (+now + i);
						});

						if (stringTester(arrayScheme.items) // by DataType
							|| (arrayTester(arrayScheme.items) && arrayTypeOfTester(arrayScheme.items as DATA_TYPE[], DATA_TYPE.STRING)) // by DataType[]
						) {
							const itemTypes: DATA_TYPE[] = (arrayTester(arrayScheme.items)
								? arrayScheme.items
								: [arrayScheme.items]) as DATA_TYPE[];

							const itemTypeError: string | undefined = itemTypes.find((type: DATA_TYPE): boolean => {
								return !definedTester(type)
									|| !stringTester(type)
									|| !enumTester(type, allDataType);
							});

							if (itemTypeError) {
								return new EjvError({
									type: ERROR_TYPE.INVALID_SCHEMES,
									message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_INVALID_TYPE, {
										placeholders: [itemTypeError]
									}),

									data: data,

									errorScheme: scheme,
									isSchemeError: true
								});
							}


							const partialData: AnyObject = {};
							const partialSchemes: Scheme[] = [];

							tempKeyArr.forEach((tempKey: string, i: number): void => {
								partialData[tempKey] = valueAsArray[i];
								partialSchemes.push({
									key: tempKey,
									type: itemTypes
								});
							});

							scheme.parent = arrayScheme;

							// call recursively
							const partialResult: EjvError | null = _ejv(partialData, partialSchemes, _options);

							// convert new EjvError
							if (partialResult) {
								let errorMsg: string;

								if (arrayTester(arrayScheme.items)) {
									errorMsg = createErrorMsg(ERROR_MESSAGE.ITEMS_TYPE, {
										placeholders: [JSON.stringify(itemTypes)]
									});
								}
								else {
									errorMsg = createErrorMsg(ERROR_MESSAGE.ITEMS_TYPE, {
										placeholders: [arrayScheme.items as string]
									});
								}

								const partialKeys: string[] = (partialResult.path || '').split('/');
								const partialKey: string = partialKeys[partialKeys.length - 1];

								const partialScheme: Scheme = partialSchemes.find((_scheme: Scheme): boolean => {
									return _scheme.key === partialKey;
								}) as Scheme;

								const partialKeyIndex: number = partialSchemes.indexOf(partialScheme);

								result = new EjvError({
									type: ERROR_TYPE.ITEMS_TYPE,
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
							|| (arrayTester(arrayScheme.items) && arrayTypeOfTester(arrayScheme.items as Scheme[], DATA_TYPE.OBJECT)) // by Scheme[]
						) {
							const itemsAsSchemes: Scheme[] = arrayTester(arrayScheme.items)
								? arrayScheme.items
								: [arrayScheme.items] as Scheme[];

							let partialError: EjvError | null | undefined = null;

							// use for() instead of forEach() to break
							const valueLength: number = valueAsArray.length;

							for (let arrIndex = 0; arrIndex < valueLength; arrIndex++) {
								const oneValue: unknown = valueAsArray[arrIndex];

								const partialData: AnyObject = {};
								const partialSchemes: Scheme[] = [];

								const tempKeyForThisValue: string = tempKeyArr[arrIndex];

								partialData[tempKeyForThisValue] = oneValue;

								partialSchemes.push(...itemsAsSchemes.map((oneScheme: Scheme): Scheme => {
									const newScheme: Scheme = clone(oneScheme); // divide instance

									newScheme.key = tempKeyForThisValue;

									return newScheme;
								}));

								const partialResults: (EjvError | null)[] = partialSchemes.map((partialScheme: Scheme): EjvError | null => {
									// call recursively
									const partialResult: EjvError | null = _ejv(partialData, [partialScheme], _options);

									if (partialResult) {
										partialResult.path = (partialResult.path || '').replace(tempKeyForThisValue, '' + arrIndex);
									}

									return partialResult;
								});

								if (!partialResults.some((oneResult: EjvError | null): boolean => oneResult === null)) {
									partialError = partialResults.find((oneResult: EjvError | null): boolean => {
										return !!oneResult;
									}) as EjvError;
									break;
								}
							}

							if (partialError) {
								let errorType: ERROR_TYPE;
								let errorMsg: string;

								if (!!itemsAsSchemes && itemsAsSchemes.length > 1) {
									errorType = ERROR_TYPE.ITEMS_SCHEMES;
									errorMsg = createErrorMsg(ERROR_MESSAGE.ITEMS_SCHEMES, {
										placeholders: [JSON.stringify(itemsAsSchemes)]
									});
								}
								else {
									errorType = partialError.type;
									errorMsg = partialError.message;

									if (errorType === ERROR_TYPE.REQUIRED) {
										// REQUIRED in array is TYPE_MISMATCH except with nullable === true
										errorType = ERROR_TYPE.TYPE_MISMATCH;
										errorMsg = createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
											placeholders: [JSON.stringify(arrayScheme.items)]
										});
									}
								}

								result = new EjvError({
									type: errorType,
									message: errorMsg,

									data
								});

								if (errorType === ERROR_TYPE.INVALID_SCHEMES) {
									result.errorScheme = arrayScheme;
									result.isSchemeError = true;
									result.isDataError = false;
								}
								else {
									result.path = partialError.path;
									result.errorData = partialError.errorData;
								}
								break;
							}
						}
						else {
							return new EjvError({
								type: ERROR_TYPE.INVALID_SCHEMES,
								message: createErrorMsg(ERROR_MESSAGE.INVALID_ITEMS_SCHEME, {
									placeholders: [JSON.stringify(arrayScheme.items)]
								}),

								data: data,

								errorScheme: arrayScheme,
								isSchemeError: true
							});
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

	if (result !== null && definedTester(options.customErrorMsg)) {
		const customErrorMsgObj: {
			[key in ERROR_TYPE]?: string;
		} = options.customErrorMsg as {
			[key in ERROR_TYPE]?: string;
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
			type: ERROR_TYPE.NO_DATA,
			message: ERROR_MESSAGE.NO_DATA,

			data: data,
			path: undefined,

			errorScheme: undefined,
			errorData: data,

			isSchemeError: false
		});
	}

	const internalOption: InternalOptions = (options
		? {
			...options
		}
		: {}) as InternalOptions;

	if (!definedTester(internalOption.path)) {
		internalOption.path = [];
	}

	return _ejv(data, schemes, internalOption);
};
