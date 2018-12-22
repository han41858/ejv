import { DataType } from './constants';

type TypeTester = (value : any) => boolean;
type AdditionalTester = (value : any, args? : any) => boolean; // skip type test

export const typeTester : Function = (value : any, type : DataType) : boolean => {
	let valid : boolean;

	switch (type) {
		case DataType.BOOLEAN:
			valid = booleanTester(value);
			break;

		case DataType.NUMBER:
			valid = numberTester(value);
			break;

		case DataType.STRING:
			valid = stringTester(value);
			break;

		case DataType.OBJECT:
			valid = objectTester(value);
			break;

		case DataType.DATE:
			valid = dateTester(value);
			break;

		case DataType.REGEXP:
			valid = regExpTester(value);
			break;

		case DataType.ARRAY:
			valid = arrayTester(value);
			break;

		default:
			throw new Error('not defined data type'); // TODO: dev
	}

	return valid;
};

export const definedTester : TypeTester = (value : any) : boolean => {
	return value !== undefined;
};

export const enumTester : AdditionalTester = <T> (value : T, arr : T[]) : boolean => {
	return arr.includes(value);
};

export const minLengthTester : AdditionalTester = (value : string | any[], minLength : number) : boolean => {
	return value.length >= minLength;
};

export const maxLengthTester : AdditionalTester = (value : string | any[], maxLength : number) : boolean => {
	return value.length <= maxLength;
};

export const booleanTester : TypeTester = (value : any) : boolean => {
	return typeof value === 'boolean';
};

export const numberTester : TypeTester = (value : any) : boolean => {
	return typeof value === 'number';
};

export const integerTester : AdditionalTester = (value : number) : boolean => {
	return +value.toFixed(0) === value;
};

export const indexTester : AdditionalTester = (value : number) : boolean => {
	return integerTester(value) && value >= 0;
};

export const minNumberTester : AdditionalTester = (value : number, min : number) : boolean => {
	return value >= min;
};

export const exclusiveMinNumberTester : AdditionalTester = (value : number, min : number) : boolean => {
	return value > min;
};

export const maxNumberTester : AdditionalTester = (value : number, max : number) : boolean => {
	return value <= max;
};

export const exclusiveMaxNumberTester : AdditionalTester = (value : number, max : number) : boolean => {
	return value < max;
};

export const stringTester : TypeTester = (value : any) : boolean => {
	return typeof value === 'string';
};

export const stringRegExpTester : AdditionalTester = (value : string, regExp : string | RegExp) : boolean => {
	let valid : boolean = false;

	let _regExp : RegExp;

	if (regExpTester(regExp)) {
		_regExp = regExp as RegExp;
	} else if (stringTester(regExp)) {
		_regExp = new RegExp(regExp);
	}

	if (regExpTester(_regExp)) {
		valid = _regExp.test(value);
	}

	return valid;
};

