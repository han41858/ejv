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
	return Number.isInteger(value);
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

		// no leading, trailing or consecutive dots
		const dotAtomRegExp = /^[-a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+(\.[-a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+)*$/;
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

function isLeapYear (year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// checks the day exists in the month. year can be omitted (ISO 8601 --MM-DD), then Feb 29 is allowed
function calendarDateTester (year: number | undefined, month: number, date: number): boolean {
	const daysInMonth: number[] = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	if (month === 2 && date === 29) {
		return year === undefined || isLeapYear(year);
	}

	return date <= daysInMonth[month - 1];
}

// RFC 3339 (https://www.ietf.org/rfc/rfc3339.txt) : YYYY-MM-DDThh:mm:ss[.SSSZ]
function rfc3339Tester (value: string): boolean {
	const matchResult: RegExpMatchArray | null = value.match(/^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T([0-1][0-9]|2[0-3])(:([0-5][0-9])){2}(\.\d+)?(Z|[-+]\d{2}:\d{2})?$/);

	return matchResult !== null
		&& calendarDateTester(+matchResult[1], +matchResult[2], +matchResult[3]);
}

function iso8601DateTester (value: string): boolean {
	const years = '(\\d{4})';
	const months = '(0[1-9]|1[0-2])';
	const dates = '(0[1-9]|[1-2][0-9]|3[0-1])';
	const dateOfYear = '(00[1-9]|0[1-9][0-9]|[1-2]\\d{2}|3[0-5]\\d|36[0-6])'; // 366 for leap year
	const weeks = '(W(0[1-9]|[2-4][0-9]|5[0-3]))';
	const days = '[1-7]';

	// calendar dates : check the day exists in the month
	const calendarDateMatch: RegExpMatchArray | null = value.match(new RegExp(`^${ years }-${ months }-${ dates }$`)) // YYYY-MM-DD
		|| value.match(new RegExp(`^${ years }${ months }${ dates }$`)); // YYYYMMDD

	if (calendarDateMatch) {
		return calendarDateTester(+calendarDateMatch[1], +calendarDateMatch[2], +calendarDateMatch[3]);
	}

	const noYearDateMatch: RegExpMatchArray | null = value.match(new RegExp(`^--${ months }-?${ dates }$`)); // --MM-DD, --MMDD

	if (noYearDateMatch) {
		return calendarDateTester(undefined, +noYearDateMatch[1], +noYearDateMatch[2]);
	}

	// ordinal dates : 366th day only in leap year
	const ordinalDateMatch: RegExpMatchArray | null = value.match(new RegExp(`^${ years }-?${ dateOfYear }$`)); // YYYY-DDD, YYYYDDD

	if (ordinalDateMatch) {
		return +ordinalDateMatch[2] !== 366 || isLeapYear(+ordinalDateMatch[1]);
	}

	return [
		new RegExp(`^[-+]?${ years }$`), // years : YYYY, +YYYY, -YYYY
		new RegExp(`^${ years }-${ months }$`), // calendar dates : YYYY-MM
		new RegExp(`^${ years }-${ weeks }(-${ days })?$`), // week dates : YYYY-Www, YYYY-Www-D
		new RegExp(`^${ years }${ weeks }(${ days })?$`) // week dates : YYYYWww, YYYYWwwD
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

// 0 ~ 255, without leading zeros
const IPV4_OCTET: string = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const IPV4_ADDRESS: string = `${ IPV4_OCTET }(\\.${ IPV4_OCTET }){3}`;

// 0 ~ 65535, without leading zeros
const PORT: string = '(6553[0-5]|655[0-2]\\d|65[0-4]\\d{2}|6[0-4]\\d{3}|[1-5]\\d{4}|[1-9]\\d{0,3}|0)';

const IPV4_ADDRESS_REGEXP = new RegExp(`^${ IPV4_ADDRESS }$`);
const IPV4_REGEXP = new RegExp(`^${ IPV4_ADDRESS }(:${ PORT })?$`);
const IPV6_WITH_PORT_REGEXP = new RegExp(`^\\[([^\\]]+)]:${ PORT }$`);

// RFC 4291 2.2 : x:x:x:x:x:x:x:x, :: compression, x:x:x:x:x:x:d.d.d.d
// zone index (ex. fe80::1%eth0) is not allowed
function ipv6AddressTester (value: string): boolean {
	const hexGroupRegExp = /^[0-9a-fA-F]{1,4}$/;

	const compressionParts: string[] = value.split('::');

	if (compressionParts.length > 2) {
		return false; // '::' can be used only once
	}

	const isCompressed: boolean = compressionParts.length === 2;

	const groups: string[] = compressionParts
		.filter((part: string): boolean => part !== '')
		.reduce((acc: string[], part: string): string[] => acc.concat(part.split(':')), []);

	let groupCount: number = groups.length;

	if (groups.length > 0 && groups[groups.length - 1].includes('.')) {
		// embedded IPv4 address should be the last part
		const ipv4Part: string = groups.pop() as string;

		if (!IPV4_ADDRESS_REGEXP.test(ipv4Part)) {
			return false;
		}

		groupCount += 1; // IPv4 address takes 2 groups
	}

	if (!groups.every((group: string): boolean => hexGroupRegExp.test(group))) {
		return false; // also catches empty groups like '1:::2', ':1:2', '1:2:'
	}

	return isCompressed
		? groupCount <= 7
		: groupCount === 8;
}

// IPv4 with optional port : 192.168.0.1, 192.168.0.1:8080
export function ipv4Tester (value: string): boolean {
	return stringTester(value) && IPV4_REGEXP.test(value);
}

// IPv6 with optional port : ::1, [::1]:8080 (brackets are required only with port)
export function ipv6Tester (value: string): boolean {
	if (!stringTester(value)) {
		return false;
	}

	const withPortMatch: RegExpMatchArray | null = value.match(IPV6_WITH_PORT_REGEXP);

	return withPortMatch
		? ipv6AddressTester(withPortMatch[1])
		: ipv6AddressTester(value);
}

export function ipTester (value: string): boolean {
	return ipv4Tester(value) || ipv6Tester(value);
}

// http or https URL that can be parsed by WHATWG URL API (new URL()) as written
export function urlTester (value: string): boolean {
	if (!stringTester(value)
		|| !/^https?:\/\/[^/\\]/i.test(value) // should start with 'http://' or 'https://' and have authority
		|| /[\s\\\u0000-\u001f\u007f]/.test(value) // eslint-disable-line no-control-regex -- whitespace, backslash and control characters are not allowed
	) {
		return false;
	}

	let url: URL;

	try {
		url = new URL(value);
	}
	catch (e: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
		return false;
	}

	if (!['http:', 'https:'].includes(url.protocol) || url.hostname === '') {
		return false;
	}

	// URL API normalizes IPv4 shorthand (ex. '1.2.3', '0x7f.1', '010.0.0.1') to dotted decimal
	// reject them unless the host is written as it is
	if (IPV4_ADDRESS_REGEXP.test(url.hostname)) {
		const authority: string = value.replace(/^https?:\/\//i, '').split(/[/?#]/)[0];
		const hostAndPort: string = authority.slice(authority.lastIndexOf('@') + 1);
		const host: string = hostAndPort.replace(/:\d*$/, '');

		if (host !== url.hostname) {
			return false;
		}
	}

	return true;
}

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

// SameValueZero comparison (NaN equals NaN, objects by reference)
export function uniqueItemsTester (array: unknown[]): boolean {
	return new Set(array).size === array.length;
}

export function regExpTester (value: unknown): value is RegExp {
	return value instanceof RegExp;
}

export function bufferTester (value: unknown): value is BufferLike {
	return (ArrayBuffer.isView(value) && !(value instanceof DataView)) // normally buffer, ex. Uint8Array, Uint16Array, ...
		|| value instanceof ArrayBuffer
		|| (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer);
}
