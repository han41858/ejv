// type specific rules, called by _ejv() after the type of the value is resolved

import {
	AnyObject,
	ArrayScheme,
	BufferLike,
	BufferScheme,
	DateScheme,
	EjvError,
	InternalOptions,
	NumberScheme,
	ObjectScheme,
	Scheme,
	StringScheme
} from './interfaces';
import { DATA_TYPE, ERROR_MESSAGE, ERROR_TYPE, NUMBER_FORMAT, STRING_FORMAT } from './constants';
import {
	arrayTester,
	arrayTypeOfTester,
	booleanTester,
	bufferLengthTester,
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
	ipTester,
	ipv4Tester,
	ipv6Tester,
	jsonStrTester,
	lengthTester,
	maxByteLengthTester,
	maxDateTester,
	maxLengthTester,
	maxNumberTester,
	minByteLengthTester,
	minDateTester,
	minLengthTester,
	minNumberTester,
	numberTester,
	objectTester,
	regExpTester,
	stringRegExpTester,
	stringTester,
	timeFormatTester,
	uniqueItemsTester,
	urlTester
} from './tester';
import { clone, createErrorMsg } from './util';


export type Validate = (data: AnyObject, schemes: Scheme[], options: InternalOptions) => EjvError | null;

export interface ValidatorContext {
	data: AnyObject; // object which has the value, used as EjvError.data
	value: unknown;
	scheme: Scheme;
	options: InternalOptions; // path points the value
	validate: Validate; // _ejv() for nested schemes
}

// invalid scheme found in a type validator : _ejv() returns it immediately, without customErrorMsg
export class SchemeFailure {
	constructor (public readonly error: EjvError) {
	}
}

// data error (or an error from nested schemes) : _ejv() stops and applies customErrorMsg
export type ValidatorResult = EjvError | SchemeFailure | null;

export const ALL_DATA_TYPES: DATA_TYPE[] = Object.values(DATA_TYPE);


function schemeFailure (ctx: ValidatorContext, message: string): SchemeFailure {
	return new SchemeFailure(new EjvError({
		type: ERROR_TYPE.INVALID_SCHEMES,
		message,

		data: ctx.data,

		errorScheme: ctx.scheme,
		isSchemeError: true
	}));
}

function dataError (ctx: ValidatorContext, type: ERROR_TYPE, message: string): EjvError {
	return new EjvError({
		type,
		message,

		data: ctx.data,
		path: ctx.options.path,

		errorScheme: ctx.scheme,
		errorData: ctx.value
	});
}

// returns the first error, rules are checked in order
function firstError (...rules: (() => ValidatorResult)[]): ValidatorResult {
	for (const rule of rules) {
		const result: ValidatorResult = rule();

		if (result !== null) {
			return result;
		}
	}

	return null;
}


// enum, notEnum
function enumRule (ctx: ValidatorContext, rule: 'enum' | 'notEnum', itemType: DATA_TYPE.NUMBER | DATA_TYPE.STRING): ValidatorResult {
	const values: unknown = (ctx.scheme as NumberScheme | StringScheme)[rule];

	if (!definedTester(values)) {
		return null;
	}

	const isEnum: boolean = rule === 'enum';

	if (!arrayTester(values)) {
		return schemeFailure(ctx, isEnum
			? ERROR_MESSAGE.ENUM_SHOULD_BE_ARRAY
			: ERROR_MESSAGE.NOT_ENUM_SHOULD_BE_ARRAY);
	}

	if (!arrayTypeOfTester(values, itemType)) {
		const isNumber: boolean = itemType === DATA_TYPE.NUMBER;

		return schemeFailure(ctx, isEnum
			? (isNumber ? ERROR_MESSAGE.ENUM_SHOULD_BE_NUMBERS : ERROR_MESSAGE.ENUM_SHOULD_BE_STRINGS)
			: (isNumber ? ERROR_MESSAGE.NOT_ENUM_SHOULD_BE_NUMBERS : ERROR_MESSAGE.NOT_ENUM_SHOULD_BE_STRINGS));
	}

	const included: boolean = enumTester(ctx.value, values);

	if (isEnum && !included) {
		return dataError(ctx, ERROR_TYPE.ONE_VALUE_OF, createErrorMsg(ERROR_MESSAGE.ONE_VALUE_OF, {
			placeholders: [JSON.stringify(values)]
		}));
	}

	if (!isEnum && included) {
		return dataError(ctx, ERROR_TYPE.NOT_ONE_VALUE_OF, createErrorMsg(ERROR_MESSAGE.NOT_ONE_VALUE_OF, {
			placeholders: [JSON.stringify(values)]
		}));
	}

	return null;
}