// RFC 5322, 3.4.1. spec
export const emailTester : TypeTester = (value : any) : boolean => {
	let valid : boolean = false;

	if (stringTester(value) && stringRegExpTester(value, /^.+@.+$/)) {
		const valueAsString : string = value as string;

		const atIndex : number = valueAsString.lastIndexOf('@');
		const localPart : string = valueAsString.substr(0, atIndex);
		const domain : string = valueAsString.substr(atIndex + 1);

		// regular expression sources
		// const aTextRegExpStr : string = '[-a-zA-Z0-9!#$%&\\\'*+/=?^_`{|}~]+';

		const dotAtomRegExp : RegExp = /^(\.?[-a-zA-Z0-9!#$%&'*+/=?^_`{|}~]+)*$/;
		const quotedStringRegExp : RegExp = /^"[\u0020-\u005b\u005d-\u007e\\]*"$/; // include space (\u005b)
		const domainLiteralRegExp : RegExp = /^\[[\u0020-\u005a\u005c-\u007e\\]*]$/;

		const validLocalPart : boolean = localPart.length <= 64
			&& (
				dotAtomRegExp.test(localPart)
				|| quotedStringRegExp.test(localPart)
			);

		const validDomain : boolean = !domain.startsWith('.') && !domain.endsWith('.')
			&& (
				dotAtomRegExp.test(domain)
				|| domainLiteralRegExp.test(domain)
			);

		valid = validLocalPart && validDomain;
	}

	return valid;
};

// RFC 3339 (https://www.ietf.org/rfc/rfc3339.txt) : YYYY-MM-DDThh:mm:ss[.SSSZ]
const rfc3339Tester : AdditionalTester = (value : string) : boolean => {
	return /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T([0-1][0-9]|2[0-3])(:([0-5][0-9])){2}(\.\d+)?(Z|[-+]\d{2}:\d{2})?$/.test(value);
};

const iso8601DateTester : AdditionalTester = (value : string) : boolean => {
	const years : string = '(\\d{4})';
	const months : string = '(0[1-9]|1[0-2])';
	const dates : string = '(0[1-9]|[1-2][0-9]|3[0-1])';
	const dateOfYear : string = '(00[1-9]|0[1-9][0-9]|[1-2]\\d{2}|3[0-5]\\d|36[0-5])'; // TODO: 366 for leap year
	const weeks : string = '(W(0[1-9]|[2-4][0-9]|5[0-3]))';
	const days : string = '[1-7]';

	return [
		new RegExp(`^[-+]?${years}$`), // years : YYYY, +YYYY, -YYYY
		new RegExp(`^${years}-${months}(-${dates})?$`), // calendar dates : YYYY-MM-DD, YYYY-MM
		new RegExp(`^${years}${months}${dates}$`), // calendar dates : YYYYMMDD
		new RegExp(`^--${months}-?${dates}$`), // calendar dates : --MM-DD, --MMDD
		new RegExp(`^${years}-${weeks}(-${days})?$`), // week dates : YYYY-Www, YYYY-Www-D
		new RegExp(`^${years}${weeks}(${days})?$`), // week dates : YYYYWww, YYYYWwwD
		new RegExp(`^${years}-?${dateOfYear}$`) // ordinal dates : YYYY-DDD, YYYYDDD
	].some((regExp : RegExp) => {
		return regExp.test(value);
	});
};

const iso8601TimeTester : AdditionalTester = (value : string) : boolean => {
	const hours : string = '([0-1]\\d|2[0-3])';
	const minutes : string = '([0-5]\\d)';
	const seconds : string = '([0-5]\\d|60)'; // 60 for leap second
	const ms : string = '(\\.[0-9]+)';

	return [
		new RegExp(`^(${hours}|24)$`), // hh
		new RegExp(`^((${hours}:${minutes})|24:00)$`), // hh:mm
		new RegExp(`^((${hours}:${minutes}:${seconds})|24:00:00)$`), // hh:mm:ss
		new RegExp(`^((${hours}:${minutes}:${seconds}${ms})|24:00:00\.0+)$`), // hh:mm:ss

		new RegExp(`^(${hours}${minutes}|2400)$`), // hhmm
		new RegExp(`^(${hours}${minutes}${seconds}|240000)$`), // hhmmss
		new RegExp(`^(${hours}${minutes}${seconds}${ms}|240000\.0+)$`) // hhmmss.sss
	]
		.some((regExp : RegExp) => {
			return regExp.test(value);
		});
};

const iso8601DateTimeTester : AdditionalTester = (value : string) : boolean => {
	let valid : boolean = false;

	if (/.+T.+/.test(value) // should have 1 'T'
		&& /(Z|[-+]\d{2}:?\d{2})$/.test(value) // should end with 'Z' or timezone
	) {
		let [date, time] = value.split('T');

		if (time.endsWith('Z')) {
			time = time.replace('Z', '');
		} else {
			const timezoneStartIndex : number = time.includes('+') ? time.indexOf('+') : time.indexOf('-');

			time = time.substr(0, timezoneStartIndex);
		}

		valid = iso8601DateTester(date) && iso8601TimeTester(time);
	}

	return valid;
};

export const dateFormatTester : AdditionalTester = (value : string) : boolean => {
	return iso8601DateTester(value);
};

export const timeFormatTester : AdditionalTester = (value : string) : boolean => {
	return iso8601TimeTester(value);
};

export const dateTimeFormatTester : AdditionalTester = (value : string) : boolean => {
	return rfc3339Tester(value) || iso8601DateTimeTester(value);
};

// // with port
// export const urlTester : TypeTester = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
// };
//
// // TODO: with port
// export const ipv4Tester : TypeTester = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
// };
//
// export const ipv6Tester : TypeTester = (value : any) : boolean => {
// 	return stringTester(value)
// 		&& /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$;/.test(value);
// };
//
// export const ipTester : TypeTester = (value : any) : boolean => {
// 	return ipv4Tester(value) || ipv6Tester(value);
// };

export const objectTester : TypeTester = (value : any) : boolean => {
	return typeof value === 'object';
};

export const dateTester : TypeTester = (value : any) : boolean => {
	return objectTester(value)
		&& value !== null
		&& value.getFullYear !== undefined;
};

export const arrayTester : TypeTester = (value : any) : boolean => {
	return objectTester(value)
		&& value !== null
		&& value.length !== undefined
		&& value.push !== undefined;
};

export const arrayTypeOfTester : AdditionalTester = (array : any, type : DataType) : boolean => {
	return array.every(item => {
		return typeTester(item, type);
	});
};

export const uniqueItemsTester : AdditionalTester = (array : any[]) : boolean => {
	return array.every(item => {
		return array.filter((target : any) => target === item).length === 1;
	});
};

export const regExpTester : TypeTester = (value : any) : boolean => {
	return value instanceof RegExp;
};