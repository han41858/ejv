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
import { clone, createErrorMsg, xor } from './util';


function _checkSchemeWithNot (parentScheme: Scheme, notScheme: Scheme): void {
	// check contrary type
	if (parentScheme.type && notScheme.type) {
		const parentTypes: string[] = arrayTester(parentScheme.type)
			? parentScheme.type
			: [parentScheme.type];

		const notTypes: string[] = arrayTester(notScheme.type)
			? notScheme.type
			: [notScheme.type];

		parentTypes.forEach((parentType: string): void => {
			if (notTypes.includes(parentType)) {
				throw new Error(createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
					placeholders: [parentType]
				}));
			}
		});

		notTypes.forEach((notType: string): void => {
			if (parentTypes.includes(notType)) {
				throw new Error(createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
					placeholders: [notType]
				}));
			}
		});
	}


	// check contrary rule
	const aKeys: string[] = Object.keys(parentScheme);
	const bKeys: string[] = Object.keys(notScheme);

	const bothKeys: string[] = [...aKeys, ...bKeys].reduce((acc: string[], key: string): string[] => {
		if (!acc.includes(key) && aKeys.includes(key) && bKeys.includes(key)) {
			acc.push(key);
		}

		return acc;
	}, []);

	if (bothKeys.some((_key: string): boolean => {
		const key: keyof Scheme = _key as keyof Scheme;

		return !!parentScheme[key]
			&& !!notScheme[key]
			&& parentScheme[key] === notScheme[key]; // should be different
	})) {
		throw new Error(createErrorMsg(ErrorMsg.SCHEMES_HAS_RULES_CONTRARY));
	}
}

function _isNotSchemeEffective (scheme: Scheme[] | Scheme): boolean {
	function _isNotSchemeEffectiveAtom (_scheme: Scheme): boolean {
		const keys: (keyof Scheme)[] = Object.keys(_scheme) as (keyof Scheme)[];

		const effectiveKeys: (keyof Scheme)[] = keys.filter((key: keyof Scheme): boolean => {
			let isEffective: boolean;

			if ('exclusiveMin' in _scheme) {
				// !== true, because this context is in not
				isEffective = _scheme.exclusiveMin !== true;
			}
			else if ('exclusiveMax' in _scheme) {
				// !== true, because this context is in not
				isEffective = _scheme.exclusiveMax !== true;
			}
			else {
				isEffective = _scheme[key] !== undefined;
			}

			return isEffective;
		});

		return effectiveKeys.length > 0;
	}

	return arrayTester(scheme)
		? scheme.some((oneScheme: Scheme): boolean => {
			return _isNotSchemeEffectiveAtom(oneScheme);
		})
		: _isNotSchemeEffectiveAtom(scheme);
}