interface SizeRule {
	limit: unknown; // value of the scheme, ex. minLength
	invalidLimitMessage: ERROR_MESSAGE;
	errorType: ERROR_TYPE;
	errorMessage: ERROR_MESSAGE;
	test: (limit: number) => boolean;
}

// length, minLength, maxLength, byteLength, minByteLength, maxByteLength
function sizeRules (ctx: ValidatorContext, rules: SizeRule[]): ValidatorResult {
	for (const rule of rules) {
		if (!definedTester(rule.limit)) {
			continue;
		}

		if (!(numberTester(rule.limit) && integerTester(rule.limit))) {
			return schemeFailure(ctx, rule.invalidLimitMessage);
		}

		if (!rule.test(rule.limit)) {
			return dataError(ctx, rule.errorType, createErrorMsg(rule.errorMessage, {
				placeholders: ['' + rule.limit]
			}));
		}
	}

	return null;
}

function lengthRules (ctx: ValidatorContext, scheme: StringScheme | ArrayScheme, value: string | unknown[]): ValidatorResult {
	return sizeRules(ctx, [
		{
			limit: scheme.length,
			invalidLimitMessage: ERROR_MESSAGE.LENGTH_SHOULD_BE_INTEGER,
			errorType: ERROR_TYPE.LENGTH,
			errorMessage: ERROR_MESSAGE.LENGTH,
			test: (limit: number): boolean => lengthTester(value, limit)
		},
		{
			limit: scheme.minLength,
			invalidLimitMessage: ERROR_MESSAGE.MIN_LENGTH_SHOULD_BE_INTEGER,
			errorType: ERROR_TYPE.MIN_LENGTH,
			errorMessage: ERROR_MESSAGE.MIN_LENGTH,
			test: (limit: number): boolean => minLengthTester(value, limit)
		},
		{
			limit: scheme.maxLength,
			invalidLimitMessage: ERROR_MESSAGE.MAX_LENGTH_SHOULD_BE_INTEGER,
			errorType: ERROR_TYPE.MAX_LENGTH,
			errorMessage: ERROR_MESSAGE.MAX_LENGTH,
			test: (limit: number): boolean => maxLengthTester(value, limit)
		}
	]);
}


// format of number & string
function formatRule<T extends string> (
	ctx: ValidatorContext,
	format: unknown,
	allFormats: T[],
	invalidFormatMessage: ERROR_MESSAGE,
	testers: Map<string, () => boolean>
): ValidatorResult {
	if (!definedTester(format)) {
		return null;
	}

	let formats: T[];

	if (!arrayTester(format)) {
		if (!enumTester(format as T, allFormats)) {
			return schemeFailure(ctx, createErrorMsg(invalidFormatMessage, {
				placeholders: [format as string]
			}));
		}

		formats = [format as T];
	}
	else {
		const errorFormat: unknown = (format as T[]).find((oneFormat: T): boolean => {
			return !enumTester(oneFormat, allFormats);
		});

		// falsy values (ex. '') are not reported here, they fail at matching below
		if (errorFormat) {
			return schemeFailure(ctx, createErrorMsg(invalidFormatMessage, {
				placeholders: [errorFormat as string]
			}));
		}

		formats = format as T[];
	}

	const matched: boolean = formats.some((oneFormat: T): boolean => {
		const tester: (() => boolean) | undefined = testers.get(oneFormat);

		return tester !== undefined && tester();
	});

	if (matched) {
		return null;
	}

	return !arrayTester(format)
		? dataError(ctx, ERROR_TYPE.FORMAT, createErrorMsg(ERROR_MESSAGE.FORMAT, {
			placeholders: [format as string]
		}))
		: dataError(ctx, ERROR_TYPE.FORMAT_ONE_OF, createErrorMsg(ERROR_MESSAGE.FORMAT_ONE_OF, {
			placeholders: [JSON.stringify(format)]
		}));
}


