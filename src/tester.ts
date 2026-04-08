import { DATA_TYPE } from './constants';
import { AnyObject, BufferLike } from './interfaces';

export function typeTester (value: unknown, type: DATA_TYPE): boolean {
	let valid: boolean;

	switch (type) {
		case DATA_TYPE.BOOLEAN:
			valid = booleanTester(value);
			break;

		case DATA_TYPE.NUMBER:
			valid = numberTester(value);
			break;

		case DATA_TYPE.STRING:
			valid = stringTester(value);
			break;

		case DATA_TYPE.OBJECT:
			valid = objectTester(value);
			break;

		case DATA_TYPE.DATE:
			valid = dateTester(value);
			break;

		case DATA_TYPE.REGEXP:
			valid = regExpTester(value);
			break;

		case DATA_TYPE.ARRAY:
			valid = arrayTester(value);
			break;

		case DATA_TYPE.BUFFER:
			valid = bufferTester(value);
			break;
	}

	return valid;
}

export function definedTester (value: unknown): value is boolean {
	return value !== undefined;
}

export function enumTester<T> (value: T, arr: T[]): boolean {
	return arr.includes(value);
}

export function notEnumTester<T> (value: T, arr: T[]): boolean {
	return !enumTester(value, arr);
}

export function lengthTester (value: string | unknown[], length: number): boolean {
	return value.length === length;
}

export function minLengthTester (value: string | unknown[], minLength: number): boolean {
	return value.length >= minLength;
}

export function maxLengthTester (value: string | unknown[], maxLength: number): boolean {
	return value.length <= maxLength;
}

export function bufferLengthTester (value: BufferLike, length: number): boolean {
	return value.byteLength === length;
}

export function minByteLengthTester (value: BufferLike, minLength: number): boolean {
	return value.byteLength >= minLength;
}

export function maxByteLengthTester (value: BufferLike, maxLength: number): boolean {
	return value.byteLength <= maxLength;
}

export function booleanTester (value: unknown): value is boolean {
	return typeof value === 'boolean';
}

export function numberTester (value: unknown): value is number {
	return typeof value === 'number' && !isNaN(value);
}

export function integerTester (value: number): boolean {
	return +value.toFixed(0) === value;
}

export function indexTester (value: number): value is number {
	return integerTester(value) && value >= 0;
}

export function minNumberTester (value: number, min: number): boolean {
	return value >= min;
}

export function exclusiveMinNumberTester (value: number, min: number): boolean {
	return value > min;
}

export function maxNumberTester (value: number, max: number): boolean {
	return value <= max;
}

export function exclusiveMaxNumberTester (value: number, max: number): boolean {
	return value < max;
}

export function stringTester (value: unknown): value is string {
	return typeof value === 'string';
}

export function stringRegExpTester (value: string, regExp: string | RegExp): boolean {
	let valid = false;

	let _regExp: RegExp | undefined = undefined;

	if (regExpTester(regExp)) {
		_regExp = regExp as RegExp;
	}
	else if (stringTester(regExp)) {
		_regExp = new RegExp(regExp);
	}

	if (!!_regExp && regExpTester(_regExp)) {
		valid = _regExp.test(value);
	}

	return valid;
}