function _extendsNotScheme (key: string, parentScheme: Scheme, notScheme: Scheme): Scheme {
	// check duplicated rule
	_checkSchemeWithNot(parentScheme, notScheme);

	const newScheme: Scheme = clone(notScheme, true);
	newScheme.key = key;

	return newScheme;
}

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
	console.warn('_ejv() %o', { data, schemes, options });

	// check schemes
	if (!arrayTester(schemes)) {
		throw new Error(createErrorMsg(ErrorMsg.NO_ARRAY_SCHEME));
	}

	if (!arrayTypeOfTester(schemes, DataType.OBJECT)) {
		throw new Error(createErrorMsg(ErrorMsg.NO_OBJECT_ARRAY_SCHEME));
	}

	if (!minLengthTester(schemes, 1)) {
		throw new Error(createErrorMsg(ErrorMsg.EMPTY_SCHEME));
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

		// only care effective 'not' scheme
		if (!(definedTester(scheme.not) && _isNotSchemeEffective(scheme.not))) {
			const types: DataType[] | undefined = _getEffectiveTypes(scheme);

			if (!definedTester(types)) {
				throw new Error(createErrorMsg(ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE));
			}


			const allDataType: DataType[] = Object.values(DataType);

			const typeError: string | undefined = types.find((type: DataType): boolean => {
				return !definedTester(type)
					|| !stringTester(type)
					|| !enumTester(type, allDataType);
			});

			if (typeError) {
				throw new Error(createErrorMsg(ErrorMsg.SCHEMES_HAS_INVALID_TYPE, {
					placeholders: [typeError]
				}));
			}

			if (!uniqueItemsTester(types)) {
				throw new Error(createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE));
			}

			if (!definedTester(value)) {
				if (xor(scheme.optional !== true, _options.reverse)) {
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
						if (xor(scheme.type !== typeResolved, _options.reverse)) {
							result = new EjvError({
								type: ErrorType.TYPE_MISMATCH,
								message: createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
									placeholders: [scheme.type],
									reverse: _options.reverse
								}),

								data,
								path: _options.path,

								errorScheme: scheme,
								errorData: value
							});
						}
					}
					else {
						if (_options.reverse) {
							if (scheme.type.includes(typeResolved)) {
								result = new EjvError({
									type: ErrorType.TYPE_MISMATCH_ONE_OF,
									message: createErrorMsg(ErrorMsg.TYPE_MISMATCH_ONE_OF, {
										placeholders: [JSON.stringify(scheme.type)],
										reverse: _options.reverse
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
										placeholders: [JSON.stringify(scheme.type)],
										reverse: _options.reverse
									}),

									data,
									path: _options.path,

									errorScheme: scheme,
									errorData: value
								});
							}
						}


					}
				}
				// else do additional validation
			}
			else {
				if (_options.reverse) {
					// type not resolved, but ok with reverse
					continue;
				}
				else {
					// type not resolved, and reverse failed
					const typesForMsg: AllDataType = scheme.type || scheme.parent?.type as AllDataType;

					if (!arrayTester(typesForMsg)) {
						result = new EjvError({
							type: ErrorType.TYPE_MISMATCH,
							message: createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
								placeholders: [typesForMsg],
								reverse: _options.reverse
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
								placeholders: [JSON.stringify(typesForMsg)],
								reverse: _options.reverse
							}),

							data,
							path: _options.path,

							errorScheme: scheme,
							errorData: value
						});
					}

					break;
				}
			}

			// additional check for type resolved
			switch (typeResolved) {
				case DataType.NUMBER: {
					const valueAsNumber: number = value as unknown as number;
					const numberScheme: NumberScheme = scheme as NumberScheme;

					if (definedTester(numberScheme.enum)) {
						if (!arrayTester(numberScheme.enum)) {
							throw new Error(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
						}

						const enumArr: number[] = numberScheme.enum;

						if (!arrayTypeOfTester(enumArr, DataType.NUMBER)) {
							throw new Error(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_NUMBERS));
						}

						if (xor(!enumTester(valueAsNumber, enumArr), _options.reverse)) {
							result = new EjvError({
								type: ErrorType.ONE_OF,
								message: createErrorMsg(ErrorMsg.ONE_OF, {
									placeholders: [JSON.stringify(enumArr)],
									reverse: _options.reverse
								}),

								data,
								path: _options.path,

								errorScheme: numberScheme,
								errorData: value
							});
							break;
						}
					}

					// TODO?
					// const internalNumberScheme: MinMaxWithLevel<number> = evaluateEffectiveScheme(scheme);
					// console.log({internalNumberScheme});

					if (
						definedTester(numberScheme.min)
						|| definedTester((scheme.parent as NumberScheme)?.min)
					) {
						const effectiveMin: number = numberScheme.min || (scheme.parent as NumberScheme)?.min as number;

						if (!numberTester(effectiveMin)) {
							throw new Error(createErrorMsg(ErrorMsg.MIN_SHOULD_BE_NUMBER));
						}

						if (definedTester(numberScheme.exclusiveMin)) {
							if (!booleanTester(numberScheme.exclusiveMin)) {
								throw new Error(createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN));
							}
						}

						const effectiveExclusive: boolean = xor(_options.reverse, numberScheme.exclusiveMin || false);

						if (effectiveExclusive) {
							if (!_options.reverse) {
								console.log('min 1');

								if (!exclusiveMinNumberTester(valueAsNumber, effectiveMin)) {
									result = new EjvError({
										type: ErrorType.BIGGER_THAN,
										message: createErrorMsg(ErrorMsg.BIGGER_THAN, {
											placeholders: [effectiveMin],
											reverse: _options.reverse
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
								console.log('min 2');

								if (!exclusiveMaxNumberTester(valueAsNumber, effectiveMin)) {
									result = new EjvError({
										type: ErrorType.SMALLER_THAN,
										message: createErrorMsg(ErrorMsg.SMALLER_THAN, {
											placeholders: [effectiveMin],
											reverse: _options.reverse
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
						else {
							if (!_options.reverse) {
								console.log('min 3');

								if (!minNumberTester(valueAsNumber, effectiveMin)) {
									result = new EjvError({
										type: ErrorType.BIGGER_THAN_OR_EQUAL,
										message: createErrorMsg(ErrorMsg.BIGGER_THAN_OR_EQUAL, {
											placeholders: [effectiveMin],
											reverse: _options.reverse
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
								console.log('min 4');

								if (!maxNumberTester(valueAsNumber, effectiveMin)) {
									result = new EjvError({
										type: ErrorType.SMALLER_THAN_OR_EQUAL,
										message: createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
											placeholders: [effectiveMin],
											reverse: _options.reverse
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
					}

					if (definedTester(numberScheme.max)
						|| definedTester((scheme.parent as NumberScheme)?.max)) {
						const effectiveMax: number = numberScheme.max || (scheme.parent as NumberScheme)?.max as number;

						if (!numberTester(effectiveMax)) {
							throw new Error(createErrorMsg(ErrorMsg.MAX_SHOULD_BE_NUMBER));
						}

						if (definedTester(numberScheme.exclusiveMax)) {
							if (!booleanTester(numberScheme.exclusiveMax)) {
								throw new Error(createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN));
							}
						}

						const effectiveExclusive: boolean = xor(_options.reverse, numberScheme.exclusiveMax || false);

						if (effectiveExclusive) {
							if (!_options.reverse) {
								if (!exclusiveMaxNumberTester(valueAsNumber, effectiveMax)) {
									result = new EjvError({
										type: ErrorType.SMALLER_THAN,
										message: createErrorMsg(ErrorMsg.SMALLER_THAN, {
											placeholders: [effectiveMax],
											reverse: _options.reverse
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
								if (!exclusiveMinNumberTester(valueAsNumber, effectiveMax)) {
									result = new EjvError({
										type: ErrorType.BIGGER_THAN,
										message: createErrorMsg(ErrorMsg.BIGGER_THAN, {
											placeholders: [effectiveMax],
											reverse: _options.reverse
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
						else {
							if (!_options.reverse) {
								if (!maxNumberTester(valueAsNumber, effectiveMax)) {
									result = new EjvError({
										type: ErrorType.SMALLER_THAN_OR_EQUAL,
										message: createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
											placeholders: [effectiveMax],
											reverse: _options.reverse
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
								if (!minNumberTester(valueAsNumber, effectiveMax)) {
									result = new EjvError({
										type: ErrorType.BIGGER_THAN_OR_EQUAL,
										message: createErrorMsg(ErrorMsg.BIGGER_THAN_OR_EQUAL, {
											placeholders: [effectiveMax],
											reverse: _options.reverse
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
					}

					if (definedTester(numberScheme.format)) {
						let formats: NumberFormat[];

						const allNumberFormat: NumberFormat[] = Object.values(NumberFormat);

						if (!arrayTester(numberScheme.format)) {
							const formatAsString: NumberFormat = numberScheme.format as NumberFormat;

							if (!enumTester(formatAsString, allNumberFormat)) {
								throw new Error(createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
									placeholders: [formatAsString]
								}));
							}

							formats = [numberScheme.format as NumberFormat];
						}
						else {
							const formatAsArray: NumberFormat[] = numberScheme.format as NumberFormat[];

							const errorFormat: string | undefined = formatAsArray.find((format: NumberFormat): boolean => {
								return !enumTester(format, allNumberFormat);
							});

							if (errorFormat) {
								throw new Error(createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
									placeholders: [errorFormat]
								}));
							}

							formats = numberScheme.format as NumberFormat[];
						}

						const someFormatIsWrong: boolean = formats.some((format: NumberFormat): boolean => {
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
						});

						if (!xor(someFormatIsWrong, _options.reverse)) {
							if (!arrayTester(numberScheme.format)) {
								result = new EjvError({
									type: ErrorType.FORMAT,
									message: createErrorMsg(ErrorMsg.FORMAT, {
										placeholders: [numberScheme.format],
										reverse: _options.reverse
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
										placeholders: [JSON.stringify(numberScheme.format)],
										reverse: _options.reverse
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
							throw new Error(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
						}

						const enumArr: string[] = stringScheme.enum;

						if (!arrayTypeOfTester(enumArr, DataType.STRING)) {
							throw new Error(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_STRINGS));
						}

						if (xor(!enumTester(valueAsString, enumArr), _options.reverse)) {
							result = new EjvError({
								type: ErrorType.ONE_OF,
								message: createErrorMsg(ErrorMsg.ONE_OF, {
									placeholders: [JSON.stringify(stringScheme.enum)],
									reverse: _options.reverse
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
							throw new Error(createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
						}

						if (xor(!lengthTester(valueAsString, length), _options.reverse)) {
							result = new EjvError({
								type: ErrorType.LENGTH,
								message: createErrorMsg(ErrorMsg.LENGTH, {
									placeholders: [length],
									reverse: _options.reverse
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
							throw new Error(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
						}

						if (xor(!minLengthTester(valueAsString, minLength), _options.reverse)) {
							result = new EjvError({
								type: ErrorType.MIN_LENGTH,
								message: createErrorMsg(ErrorMsg.MIN_LENGTH, {
									placeholders: ['' + minLength],
									reverse: _options.reverse
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
							throw new Error(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
						}

						if (xor(!maxLengthTester(valueAsString, maxLength), _options.reverse)) {
							result = new EjvError({
								type: ErrorType.MAX_LENGTH,
								message: createErrorMsg(ErrorMsg.MAX_LENGTH, {
									placeholders: ['' + maxLength],
									reverse: _options.reverse
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
								throw new Error(createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
									placeholders: [formatAsString]
								}));
							}

							formats = [stringScheme.format] as StringFormat[];
						}
						else {
							const formatAsArray: string[] = stringScheme.format;
							const errorFormat: string | undefined = formatAsArray.find((format: string): boolean => {
								return !enumTester(format, allStringFormat);
							});

							if (errorFormat) {
								throw new Error(createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
									placeholders: [errorFormat]
								}));
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

						if (xor(!foundFormatMatching, _options.reverse)) {
							if (!arrayTester(stringScheme.format)) {
								result = new EjvError({
									type: ErrorType.FORMAT,
									message: createErrorMsg(ErrorMsg.FORMAT, {
										placeholders: [stringScheme.format as StringFormat],
										reverse: _options.reverse
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
										placeholders: [JSON.stringify(stringScheme.format)],
										reverse: _options.reverse
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
							throw new Error(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
								placeholders: ['null']
							}));
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
								throw new Error(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
									placeholders: [createArrayErrorMsg(patternsAsArray)]
								}));
							}

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

							if (xor(!foundMatchPattern, _options.reverse)) {
								result = new EjvError({
									type: ErrorType.PATTERN_ONE_OF,
									message: createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
										placeholders: [createArrayErrorMsg(patternsAsArray)],
										reverse: _options.reverse
									}),

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
								throw new Error(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
									placeholders: [patternToString(patternAsOne)]
								}));
							}

							// check value
							const regExp: RegExp = new RegExp(patternAsOne);

							if (xor(!stringRegExpTester(valueAsString, regExp), _options.reverse)) {
								result = new EjvError({
									type: ErrorType.PATTERN,
									message: createErrorMsg(ErrorMsg.PATTERN, {
										placeholders: [patternToString(patternAsOne)],
										reverse: _options.reverse
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
							throw new Error(createErrorMsg(ErrorMsg.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN));
						}

						if (xor(!objectScheme.allowNoProperty, _options.reverse) && !hasPropertyTester(valueAsObject)) {
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
							throw new Error(createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY));
						}

						const properties: Scheme[] = objectScheme.properties as Scheme[];

						if (!minLengthTester(properties, 1)) {
							throw new Error(createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_HAVE_ITEMS));
						}

						if (!arrayTypeOfTester(properties, DataType.OBJECT)) {
							throw new Error(createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT));
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

						if (_options.reverse) {
							if (!result) {
								if (definedTester(scheme.type)) {
									if (!arrayTester(scheme.type)) {
										result = new EjvError({
											type: ErrorType.TYPE_MISMATCH,
											message: createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
												placeholders: [scheme.type],
												reverse: true
											}),
											data,
											path: _options.path,

											errorScheme: objectScheme,
											errorData: value
										});
									}
									else {
										result = new EjvError({
											type: ErrorType.TYPE_MISMATCH_ONE_OF,
											message: createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
												placeholders: [JSON.stringify(scheme.type)],
												reverse: true
											}),
											data,
											path: _options.path,

											errorScheme: objectScheme,
											errorData: value
										});
									}
								}

							}
							// else {
							// 	result = null;
							// }
						}
						else if (result) {
							// inject original data
							result.data = data;
						}


						// if (result) {
						// 	// inject original data
						// 	result.data = data;
						// }
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
							throw new Error(createErrorMsg(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING));
						}

						const effectiveMin: Date = new Date(minDateCandidate);

						if (definedTester(dateScheme.exclusiveMin)) {
							if (!booleanTester(dateScheme.exclusiveMin)) {
								throw new Error(createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN));
							}


							const effectiveExclusive: boolean = xor(_options.reverse, dateScheme.exclusiveMin);

							if (effectiveExclusive) {
								if (!exclusiveMinDateTester(valueAsDate, effectiveMin)) {
									result = new EjvError({
										type: ErrorType.AFTER_DATE,
										message: createErrorMsg(ErrorMsg.AFTER_DATE, {
											placeholders: [effectiveMin.toISOString()]
											// no reverse because of effectiveExclusive
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
											// no reverse because of effectiveExclusive
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
							if (xor(!minDateTester(valueAsDate, effectiveMin), _options.reverse)) {
								result = new EjvError({
									type: ErrorType.AFTER_OR_SAME_DATE,
									message: createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
										placeholders: [effectiveMin.toISOString()],
										reverse: _options.reverse
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
							throw new Error(createErrorMsg(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING));
						}

						const effectiveMax: Date = new Date(maxDateCandidate);

						console.warn('defined: ', definedTester(dateScheme.exclusiveMax));


						if (definedTester(dateScheme.exclusiveMax)) {
							if (!booleanTester(dateScheme.exclusiveMax)) {
								throw new Error(createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN));
							}
						}

						const effectiveExclusive: boolean = xor(_options.reverse, dateScheme.exclusiveMax || false);
						console.warn({ effectiveExclusive });


						if (effectiveExclusive) {
							if (!exclusiveMaxDateTester(valueAsDate, effectiveMax)) {
								result = new EjvError({
									type: ErrorType.BEFORE_DATE,
									message: createErrorMsg(ErrorMsg.BEFORE_DATE, {
										placeholders: [effectiveMax.toISOString()]
										// no reverse because of effectiveExclusive
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
										// no reverse because of effectiveExclusive
									}),

									data,
									path: _options.path,

									errorScheme: dateScheme,
									errorData: value
								});
								break;
							}
						}
						// }
						// else {
						// 	if (xor(!maxDateTester(valueAsDate, effectiveMax), _options.reverse)) {
						// 		result = new EjvError({
						// 			type: ErrorType.BEFORE_OR_SAME_DATE,
						// 			message: createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
						// 				placeholders: [effectiveMax.toISOString()],
						// 				reverse: _options.reverse
						// 			}),
						//
						// 			data,
						// 			path: _options.path,
						//
						// 			errorScheme: dateScheme,
						// 			errorData: value
						// 		});
						// 		break;
						// 	}
						// }
					}
					break;
				}

				case DataType.ARRAY: {
					const valueAsArray: unknown[] = value as unknown as unknown[];
					const arrayScheme: ArrayScheme = scheme as ArrayScheme;

					if (definedTester(arrayScheme.length)) {
						const length: number = arrayScheme.length;

						if (!(numberTester(length) && integerTester(length))) {
							throw new Error(createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
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
							throw new Error(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
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
							throw new Error(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
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
							throw new Error(createErrorMsg(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN));
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

									const partialKeys: string[] = partialResult.path.split('/');
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
											partialResult.path = partialResult.path.replace(tempKeyForThisValue, '' + arrIndex);
										}

										return partialResult;
									});

									if (!partialResults.some((oneResult: EjvError | null): boolean => oneResult === null)) {
										partialError = partialResults.find((oneResult: EjvError | null): boolean => {
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

										data,
										path: partialError.path.split('/'),

										errorScheme: partialError.errorScheme,
										errorData: partialError.errorData
									});
									break;
								}
							}
							else {
								throw new Error(createErrorMsg(ErrorMsg.INVALID_ITEMS_SCHEME, {
									placeholders: [JSON.stringify(arrayScheme.items)]
								}));
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
			const optionsForNot: InternalOptions = clone(options);
			optionsForNot.reverse = !optionsForNot.reverse;
			scheme.parent = Object.entries(scheme).reduce((acc: Scheme, [_key, _value]): Scheme => {
				if (_key !== 'not') {
					const asKey: keyof Scheme = _key as keyof Scheme;

					if (scheme[asKey] !== undefined) {
						acc[asKey] = _value;
					}
				}

				return acc;
			}, {});


			const tempKey: string = '' + +new Date();

			const notSchemes: Scheme[] = arrayTester(scheme.not)
				? scheme.not
				: [scheme.not];

			const newSchemes: Scheme[] = notSchemes
				.map((one: Scheme): Scheme => {
					// check duplicated rule
					_checkSchemeWithNot(scheme, one);

					const newScheme: Scheme = clone(one); // no sanitize, need null
					newScheme.key = tempKey;

					// remove not effective values: undefined
					Object.keys(newScheme).forEach((_key: string): void => {
						const newSchemeAsObj: AnyObject = newScheme as AnyObject;

						if (newSchemeAsObj[_key] === undefined) {
							delete newSchemeAsObj[_key];
						}
					});

					return newScheme;
				})
				.filter((newScheme: Scheme): boolean => {
					return Object
						.keys(newScheme)
						// 'key' exists always
						.filter((_key: string): boolean => _key !== 'key')
						.length > 0;
				});

			console.log('newSchemes :', newSchemes);

			if (newSchemes.length > 0) {
				// has effective not schemes
				result = _ejv({
					[tempKey]: value
				}, newSchemes, optionsForNot);

				if (result) {
					// replace data for not
					result.data = data;
					result.path = result.path.replace(tempKey, key as string);
					delete result.errorScheme.key;

					// wrap with 'not'
					result.errorScheme = {
						not: result.errorScheme
					};
				}
			}
			else {
				// has no effective scheme
				const newScheme: Scheme = clone(scheme);
				delete newScheme.not;

				result = _ejv({
					[key]: value
				}, [newScheme], options);
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
			path: ['/'],

			errorScheme: schemes,
			errorData: data
		});
	}

	// check schemes itself
	if (!definedTester(schemes) || schemes === null) {
		throw new Error(createErrorMsg(ErrorMsg.NO_SCHEME));
	}

	if (!arrayTester(schemes)) {
		throw new Error(createErrorMsg(ErrorMsg.NO_ARRAY_SCHEME));
	}

	if (!arrayTypeOfTester(schemes, DataType.OBJECT)) {
		throw new Error(createErrorMsg(ErrorMsg.NO_OBJECT_ARRAY_SCHEME));
	}

	if (!minLengthTester(schemes, 1)) {
		throw new Error(createErrorMsg(ErrorMsg.EMPTY_SCHEME));
	}


	const internalOption: InternalOptions = (options
		? {
			...options
		}
		: {}) as InternalOptions;

	if (!definedTester(internalOption.path)) {
		internalOption.path = [];
	}

	if (!definedTester(internalOption.reverse)) {
		internalOption.reverse = false;
	}


	return _ejv(data, schemes, internalOption);
};