// number

function numberBoundRule (ctx: ValidatorContext, bound: 'min' | 'max'): ValidatorResult {
	const scheme: NumberScheme = ctx.scheme as NumberScheme;
	const parentScheme: NumberScheme | undefined = scheme.parent as NumberScheme | undefined;
	const value: number = ctx.value as number;

	const isMin: boolean = bound === 'min';

	if (!definedTester(scheme[bound]) && !definedTester(parentScheme?.[bound])) {
		return null;
	}

	const effectiveBound: number = definedTester(scheme[bound])
		? scheme[bound] as number
		: parentScheme?.[bound] as number;

	if (!numberTester(effectiveBound)) {
		return schemeFailure(ctx, isMin
			? ERROR_MESSAGE.MIN_SHOULD_BE_NUMBER
			: ERROR_MESSAGE.MAX_SHOULD_BE_NUMBER);
	}

	const exclusive: unknown = isMin ? scheme.exclusiveMin : scheme.exclusiveMax;

	if (definedTester(exclusive) && !booleanTester(exclusive)) {
		return schemeFailure(ctx, isMin
			? ERROR_MESSAGE.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN
			: ERROR_MESSAGE.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
	}

	let valid: boolean;
	let errorType: ERROR_TYPE;
	let errorMessage: ERROR_MESSAGE;

	if (isMin) {
		valid = exclusive ? exclusiveMinNumberTester(value, effectiveBound) : minNumberTester(value, effectiveBound);
		errorType = exclusive ? ERROR_TYPE.BIGGER_THAN : ERROR_TYPE.BIGGER_THAN_OR_EQUAL;
		errorMessage = exclusive ? ERROR_MESSAGE.BIGGER_THAN : ERROR_MESSAGE.BIGGER_THAN_OR_EQUAL;
	}
	else {
		valid = exclusive ? exclusiveMaxNumberTester(value, effectiveBound) : maxNumberTester(value, effectiveBound);
		errorType = exclusive ? ERROR_TYPE.SMALLER_THAN : ERROR_TYPE.SMALLER_THAN_OR_EQUAL;
		errorMessage = exclusive ? ERROR_MESSAGE.SMALLER_THAN : ERROR_MESSAGE.SMALLER_THAN_OR_EQUAL;
	}

	return valid
		? null
		: dataError(ctx, errorType, createErrorMsg(errorMessage, {
			placeholders: [effectiveBound]
		}));
}

export function validateNumber (ctx: ValidatorContext): ValidatorResult {
	const scheme: NumberScheme = ctx.scheme as NumberScheme;
	const value: number = ctx.value as number;

	return firstError(
		(): ValidatorResult => enumRule(ctx, 'enum', DATA_TYPE.NUMBER),
		(): ValidatorResult => enumRule(ctx, 'notEnum', DATA_TYPE.NUMBER),
		(): ValidatorResult => numberBoundRule(ctx, 'min'),
		(): ValidatorResult => numberBoundRule(ctx, 'max'),
		(): ValidatorResult => formatRule(ctx, scheme.format, Object.values(NUMBER_FORMAT), ERROR_MESSAGE.INVALID_NUMBER_FORMAT, new Map([
			[NUMBER_FORMAT.INTEGER, (): boolean => integerTester(value)],
			[NUMBER_FORMAT.INDEX, (): boolean => indexTester(value)]
		]))
	);
}


// string

function patternToString (pattern: string | RegExp): string {
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
}

function isValidPattern (pattern: string | RegExp): boolean {
	return (stringTester(pattern) && minLengthTester(pattern as string, 1))
		|| (regExpTester(pattern) && pattern.toString() !== '/(?:)/' && pattern.toString() !== '/null/');
}

function patternsToString (patterns: (string | RegExp)[]): string {
	return '[' + patterns.map((onePattern: string | RegExp): string => {
		return patternToString(onePattern);
	}).join(', ') + ']';
}

function patternRule (ctx: ValidatorContext): ValidatorResult {
	const scheme: StringScheme = ctx.scheme as StringScheme;
	const value: string = ctx.value as string;

	if (!definedTester(scheme.pattern)) {
		return null;
	}

	if (scheme.pattern === null) {
		return schemeFailure(ctx, createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
			placeholders: ['null']
		}));
	}

	if (arrayTester(scheme.pattern)) {
		const patterns: (string | RegExp)[] = scheme.pattern as (string | RegExp)[];

		if (!minLengthTester(patterns, 1)) { // empty array
			return schemeFailure(ctx, createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
				placeholders: [patternsToString(patterns)]
			}));
		}

		try {
			const regExps: RegExp[] = patterns.map((pattern: string | RegExp): RegExp => {
				if (!isValidPattern(pattern)) {
					throw new Error(createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
						placeholders: [patternsToString(patterns)]
					}));
				}

				return new RegExp(pattern);
			});

			const matched: boolean = regExps.some((regExp: RegExp): boolean => {
				return stringRegExpTester(value, regExp);
			});

			if (!matched) {
				return dataError(ctx, ERROR_TYPE.PATTERN_ONE_OF, createErrorMsg(ERROR_MESSAGE.PATTERN_ONE_OF, {
					placeholders: [patternsToString(patterns)]
				}));
			}
		}
		catch (e: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
			return schemeFailure(ctx, createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
				placeholders: [patternsToString(patterns)]
			}));
		}

		return null;
	}

	const pattern: string | RegExp = scheme.pattern as string | RegExp;

	if (!isValidPattern(pattern)) {
		return schemeFailure(ctx, createErrorMsg(ERROR_MESSAGE.INVALID_STRING_PATTERN, {
			placeholders: [patternToString(pattern)]
		}));
	}

	if (!stringRegExpTester(value, new RegExp(pattern))) {
		return dataError(ctx, ERROR_TYPE.PATTERN, createErrorMsg(ERROR_MESSAGE.PATTERN, {
			placeholders: [patternToString(pattern)]
		}));
	}

	return null;
}