// RFC 5322, 3.4.1. spec
export function emailTester (value: string): boolean {
	let valid = false;

	if (stringTester(value) && stringRegExpTester(value, /^.+@.+$/)) {
		const valueAsString: string = value as string;

		const atIndex: number = valueAsString.lastIndexOf('@');
		const localPart: string = valueAsString.substring(0, atIndex);
		const domain: string = valueAsString.substring(atIndex + 1);

		// regular expression sources
		// const aTextRegExpStr : string = '[-a-zA-Z0-9!#$%&\\\'*+/=?^_`{|}~]+';

		const dotAtomRegExp = /^(\.?[-a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+)*$/;
		const quotedStringRegExp = /^"[\u0020-\u005b\u005d-\u007e\\]*"$/; // include space (\u005b)
		const domainLiteralRegExp = /^\[[\u0020-\u005a\u005c-\u007e\\]*]$/;

		const validLocalPart: boolean = localPart.length <= 64
			&& (
				dotAtomRegExp.test(localPart)
				|| quotedStringRegExp.test(localPart)
			);

		const validDomain: boolean = !domain.startsWith('.') && !domain.endsWith('.')
			&& (
				dotAtomRegExp.test(domain)
				|| domainLiteralRegExp.test(domain)
			);

		valid = validLocalPart && validDomain;
	}

	return valid;
}

export function jsonStrTester (value: string): boolean {
	try {
		JSON.parse(value);

		return true;
	}
	catch (e: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return false;
	}
}

// RFC 3339 (https://www.ietf.org/rfc/rfc3339.txt) : YYYY-MM-DDThh:mm:ss[.SSSZ]
function rfc3339Tester (value: string): boolean {
	return /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T([0-1][0-9]|2[0-3])(:([0-5][0-9])){2}(\.\d+)?(Z|[-+]\d{2}:\d{2})?$/.test(value);
}

function iso8601DateTester (value: string): boolean {
	const years = '(\\d{4})';
	const months = '(0[1-9]|1[0-2])';
	const dates = '(0[1-9]|[1-2][0-9]|3[0-1])';
	const dateOfYear = '(00[1-9]|0[1-9][0-9]|[1-2]\\d{2}|3[0-5]\\d|36[0-6])'; // 366 for leap year
	const weeks = '(W(0[1-9]|[2-4][0-9]|5[0-3]))';
	const days = '[1-7]';

	return [
		new RegExp(`^[-+]?${ years }$`), // years : YYYY, +YYYY, -YYYY
		new RegExp(`^${ years }-${ months }(-${ dates })?$`), // calendar dates : YYYY-MM-DD, YYYY-MM
		new RegExp(`^${ years }${ months }${ dates }$`), // calendar dates : YYYYMMDD
		new RegExp(`^--${ months }-?${ dates }$`), // calendar dates : --MM-DD, --MMDD
		new RegExp(`^${ years }-${ weeks }(-${ days })?$`), // week dates : YYYY-Www, YYYY-Www-D
		new RegExp(`^${ years }${ weeks }(${ days })?$`), // week dates : YYYYWww, YYYYWwwD
		new RegExp(`^${ years }-?${ dateOfYear }$`) // ordinal dates : YYYY-DDD, YYYYDDD
	].some((regExp: RegExp): boolean => {
		return regExp.test(value);
	});
}

function iso8601TimeTester (value: string): boolean {
	const hours = '([0-1]\\d|2[0-3])';
	const minutes = '([0-5]\\d)';
	const seconds = '([0-5]\\d|60)'; // 60 for leap second
	const ms = '(\\.[0-9]+)';

	return [
		new RegExp(`^(${ hours }|24)$`), // hh
		new RegExp(`^((${ hours }:${ minutes })|24:00)$`), // hh:mm
		new RegExp(`^((${ hours }:${ minutes }:${ seconds })|24:00:00)$`), // hh:mm:ss
		new RegExp(`^((${ hours }:${ minutes }:${ seconds }${ ms })|24:00:00.0+)$`), // hh:mm:ss

		new RegExp(`^(${ hours }${ minutes }|2400)$`), // hhmm
		new RegExp(`^(${ hours }${ minutes }${ seconds }|240000)$`), // hhmmss
		new RegExp(`^(${ hours }${ minutes }${ seconds }${ ms }|240000.0+)$`) // hhmmss.sss
	]
		.some((regExp: RegExp): boolean => {
			return regExp.test(value);
		});
}

function iso8601DateTimeTester (value: string): boolean {
	let valid = false;

	if (/.+T.+/.test(value) // should have 1 'T'
		&& /(Z|[-+]\d{2}:?\d{2})$/.test(value) // should end with 'Z' or timezone
	) {
		const dateAndTime: string[] = value.split('T');
		const date: string = dateAndTime[0];
		let time: string = dateAndTime[1];

		if (time.endsWith('Z')) {
			time = time.replace('Z', '');
		}
		else {
			const timezoneStartIndex: number = time.includes('+')
				? time.indexOf('+')
				: time.indexOf('-');

			time = time.slice(0, timezoneStartIndex);
		}

		valid = iso8601DateTester(date) && iso8601TimeTester(time);
	}

	return valid;
}

export function dateFormatTester (value: string): boolean {
	return iso8601DateTester(value);
}

export function timeFormatTester (value: string): boolean {
	return iso8601TimeTester(value);
}

export function dateTimeFormatTester (value: string): boolean {
	return rfc3339Tester(value) || iso8601DateTimeTester(value);
}

// // with port
// export const urlTester = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
// };
//
// // TODO: with port
// export const ipv4Tester = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
// };
//
// export const ipv6Tester = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$;/.test(value);
// };
//
// export const ipTester = (value : any) : boolean => {
// 	return ipv4Tester(value) || ipv6Tester(value);
// };

export function objectTester (value: unknown): boolean {
	return typeof value === 'object';
}

export function hasPropertyTester (value: AnyObject): boolean {
	return Object.keys(value).length > 0;
}

export function dateTester (value: unknown): value is Date {
	return objectTester(value)
		&& value !== null
		&& typeof value === 'object'
		&& value instanceof Date
		&& !isNaN(value.getFullYear());
}

export function minDateTester (value: Date, min: Date): boolean {
	return +value >= +min;
}

export function exclusiveMinDateTester (value: Date, min: Date): boolean {
	return +value > +min;
}

export function maxDateTester (value: Date, max: Date): boolean {
	return +value <= +max;
}

export function exclusiveMaxDateTester (value: Date, max: Date): boolean {
	return +value < +max;
}

export function arrayTester (value: unknown): value is unknown[] {
	return Array.isArray(value);
}

export function arrayTypeOfTester (array: unknown[], type: DATA_TYPE): boolean {
	return array.every((item: unknown): boolean => {
		return typeTester(item, type);
	});
}

export function uniqueItemsTester (array: unknown[]): boolean {
	return array.every((item: unknown): boolean => {
		return array.filter((target: unknown): boolean => target === item).length === 1;
	});
}

export function regExpTester (value: unknown): value is RegExp {
	return value instanceof RegExp;
}

export function bufferTester (value: unknown): value is BufferLike {
	return (ArrayBuffer.isView(value) && !(value instanceof DataView)) // normally buffer, ex. Uint8Array, Uint16Array, ...
		|| value instanceof ArrayBuffer
		|| (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer);
}
