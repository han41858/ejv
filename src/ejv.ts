import { AllDataType, AnyObject, EjvError, InternalOptions, Options, Scheme } from './interfaces';
import { DATA_TYPE, ERROR_MESSAGE, ERROR_TYPE } from './constants';
import {
	arrayTester,
	definedTester,
	minLengthTester,
	objectTester,
	typeTester,
	uniqueItemsTester
} from './tester';
import { createErrorMsg, sift } from './util';
import {
	invalidTypeIndex,
	invalidValueToString,
	schemeArrayTester,
	validateArray,
	validateBuffer,
	validateDate,
	validateNumber,
	validateObject,
	validateString,
	ValidatorContext,
	ValidatorResult
} from './validators';


// type of the scheme, or the nearest ancestor's type through parent
function _getEffectiveType (scheme: Scheme): AllDataType | undefined {
	if (definedTester(scheme.type)) {
		return scheme.type;
	}

	if (definedTester(scheme.parent)) {
		return _getEffectiveType(scheme.parent);
	}

	return undefined;
}

// boolean & regexp have no additional rule
const TYPE_VALIDATORS: Map<DATA_TYPE, (ctx: ValidatorContext) => ValidatorResult> = new Map([
	[DATA_TYPE.NUMBER, validateNumber],
	[DATA_TYPE.STRING, validateString],
	[DATA_TYPE.OBJECT, validateObject],
	[DATA_TYPE.DATE, validateDate],
	[DATA_TYPE.ARRAY, validateArray],
	[DATA_TYPE.BUFFER, validateBuffer]
]);

const _ejv = (data: AnyObject, schemes: Scheme[], options: InternalOptions): null | EjvError => {
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

	if (!schemeArrayTester(schemes)) {
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
		const key: string | undefined = scheme.key;

		// divide instance of path. other options are not changed while validating, so shallow copy is enough
		const _options: InternalOptions = {
			...options,
			path: [...options.path]
		};

		let value: unknown;

		if (key) {
			value = data[key];

			_options.path.push(key);
		}

		const effectiveType: AllDataType | undefined = _getEffectiveType(scheme);

		if (!definedTester(effectiveType)) {
			return new EjvError({
				type: ERROR_TYPE.INVALID_SCHEMES,
				message: ERROR_MESSAGE.SCHEMES_SHOULD_HAVE_TYPE,

				data: data,

				errorScheme: scheme,
				isSchemeError: true
			});
		}

		const types: DATA_TYPE[] = (arrayTester(effectiveType)
			? effectiveType
			: [effectiveType]) as DATA_TYPE[];

		// empty type list
		if (types.length === 0) {
			return new EjvError({
				type: ERROR_TYPE.INVALID_SCHEMES,
				message: ERROR_MESSAGE.SCHEMES_SHOULD_HAVE_TYPE,

				data: data,

				errorScheme: scheme,
				isSchemeError: true
			});
		}

		const typeErrorIndex: number = invalidTypeIndex(types);

		if (typeErrorIndex >= 0) {
			return new EjvError({
				type: ERROR_TYPE.INVALID_SCHEMES,
				message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_INVALID_TYPE, {
					placeholders: [invalidValueToString(types[typeErrorIndex])]
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

		if (!typeResolved) {
			// type is not resolved, message with the type used for resolving
			const typesForMsg: AllDataType = effectiveType;

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
		const validator: ((ctx: ValidatorContext) => ValidatorResult) | undefined = TYPE_VALIDATORS.get(typeResolved);

		if (validator) {
			const validatorResult: ValidatorResult = validator({
				data,
				value,
				scheme,
				options: _options,
				validate: _ejv
			});

			if (validatorResult) {
				result = validatorResult;
				break;
			}
		}
	}


	// customErrorMsg is for data errors. scheme errors keep their messages for debugging
	if (result !== null && result.isDataError && definedTester(options.customErrorMsg)) {
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

export function ejv (data: object, schemes: Scheme[], options?: Options): null | EjvError {
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

	return _ejv(data as AnyObject, schemes, internalOption);
}