export function validateString (ctx: ValidatorContext): ValidatorResult {
	const scheme: StringScheme = ctx.scheme as StringScheme;
	const value: string = ctx.value as string;

	return firstError(
		(): ValidatorResult => enumRule(ctx, 'enum', DATA_TYPE.STRING),
		(): ValidatorResult => enumRule(ctx, 'notEnum', DATA_TYPE.STRING),
		(): ValidatorResult => lengthRules(ctx, scheme, value),
		(): ValidatorResult => formatRule(ctx, scheme.format, Object.values(STRING_FORMAT), ERROR_MESSAGE.INVALID_STRING_FORMAT, new Map([
			[STRING_FORMAT.EMAIL, (): boolean => emailTester(value)],
			[STRING_FORMAT.JSON, (): boolean => jsonStrTester(value)],
			[STRING_FORMAT.DATE, (): boolean => dateFormatTester(value)],
			[STRING_FORMAT.TIME, (): boolean => timeFormatTester(value)],
			[STRING_FORMAT.DATE_TIME, (): boolean => dateTimeFormatTester(value)],
			[STRING_FORMAT.URL, (): boolean => urlTester(value)],
			[STRING_FORMAT.IP, (): boolean => ipTester(value)],
			[STRING_FORMAT.IPV4, (): boolean => ipv4Tester(value)],
			[STRING_FORMAT.IPV6, (): boolean => ipv6Tester(value)]
		])),
		(): ValidatorResult => patternRule(ctx)
	);
}


// object

