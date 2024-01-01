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
import { DataType, ErrorMsg, ErrorType, NumberFormat, StringFormat } from './constants';

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
import { clone, createErrorMsg, sift } from './util';


function _getEffectiveTypes (scheme: Scheme): DataType[] | undefined {
	let result: DataType[] | undefined;

	if (definedTester(scheme.type)) {
		result = (arrayTester(scheme.type)
			? scheme.type
			: [scheme.type]) as DataType[];
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
			type: ErrorType.NO_SCHEME,
			message: ErrorMsg.NO_SCHEME,

			data: data,

			errorScheme: schemes,
			isSchemeError: true
		});
	}

	if (!arrayTester(schemes)) {
		return new EjvError({
			type: ErrorType.INVALID_SCHEMES,
			message: ErrorMsg.NO_ARRAY_SCHEME,

			data: data,

			errorScheme: schemes,
			isSchemeError: true
		});
	}

	if (!arrayTypeOfTester(schemes, DataType.OBJECT)) {
		return new EjvError({
			type: ErrorType.INVALID_SCHEMES,
			message: ErrorMsg.NO_OBJECT_ARRAY_SCHEME,

			data: data,

			errorScheme: schemes,
			isSchemeError: true
		});
	}

	if (!minLengthTester(schemes, 1)) {
		return new EjvError({
			type: ErrorType.INVALID_SCHEMES,
			message: ErrorMsg.EMPTY_SCHEME,

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

		const types: DataType[] | undefined = _getEffectiveTypes(scheme);

		if (!definedTester(types)) {
			return new EjvError({
				type: ErrorType.INVALID_SCHEMES,
				message: ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE,

				data: data,

				errorScheme: scheme,
				isSchemeError: true
			});
		}


		const allDataType: DataType[] = Object.values(DataType);

		const typeError: string | undefined = types.find((type: DataType): boolean => {
			return !definedTester(type)
				|| !stringTester(type)
				|| !enumTester(type, allDataType);
		});

		if (typeError) {
			return new EjvError({
				type: ErrorType.INVALID_SCHEMES,
				message: createErrorMsg(ErrorMsg.SCHEMES_HAS_INVALID_TYPE, {
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
				type: ErrorType.INVALID_SCHEMES,
				message: createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
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
					type: ErrorType.REQUIRED,
					message: createErrorMsg(ErrorMsg.REQUIRED),

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
					message: createErrorMsg(ErrorMsg.REQUIRED),

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

		const typeResolved: DataType | undefined = types.find((type: DataType): type is DataType => {
			return typeTester(value, type);
		});

		if (typeResolved) {
			if (definedTester(scheme.type)) {
				if (!arrayTester(scheme.type)) {
					if (scheme.type !== typeResolved) {
						result = new EjvError({
							type: ErrorType.TYPE_MISMATCH,
							message: createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
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
							type: ErrorType.TYPE_MISMATCH_ONE_OF,
							message: createErrorMsg(ErrorMsg.TYPE_MISMATCH_ONE_OF, {
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
					type: ErrorType.TYPE_MISMATCH,
					message: createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
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
					type: ErrorType.TYPE_MISMATCH_ONE_OF,
					message: createErrorMsg(ErrorMsg.TYPE_MISMATCH_ONE_OF, {
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
			case DataType.NUMBER: {
				const valueAsNumber: number = value as unknown as number;
				const numberScheme: NumberScheme = scheme as NumberScheme;

				if (definedTester(numberScheme.enum)) {
					if (!arrayTester(numberScheme.enum)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					const enumArr: number[] = numberScheme.enum;

					if (!arrayTypeOfTester(enumArr, DataType.NUMBER)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_NUMBERS),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					if (!enumTester(valueAsNumber, enumArr)) {
						result = new EjvError({
							type: ErrorType.ONE_VALUE_OF,
							message: createErrorMsg(ErrorMsg.ONE_VALUE_OF, {
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
					const effectiveMin: number = numberScheme.min || (scheme.parent as NumberScheme)?.min as number;

					if (!numberTester(effectiveMin)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.MIN_SHOULD_BE_NUMBER),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					if (definedTester(numberScheme.exclusiveMin)) {
						if (!booleanTester(numberScheme.exclusiveMin)) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN),

								data: data,

								errorScheme: numberScheme,
								isSchemeError: true
							});
						}
					}

					if (numberScheme.exclusiveMin) {
						if (!exclusiveMinNumberTester(valueAsNumber, effectiveMin)) {
							result = new EjvError({
								type: ErrorType.BIGGER_THAN,
								message: createErrorMsg(ErrorMsg.BIGGER_THAN, {
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
								type: ErrorType.BIGGER_THAN_OR_EQUAL,
								message: createErrorMsg(ErrorMsg.BIGGER_THAN_OR_EQUAL, {
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
					const effectiveMax: number = numberScheme.max || (scheme.parent as NumberScheme)?.max as number;

					if (!numberTester(effectiveMax)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.MAX_SHOULD_BE_NUMBER),

							data: data,

							errorScheme: numberScheme,
							isSchemeError: true
						});
					}

					if (definedTester(numberScheme.exclusiveMax)) {
						if (!booleanTester(numberScheme.exclusiveMax)) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN),

								data: data,

								errorScheme: numberScheme,
								isSchemeError: true
							});
						}
					}

					if (numberScheme.exclusiveMax) {
						if (!exclusiveMaxNumberTester(valueAsNumber, effectiveMax)) {
							result = new EjvError({
								type: ErrorType.SMALLER_THAN,
								message: createErrorMsg(ErrorMsg.SMALLER_THAN, {
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
								type: ErrorType.SMALLER_THAN_OR_EQUAL,
								message: createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
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
					let formats: NumberFormat[];

					const allNumberFormat: NumberFormat[] = Object.values(NumberFormat);

					if (!arrayTester(numberScheme.format)) {
						const formatAsString: NumberFormat = numberScheme.format as NumberFormat;

						if (!enumTester(formatAsString, allNumberFormat)) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
									placeholders: [formatAsString]
								}),

								data: data,

								errorScheme: numberScheme,
								isSchemeError: true
							});
						}

						formats = [numberScheme.format as NumberFormat];
					}
					else {
						const formatAsArray: NumberFormat[] = numberScheme.format as NumberFormat[];

						const errorFormat: string | undefined = formatAsArray.find((format: NumberFormat): boolean => {
							return !enumTester(format, allNumberFormat);
						});

						if (errorFormat) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
									placeholders: [errorFormat]
								}),

								data: data,

								errorScheme: numberScheme,
								isSchemeError: true
							});
						}

						formats = numberScheme.format as NumberFormat[];
					}

					const someFormatIsWrong: boolean = formats.some((format: NumberFormat): boolean => {
						let valid: boolean = false;

						switch (format) {
							case NumberFormat.INTEGER:
								valid = integerTester(valueAsNumber);
								break;

							case NumberFormat.INDEX:
								valid = indexTester(valueAsNumber);
								break;
						}

						return valid;
					});

					if (!someFormatIsWrong) {
						if (!arrayTester(numberScheme.format)) {
							result = new EjvError({
								type: ErrorType.FORMAT,
								message: createErrorMsg(ErrorMsg.FORMAT, {
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
								type: ErrorType.FORMAT_ONE_OF,
								message: createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
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

			case DataType.STRING: {
				const valueAsString: string = value as unknown as string;
				const stringScheme: StringScheme = scheme as StringScheme;

				if (definedTester(stringScheme.enum)) {
					if (!arrayTester(stringScheme.enum)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					const enumArr: string[] = stringScheme.enum;

					if (!arrayTypeOfTester(enumArr, DataType.STRING)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_STRINGS),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!enumTester(valueAsString, enumArr)) {
						result = new EjvError({
							type: ErrorType.ONE_VALUE_OF,
							message: createErrorMsg(ErrorMsg.ONE_VALUE_OF, {
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

				if (definedTester(stringScheme.length)) {
					const length: number = stringScheme.length;

					if (!(numberTester(length) && integerTester(length))) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!lengthTester(valueAsString, length)) {
						result = new EjvError({
							type: ErrorType.LENGTH,
							message: createErrorMsg(ErrorMsg.LENGTH, {
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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!minLengthTester(valueAsString, minLength)) {
						result = new EjvError({
							type: ErrorType.MIN_LENGTH,
							message: createErrorMsg(ErrorMsg.MIN_LENGTH, {
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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: stringScheme,
							isSchemeError: true
						});
					}

					if (!maxLengthTester(valueAsString, maxLength)) {
						result = new EjvError({
							type: ErrorType.MAX_LENGTH,
							message: createErrorMsg(ErrorMsg.MAX_LENGTH, {
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
					let formats: StringFormat[];

					const allStringFormat: StringFormat[] = Object.values(StringFormat);

					if (!arrayTester(stringScheme.format)) {
						const formatAsString: string = stringScheme.format;

						if (!enumTester(formatAsString, allStringFormat)) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
									placeholders: [formatAsString]
								}),

								data: data,

								errorScheme: stringScheme,
								isSchemeError: true
							});
						}

						formats = [stringScheme.format] as StringFormat[];
					}
					else {
						const formatAsArray: string[] = stringScheme.format;
						const errorFormat: string | undefined = formatAsArray.find((format: string): boolean => {
							return !enumTester(format, allStringFormat);
						});

						if (errorFormat) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
									placeholders: [errorFormat]
								}),

								data: data,

								errorScheme: stringScheme,
								isSchemeError: true
							});
						}

						formats = stringScheme.format as StringFormat[];
					}

					const foundFormatMatching: boolean = formats.some((format: StringFormat): boolean => {
						let valid: boolean = false;

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
					});

					if (!foundFormatMatching) {
						if (!arrayTester(stringScheme.format)) {
							result = new EjvError({
								type: ErrorType.FORMAT,
								message: createErrorMsg(ErrorMsg.FORMAT, {
									placeholders: [stringScheme.format as StringFormat]
								}),

								data,
								path: _options.path,

								errorScheme: stringScheme,
								errorData: value
							});
						}
						else {
							result = new EjvError({
								type: ErrorType.FORMAT_ONE_OF,
								message: createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
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
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
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
									throw new Error(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
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
									type: ErrorType.PATTERN_ONE_OF,
									message: createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
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
						catch (e: unknown) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
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
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
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
								type: ErrorType.PATTERN,
								message: createErrorMsg(ErrorMsg.PATTERN, {
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

			case DataType.OBJECT: {
				const valueAsObject: AnyObject = value as unknown as AnyObject;
				const objectScheme: ObjectScheme = scheme as ObjectScheme;

				if (definedTester(objectScheme.allowNoProperty)) {
					if (!booleanTester(objectScheme.allowNoProperty)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN),

							data: data,

							errorScheme: objectScheme,
							isSchemeError: true
						});
					}

					if (!objectScheme.allowNoProperty && !hasPropertyTester(valueAsObject)) {
						result = new EjvError({
							type: ErrorType.PROPERTY,
							message: ErrorMsg.PROPERTY,

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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY),

							data: data,

							errorScheme: objectScheme,
							isSchemeError: true
						});
					}

					const properties: Scheme[] = objectScheme.properties as Scheme[];

					if (!minLengthTester(properties, 1)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_HAVE_ITEMS),

							data: data,

							errorScheme: objectScheme,
							isSchemeError: true
						});
					}

					if (!arrayTypeOfTester(properties, DataType.OBJECT)) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT),

							data: data,

							errorScheme: objectScheme,
							isSchemeError: true
						});
					}

					if (!objectTester(value)) {
						result = new EjvError({
							type: ErrorType.TYPE_MISMATCH,
							message: createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
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

			case DataType.DATE: {
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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING),

							data: data,

							errorScheme: dateScheme,
							isSchemeError: true
						});
					}

					const effectiveMin: Date = new Date(minDateCandidate);

					if (definedTester(dateScheme.exclusiveMin)) {
						if (!booleanTester(dateScheme.exclusiveMin)) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN),

								data: data,

								errorScheme: dateScheme,
								isSchemeError: true
							});
						}


						if (dateScheme.exclusiveMin) {
							if (!exclusiveMinDateTester(valueAsDate, effectiveMin)) {
								result = new EjvError({
									type: ErrorType.AFTER_DATE,
									message: createErrorMsg(ErrorMsg.AFTER_DATE, {
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
									type: ErrorType.AFTER_OR_SAME_DATE,
									message: createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
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
								type: ErrorType.AFTER_OR_SAME_DATE,
								message: createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING),

							data: data,

							errorScheme: dateScheme,
							isSchemeError: true
						});
					}

					const effectiveMax: Date = new Date(maxDateCandidate);

					if (definedTester(dateScheme.exclusiveMax)) {
						if (!booleanTester(dateScheme.exclusiveMax)) {
							return new EjvError({
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN),

								data: data,

								errorScheme: dateScheme,
								isSchemeError: true
							});
						}
					}

					if (dateScheme.exclusiveMax) {
						if (!exclusiveMaxDateTester(valueAsDate, effectiveMax)) {
							result = new EjvError({
								type: ErrorType.BEFORE_DATE,
								message: createErrorMsg(ErrorMsg.BEFORE_DATE, {
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
								type: ErrorType.BEFORE_OR_SAME_DATE,
								message: createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
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

			case DataType.ARRAY: {
				const valueAsArray: unknown[] = value as unknown as unknown[];
				const arrayScheme: ArrayScheme = scheme as ArrayScheme;

				if (definedTester(arrayScheme.length)) {
					const length: number = arrayScheme.length;

					if (!(numberTester(length) && integerTester(length))) {
						return new EjvError({
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: arrayScheme,
							isSchemeError: true
						});
					}

					if (!lengthTester(valueAsArray, length)) {
						result = new EjvError({
							type: ErrorType.LENGTH,
							message: createErrorMsg(ErrorMsg.LENGTH, {
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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: arrayScheme,
							isSchemeError: true
						});
					}

					if (!minLengthTester(valueAsArray, minLength)) {
						result = new EjvError({
							type: ErrorType.MIN_LENGTH,
							message: createErrorMsg(ErrorMsg.MIN_LENGTH, {
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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER),

							data: data,

							errorScheme: arrayScheme,
							isSchemeError: true
						});
					}

					if (!maxLengthTester(valueAsArray, maxLength)) {
						result = new EjvError({
							type: ErrorType.MAX_LENGTH,
							message: createErrorMsg(ErrorMsg.MAX_LENGTH, {
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
							type: ErrorType.INVALID_SCHEMES,
							message: createErrorMsg(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN),

							data: data,

							errorScheme: arrayScheme,
							isSchemeError: true
						});
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
						const now: Date = new Date();
						const tempKeyArr: string[] = valueAsArray.map((_value: unknown, i: number): string => {
							return '' + (+now + i);
						});

						if (stringTester(arrayScheme.items) // by DataType
							|| (arrayTester(arrayScheme.items) && arrayTypeOfTester(arrayScheme.items as DataType[], DataType.STRING)) // by DataType[]
						) {
							const itemTypes: DataType[] = (arrayTester(arrayScheme.items)
								? arrayScheme.items
								: [arrayScheme.items]) as DataType[];

							const itemTypeError: string | undefined = itemTypes.find((type: DataType): boolean => {
								return !definedTester(type)
									|| !stringTester(type)
									|| !enumTester(type, allDataType);
							});

							if (itemTypeError) {
								return new EjvError({
									type: ErrorType.INVALID_SCHEMES,
									message: createErrorMsg(ErrorMsg.SCHEMES_HAS_INVALID_TYPE, {
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
									errorMsg = createErrorMsg(ErrorMsg.ITEMS_TYPE, {
										placeholders: [JSON.stringify(itemTypes)]
									});
								}
								else {
									errorMsg = createErrorMsg(ErrorMsg.ITEMS_TYPE, {
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
								let errorType: ErrorType;
								let errorMsg: string;

								if (!!itemsAsSchemes && itemsAsSchemes.length > 1) {
									errorType = ErrorType.ITEMS_SCHEMES;
									errorMsg = createErrorMsg(ErrorMsg.ITEMS_SCHEMES, {
										placeholders: [JSON.stringify(itemsAsSchemes)]
									});
								}
								else {
									errorType = partialError.type;
									errorMsg = partialError.message;

									if (errorType === ErrorType.REQUIRED) {
										// REQUIRED in array is TYPE_MISMATCH except with nullable === true
										errorType = ErrorType.TYPE_MISMATCH;
										errorMsg = createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
											placeholders: [JSON.stringify(arrayScheme.items)]
										});
									}
								}

								result = new EjvError({
									type: errorType,
									message: errorMsg,

									data
								});

								if (errorType === ErrorType.INVALID_SCHEMES) {
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
								type: ErrorType.INVALID_SCHEMES,
								message: createErrorMsg(ErrorMsg.INVALID_ITEMS_SCHEME, {
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
			type: ErrorType.NO_DATA,
			message: ErrorMsg.NO_DATA,

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