export function validateObject (ctx: ValidatorContext): ValidatorResult {
	const scheme: ObjectScheme = ctx.scheme as ObjectScheme;
	const value: AnyObject = ctx.value as AnyObject;

	if (definedTester(scheme.allowNoProperty)) {
		if (!booleanTester(scheme.allowNoProperty)) {
			return schemeFailure(ctx, ERROR_MESSAGE.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN);
		}

		if (!scheme.allowNoProperty && !hasPropertyTester(value)) {
			return dataError(ctx, ERROR_TYPE.PROPERTY, ERROR_MESSAGE.PROPERTY);
		}
	}

	if (!definedTester(scheme.properties)) {
		return null;
	}

	if (!arrayTester(scheme.properties)) {
		return schemeFailure(ctx, ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY);
	}

	const properties: Scheme[] = scheme.properties;

	if (!minLengthTester(properties, 1)) {
		return schemeFailure(ctx, ERROR_MESSAGE.PROPERTIES_SHOULD_HAVE_ITEMS);
	}

	if (!arrayTypeOfTester(properties, DATA_TYPE.OBJECT)) {
		return schemeFailure(ctx, ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT);
	}

	if (!objectTester(value)) {
		return dataError(ctx, ERROR_TYPE.TYPE_MISMATCH, createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
			placeholders: ['object']
		}));
	}

	// call recursively
	const result: EjvError | null = ctx.validate(value, properties, ctx.options);

	if (result) {
		// inject original data
		result.data = ctx.data;
	}

	return result;
}


// date

function dateBoundRule (ctx: ValidatorContext, bound: 'min' | 'max'): ValidatorResult {
	const scheme: DateScheme = ctx.scheme as DateScheme;
	const parentScheme: DateScheme | undefined = scheme.parent as DateScheme | undefined;
	const value: Date = ctx.value as Date;

	const isMin: boolean = bound === 'min';

	if (!definedTester(scheme[bound]) && !definedTester(parentScheme?.[bound])) {
		return null;
	}

	const invalidBoundMessage: ERROR_MESSAGE = isMin
		? ERROR_MESSAGE.MIN_DATE_SHOULD_BE_DATE_OR_STRING
		: ERROR_MESSAGE.MAX_DATE_SHOULD_BE_DATE_OR_STRING;

	const boundCandidate: string | Date = scheme[bound] || parentScheme?.[bound] as string | Date;

	if (!(
		(stringTester(boundCandidate)
			&& (
				dateFormatTester(boundCandidate as string)
				|| dateTimeFormatTester(boundCandidate as string)
			)
		)
		|| dateTester(boundCandidate)
	)) {
		return schemeFailure(ctx, invalidBoundMessage);
	}

	const effectiveBound: Date = new Date(boundCandidate);

	// some ISO 8601 forms (ex. week dates) pass the format test but can't be parsed by Date
	if (isNaN(+effectiveBound)) {
		return schemeFailure(ctx, invalidBoundMessage);
	}

	const exclusive: unknown = isMin ? scheme.exclusiveMin : scheme.exclusiveMax;

	if (definedTester(exclusive) && !booleanTester(exclusive)) {
		return schemeFailure(ctx, isMin
			? ERROR_MESSAGE.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN
			: ERROR_MESSAGE.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
	}

	let valid: boolean;
	let errorType: ERROR_TYPE;
	let errorMessage: ERROR_MESSAGE;

	if (isMin) {
		valid = exclusive ? exclusiveMinDateTester(value, effectiveBound) : minDateTester(value, effectiveBound);
		errorType = exclusive ? ERROR_TYPE.AFTER_DATE : ERROR_TYPE.AFTER_OR_SAME_DATE;
		errorMessage = exclusive ? ERROR_MESSAGE.AFTER_DATE : ERROR_MESSAGE.AFTER_OR_SAME_DATE;
	}
	else {
		valid = exclusive ? exclusiveMaxDateTester(value, effectiveBound) : maxDateTester(value, effectiveBound);
		errorType = exclusive ? ERROR_TYPE.BEFORE_DATE : ERROR_TYPE.BEFORE_OR_SAME_DATE;
		errorMessage = exclusive ? ERROR_MESSAGE.BEFORE_DATE : ERROR_MESSAGE.BEFORE_OR_SAME_DATE;
	}

	return valid
		? null
		: dataError(ctx, errorType, createErrorMsg(errorMessage, {
			placeholders: [effectiveBound.toISOString()]
		}));
}

export function validateDate (ctx: ValidatorContext): ValidatorResult {
	return firstError(
		(): ValidatorResult => dateBoundRule(ctx, 'min'),
		(): ValidatorResult => dateBoundRule(ctx, 'max')
	);
}


// array

// items : DATA_TYPE | DATA_TYPE[]
function itemsByTypesRule (ctx: ValidatorContext, tempKeys: string[]): ValidatorResult {
	const scheme: ArrayScheme = ctx.scheme as ArrayScheme;
	const value: unknown[] = ctx.value as unknown[];

	const itemTypes: DATA_TYPE[] = (arrayTester(scheme.items)
		? scheme.items
		: [scheme.items]) as DATA_TYPE[];

	const itemTypeError: string | undefined = itemTypes.find((type: DATA_TYPE): boolean => {
		return !definedTester(type)
			|| !stringTester(type)
			|| !enumTester(type, ALL_DATA_TYPES);
	});

	if (itemTypeError) {
		return schemeFailure(ctx, createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_INVALID_TYPE, {
			placeholders: [itemTypeError]
		}));
	}

	const partialData: AnyObject = {};
	const partialSchemes: Scheme[] = [];

	tempKeys.forEach((tempKey: string, i: number): void => {
		partialData[tempKey] = value[i];
		partialSchemes.push({
			key: tempKey,
			type: itemTypes
		});
	});

	// call recursively
	const partialResult: EjvError | null = ctx.validate(partialData, partialSchemes, ctx.options);

	if (!partialResult) {
		return null;
	}

	const errorMsg: string = createErrorMsg(ERROR_MESSAGE.ITEMS_TYPE, {
		placeholders: [
			arrayTester(scheme.items)
				? JSON.stringify(itemTypes)
				: scheme.items as string
		]
	});

	const partialKeys: string[] = (partialResult.path || '').split('/');
	const partialKey: string = partialKeys[partialKeys.length - 1];

	const partialScheme: Scheme = partialSchemes.find((_scheme: Scheme): boolean => {
		return _scheme.key === partialKey;
	}) as Scheme;

	const partialKeyIndex: number = partialSchemes.indexOf(partialScheme);

	return new EjvError({
		type: ERROR_TYPE.ITEMS_TYPE,
		message: errorMsg,

		data: ctx.data,
		path: [...ctx.options.path, '' + partialKeyIndex],

		errorScheme: partialScheme,
		errorData: partialData[partialKey]
	});
}

// items : Scheme | Scheme[]
function itemsBySchemesRule (ctx: ValidatorContext, tempKeys: string[]): ValidatorResult {
	const scheme: ArrayScheme = ctx.scheme as ArrayScheme;
	const value: unknown[] = ctx.value as unknown[];

	const itemsAsSchemes: Scheme[] = arrayTester(scheme.items)
		? scheme.items
		: [scheme.items] as Scheme[];

	let partialError: EjvError | null | undefined = null;

	// use for() instead of forEach() to break
	for (let arrIndex = 0; arrIndex < value.length; arrIndex++) {
		const tempKeyForThisValue: string = tempKeys[arrIndex];

		const partialData: AnyObject = {
			[tempKeyForThisValue]: value[arrIndex]
		};

		const partialSchemes: Scheme[] = itemsAsSchemes.map((oneScheme: Scheme): Scheme => {
			const newScheme: Scheme = clone(oneScheme); // divide instance

			newScheme.key = tempKeyForThisValue;

			return newScheme;
		});

		const partialResults: (EjvError | null)[] = partialSchemes.map((partialScheme: Scheme): EjvError | null => {
			// call recursively
			const partialResult: EjvError | null = ctx.validate(partialData, [partialScheme], ctx.options);

			if (partialResult) {
				partialResult.path = (partialResult.path || '').replace(tempKeyForThisValue, '' + arrIndex);
			}

			return partialResult;
		});

		// the item should match with one of the schemes at least
		if (!partialResults.some((oneResult: EjvError | null): boolean => oneResult === null)) {
			partialError = partialResults.find((oneResult: EjvError | null): boolean => {
				return !!oneResult;
			});
			break;
		}
	}

	if (!partialError) {
		return null;
	}

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
				placeholders: [JSON.stringify(scheme.items)]
			});
		}
	}

	const result: EjvError = new EjvError({
		type: errorType,
		message: errorMsg,

		data: ctx.data
	});

	if (errorType === ERROR_TYPE.INVALID_SCHEMES) {
		result.errorScheme = scheme;
		result.isSchemeError = true;
		result.isDataError = false;
	}
	else {
		result.path = partialError.path;
		result.errorData = partialError.errorData;
	}

	return result;
}

function itemsRule (ctx: ValidatorContext): ValidatorResult {
	const scheme: ArrayScheme = ctx.scheme as ArrayScheme;
	const value: unknown[] = ctx.value as unknown[];

	if (!definedTester(scheme.items) || value.length === 0) {
		return null;
	}

	// convert array to object with temporary keys
	const now: Date = new Date();
	const tempKeys: string[] = value.map((_value: unknown, i: number): string => {
		return '' + (+now + i);
	});

	if (stringTester(scheme.items) // by DataType
		|| (arrayTester(scheme.items) && arrayTypeOfTester(scheme.items as DATA_TYPE[], DATA_TYPE.STRING)) // by DataType[]
	) {
		return itemsByTypesRule(ctx, tempKeys);
	}

	if ((objectTester(scheme.items) && scheme.items !== null) // by Scheme
		|| (arrayTester(scheme.items) && arrayTypeOfTester(scheme.items as Scheme[], DATA_TYPE.OBJECT)) // by Scheme[]
	) {
		return itemsBySchemesRule(ctx, tempKeys);
	}

	return schemeFailure(ctx, createErrorMsg(ERROR_MESSAGE.INVALID_ITEMS_SCHEME, {
		placeholders: [JSON.stringify(scheme.items)]
	}));
}

export function validateArray (ctx: ValidatorContext): ValidatorResult {
	const scheme: ArrayScheme = ctx.scheme as ArrayScheme;
	const value: unknown[] = ctx.value as unknown[];

	return firstError(
		(): ValidatorResult => lengthRules(ctx, scheme, value),
		(): ValidatorResult => {
			if (!definedTester(scheme.unique)) {
				return null;
			}

			if (!booleanTester(scheme.unique)) {
				return schemeFailure(ctx, ERROR_MESSAGE.UNIQUE_SHOULD_BE_BOOLEAN);
			}

			return scheme.unique && !uniqueItemsTester(value)
				? dataError(ctx, ERROR_TYPE.UNIQUE_ITEMS, ERROR_MESSAGE.UNIQUE_ITEMS)
				: null;
		},
		(): ValidatorResult => itemsRule(ctx)
	);
}


// buffer

export function validateBuffer (ctx: ValidatorContext): ValidatorResult {
	const scheme: BufferScheme = ctx.scheme as BufferScheme;
	const value: BufferLike = ctx.value as BufferLike;

	return sizeRules(ctx, [
		{
			limit: scheme.byteLength,
			invalidLimitMessage: ERROR_MESSAGE.BYTE_LENGTH_SHOULD_BE_INTEGER,
			errorType: ERROR_TYPE.BYTE_LENGTH,
			errorMessage: ERROR_MESSAGE.BYTE_LENGTH,
			test: (limit: number): boolean => bufferLengthTester(value, limit)
		},
		{
			limit: scheme.minByteLength,
			invalidLimitMessage: ERROR_MESSAGE.MIN_BYTE_LENGTH_SHOULD_BE_INTEGER,
			errorType: ERROR_TYPE.MIN_BYTE_LENGTH,
			errorMessage: ERROR_MESSAGE.MIN_BYTE_LENGTH,
			test: (limit: number): boolean => minByteLengthTester(value, limit)
		},
		{
			limit: scheme.maxByteLength,
			invalidLimitMessage: ERROR_MESSAGE.MAX_BYTE_LENGTH_SHOULD_BE_INTEGER,
			errorType: ERROR_TYPE.MAX_BYTE_LENGTH,
			errorMessage: ERROR_MESSAGE.MAX_BYTE_LENGTH,
			test: (limit: number): boolean => maxByteLengthTester(value, limit)
		}
	]);
}
