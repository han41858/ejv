import { expect } from 'chai';

import { commonTestRunner } from './common-test-runner';

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
	uniqueItemsTester
} from '../src/tester';
import { DataType } from '../src/constants';

describe('testers', function () {
	describe('common', () => {
		describe('definedTester()', () => {
			it('common test', () => {
				expect(commonTestRunner(
					definedTester,
					true,
					false,
					true,
					true,
					true,
					true,
					true
				)).to.be.true;
			});
		});

		describe('enumTester()', () => {
			it('logic test', () => {
				expect(enumTester('a', ['a', 'b', 'c'])).to.be.true;
				expect(enumTester('a', ['b', 'c'])).to.be.false;

				expect(enumTester(1, [1, 2, 3])).to.be.true;
				expect(enumTester(1, [2, 3])).to.be.false;
			});
		});

		describe('lengthTester()', () => {
			it('logic test', () => {
				expect(lengthTester('abcd', 3)).to.be.false;
				expect(lengthTester('abcd', 4)).to.be.true;
				expect(lengthTester('abcd', 5)).to.be.false;

				expect(lengthTester([1, 2, 3, 4], 3)).to.be.false;
				expect(lengthTester([1, 2, 3, 4], 4)).to.be.true;
				expect(lengthTester([1, 2, 3, 4], 5)).to.be.false;
			});
		});

		describe('minLengthTester()', () => {
			it('logic test', () => {
				expect(minLengthTester('abcd', 3)).to.be.true;
				expect(minLengthTester('abcd', 4)).to.be.true;
				expect(minLengthTester('abcd', 5)).to.be.false;

				expect(minLengthTester([1, 2, 3, 4], 3)).to.be.true;
				expect(minLengthTester([1, 2, 3, 4], 4)).to.be.true;
				expect(minLengthTester([1, 2, 3, 4], 5)).to.be.false;
			});
		});

		describe('maxLengthTester()', () => {
			it('logic test', () => {
				expect(maxLengthTester('abcd', 3)).to.be.false;
				expect(maxLengthTester('abcd', 4)).to.be.true;
				expect(maxLengthTester('abcd', 5)).to.be.true;

				expect(maxLengthTester([1, 2, 3, 4], 3)).to.be.false;
				expect(maxLengthTester([1, 2, 3, 4], 4)).to.be.true;
				expect(maxLengthTester([1, 2, 3, 4], 5)).to.be.true;
			});
		});
	});

	describe('boolean', () => {
		describe('booleanTester()', () => {
			it('common test', () => {
				expect(commonTestRunner(
					booleanTester,
					false,
					false,
					true,
					false,
					false,
					false,
					false
				)).to.be.true;
			});

			it('logic test', () => {
				expect(booleanTester(true)).to.be.true;
				expect(booleanTester(false)).to.be.true;

				expect(booleanTester('true')).to.be.false;
				expect(booleanTester('false')).to.be.false;

				expect(booleanTester(1)).to.be.false;
				expect(booleanTester(0)).to.be.false;
			});
		});
	});

	describe('number', () => {
		describe('numberTester()', () => {
			it('common test', () => {
				expect(commonTestRunner(
					numberTester,
					false,
					false,
					false,
					true,
					false,
					false,
					false
				)).to.be.true;
			});

			it('logic test', () => {
				expect(numberTester(true)).to.be.false;
				expect(numberTester(null)).to.be.false;

				expect(numberTester(-10.6)).to.be.true;
				expect(numberTester(-1)).to.be.true;
				expect(numberTester(0)).to.be.true;
				expect(numberTester(5)).to.be.true;
				expect(numberTester(5.5)).to.be.true;

				expect(numberTester('8')).to.be.false;
				expect(numberTester('8.5')).to.be.false;

				expect(numberTester(NaN)).to.be.false;
			});
		});

		describe('integerTester()', () => {
			it('logic test', () => {
				expect(integerTester(-10.6)).to.be.false;
				expect(integerTester(-1)).to.be.true;
				expect(integerTester(0)).to.be.true;
				expect(integerTester(5)).to.be.true;
				expect(integerTester(5.5)).to.be.false;
			});
		});

		describe('indexTester()', () => {
			it('logic test', () => {
				expect(indexTester(-10.6)).to.be.false;
				expect(indexTester(-1)).to.be.false;
				expect(indexTester(0)).to.be.true;
				expect(indexTester(5)).to.be.true;
				expect(indexTester(5.5)).to.be.false;
			});
		});

		describe('minNumberTester()', () => {
			it('logic test', () => {
				expect(minNumberTester(-11, -12)).to.be.true;
				expect(minNumberTester(-11, -11)).to.be.true;
				expect(minNumberTester(-11, -10)).to.be.false;

				expect(minNumberTester(0, -1)).to.be.true;
				expect(minNumberTester(0, 0)).to.be.true;
				expect(minNumberTester(0, 1)).to.be.false;

				expect(minNumberTester(50, 49.9)).to.be.true;
				expect(minNumberTester(50, 50)).to.be.true;
				expect(minNumberTester(50, 50.1)).to.be.false;
			});
		});

		describe('exclusiveMinNumberTester()', () => {
			it('logic test', () => {
				expect(exclusiveMinNumberTester(-11, -12)).to.be.true;
				expect(exclusiveMinNumberTester(-11, -11)).to.be.false;
				expect(exclusiveMinNumberTester(-11, -10)).to.be.false;

				expect(exclusiveMinNumberTester(0, -1)).to.be.true;
				expect(exclusiveMinNumberTester(0, 0)).to.be.false;
				expect(exclusiveMinNumberTester(0, 1)).to.be.false;

				expect(exclusiveMinNumberTester(50, 49.9)).to.be.true;
				expect(exclusiveMinNumberTester(50, 50)).to.be.false;
				expect(exclusiveMinNumberTester(50, 50.1)).to.be.false;
			});
		});

		describe('maxNumberTester()', () => {
			it('logic test', () => {
				expect(maxNumberTester(-11, -12)).to.be.false;
				expect(maxNumberTester(-11, -11)).to.be.true;
				expect(maxNumberTester(-11, -10)).to.be.true;

				expect(maxNumberTester(0, -1)).to.be.false;
				expect(maxNumberTester(0, 0)).to.be.true;
				expect(maxNumberTester(0, 1)).to.be.true;

				expect(maxNumberTester(50, 49.9)).to.be.false;
				expect(maxNumberTester(50, 50)).to.be.true;
				expect(maxNumberTester(50, 50.1)).to.be.true;
			});
		});

		describe('exclusiveMaxNumberTester()', () => {
			it('logic test', () => {
				expect(exclusiveMaxNumberTester(-11, -12)).to.be.false;
				expect(exclusiveMaxNumberTester(-11, -11)).to.be.false;
				expect(exclusiveMaxNumberTester(-11, -10)).to.be.true;

				expect(exclusiveMaxNumberTester(0, -1)).to.be.false;
				expect(exclusiveMaxNumberTester(0, 0)).to.be.false;
				expect(exclusiveMaxNumberTester(0, 1)).to.be.true;

				expect(exclusiveMaxNumberTester(50, 49.9)).to.be.false;
				expect(exclusiveMaxNumberTester(50, 50)).to.be.false;
				expect(exclusiveMaxNumberTester(50, 50.1)).to.be.true;
			});
		});
	});

	describe('string', () => {
		describe('stringTester()', () => {
			it('common test', () => {
				expect(commonTestRunner(
					stringTester,
					false,
					false,
					false,
					false,
					true,
					false,
					false
				)).to.be.true;
			});

			it('logic test', () => {
				expect(stringTester('')).to.be.true;
				expect(stringTester(' ')).to.be.true;
				expect(stringTester('hello')).to.be.true;
			});
		});

		describe('stringRegExpTester()', () => {
			it('logic test', () => {
				expect(stringRegExpTester('abc', /abc/)).to.be.true;
				expect(stringRegExpTester('abc', /abcd/)).to.be.false;

				expect(stringRegExpTester('abc', new RegExp('abc'))).to.be.true;
				expect(stringRegExpTester('abc', new RegExp('abcd'))).to.be.false;
			});
		});

		describe('emailTester()', () => {
			it('logic test', () => {
				expect(emailTester('')).to.be.false;
				expect(emailTester(' ')).to.be.false;
				expect(emailTester('hello')).to.be.false;
				expect(emailTester('hello@')).to.be.false;
				expect(emailTester('hello@domain')).to.be.true;
				expect(emailTester('hello@domain.')).to.be.false;
				expect(emailTester('hello@domain.com')).to.be.true;
				expect(emailTester('hello@domain.com.')).to.be.false;
				expect(emailTester('hello@domain.com.another')).to.be.true;

				expect(emailTester('prettyandsimple@example.com')).to.be.true;
				expect(emailTester('very.common@example.com')).to.be.true;
				expect(emailTester('disposable.style.email.with+symbol@example.com')).to.be.true;
				expect(emailTester('other.email-with-dash@example.com')).to.be.true;
				expect(emailTester('x@example.com')).to.be.true;
				expect(emailTester('"much.more unusual"@example.com')).to.be.true;
				expect(emailTester('"very.unusual.@.unusual.com"@example.com')).to.be.true;
				expect(emailTester('example-indeed@strange-example.com')).to.be.true;
				expect(emailTester('admin@mailserver1')).to.be.true;
				expect(emailTester('#!$%&\'*+-/=?^_`{}|~@example.org')).to.be.true;
				expect(emailTester('"()<>[]:,;@\\\\\\"!#$%&\'-/=?^_`{}| ~.a"@example.org')).to.be.true;
				expect(emailTester('" "@example.org')).to.be.true;
				expect(emailTester('example@localhost')).to.be.true;
				expect(emailTester('example@s.solutions')).to.be.true;
				expect(emailTester('user@localserver')).to.be.true;
				expect(emailTester('user@tt')).to.be.true;
				expect(emailTester('user@[IPv6:2001:DB8::1]')).to.be.true;

				expect(emailTester('Abc.example.com')).to.be.false;
				expect(emailTester('A@b@c@example.com')).to.be.false;
				expect(emailTester('"A@b@c"@example.com')).to.be.true;

				expect(emailTester('a"b(c)d,e:f;g<h>i[j\\k]l@example.com')).to.be.false;
				expect(emailTester('just"not"right@example.com')).to.be.false;
				expect(emailTester('this is"not\allowed@example.com')).to.be.false;
				expect(emailTester('this\ still\"not\\allowed@example.com')).to.be.false;
				expect(emailTester('1234567890123456789012345678901234567890123456789012345678901234+x@example.com')).to.be.false;
				expect(emailTester('john..doe@example.com')).to.be.false;
				expect(emailTester('john.doe@example..com')).to.be.false;

				expect(emailTester(' ejv@ejv.com')).to.be.false;
				expect(emailTester('ejv@ejv.com ')).to.be.false;
			});
		});

		describe('dateFormatTester()', () => {
			it('logic test', () => {
				//// ISO 8601
				// year
				expect(dateFormatTester('100')).to.be.false;
				expect(dateFormatTester('1000')).to.be.true;
				expect(dateFormatTester('+2000')).to.be.true;
				expect(dateFormatTester('-2000')).to.be.true;

				// calendar date
				expect(dateFormatTester('2018-1-17')).to.be.false;
				expect(dateFormatTester('2018-12-32')).to.be.false;
				expect(dateFormatTester('2018-12-17')).to.be.true;
				expect(dateFormatTester('2018-13-17')).to.be.false;
				expect(dateFormatTester('2018-12-7')).to.be.false;

				// expect(dateFormatTester('2018117')).to.be.false; // matching for ordinal dates
				expect(dateFormatTester('20181217')).to.be.true;
				expect(dateFormatTester('20181317')).to.be.false;
				expect(dateFormatTester('20181232')).to.be.false;

				expect(dateFormatTester('2018-1')).to.be.false;
				expect(dateFormatTester('2018-12')).to.be.true;
				expect(dateFormatTester('2018-13')).to.be.false;

				expect(dateFormatTester('--1-17')).to.be.false;
				expect(dateFormatTester('--12-1')).to.be.false;
				expect(dateFormatTester('--12-17')).to.be.true;
				expect(dateFormatTester('--13-17')).to.be.false;
				expect(dateFormatTester('--12-32')).to.be.false;

				expect(dateFormatTester('--117')).to.be.false;
				expect(dateFormatTester('--1317')).to.be.false;
				expect(dateFormatTester('--1232')).to.be.false;
				expect(dateFormatTester('--1217')).to.be.true;

				// week dates
				expect(dateFormatTester('2018-W01')).to.be.true;
				expect(dateFormatTester('2018-W53')).to.be.true;

				expect(dateFormatTester('2018-W00')).to.be.false;
				expect(dateFormatTester('2018-W54')).to.be.false;

				expect(dateFormatTester('2018-W01-3')).to.be.true;
				expect(dateFormatTester('2018-W53-7')).to.be.true;

				expect(dateFormatTester('2018-W01-0')).to.be.false;
				expect(dateFormatTester('2018-W53-8')).to.be.false;

				expect(dateFormatTester('2018W01')).to.be.true;
				expect(dateFormatTester('2018W53')).to.be.true;

				expect(dateFormatTester('2018W00')).to.be.false;
				expect(dateFormatTester('2018W54')).to.be.false;

				expect(dateFormatTester('2018W010')).to.be.false;
				expect(dateFormatTester('2018W538')).to.be.false;

				// ordinal dates
				expect(dateFormatTester('2018-052')).to.be.true;

				expect(dateFormatTester('2018-000')).to.be.false;
				expect(dateFormatTester('2018-367')).to.be.false;

				expect(dateFormatTester('2018052')).to.be.true;

				expect(dateFormatTester('2018000')).to.be.false;
				expect(dateFormatTester('2018367')).to.be.false;
			});
		});

		describe('timeFormatTester()', () => {
			it('logic test', () => {
				// hh:mm:ss.sss, hh:mm:ss
				expect(timeFormatTester('23:35:12.123')).to.be.true;
				expect(timeFormatTester('24:00:00')).to.be.true;
				expect(timeFormatTester('24:00:00.000')).to.be.true;

				expect(timeFormatTester('3:35:12.123')).to.be.false;
				expect(timeFormatTester('24:35:12.123')).to.be.false;
				expect(timeFormatTester('25:35:12.123')).to.be.false;

				expect(timeFormatTester('23:0:12.123')).to.be.false;
				expect(timeFormatTester('23:60:12.123')).to.be.false;

				expect(timeFormatTester('23:35:2.123')).to.be.false;
				expect(timeFormatTester('23:35:60.123')).to.be.true; // leap second
				expect(timeFormatTester('23:35:61.123')).to.be.false;

				expect(timeFormatTester('23:35:12')).to.be.true;
				expect(timeFormatTester('23:35:12.1')).to.be.true;
				expect(timeFormatTester('23:35:12.12')).to.be.true;
				expect(timeFormatTester('23:35:12.123')).to.be.true;
				expect(timeFormatTester('23:35:12.1234')).to.be.true;
				expect(timeFormatTester('23:35:12.12356789')).to.be.true;

				// hh:mm
				expect(timeFormatTester('23:52')).to.be.true;
				expect(timeFormatTester('24:00')).to.be.true;

				expect(timeFormatTester('2:52')).to.be.false;
				expect(timeFormatTester('24:52')).to.be.false;

				expect(timeFormatTester('23:2')).to.be.false;
				expect(timeFormatTester('23:60')).to.be.false;

				// hhmmss.sss, hhmmss
				expect(timeFormatTester('233512.123')).to.be.true;
				expect(timeFormatTester('240000')).to.be.true;
				expect(timeFormatTester('240000.000')).to.be.true;

				expect(timeFormatTester('33512.123')).to.be.false;
				expect(timeFormatTester('243512.123')).to.be.false;
				expect(timeFormatTester('253512.123')).to.be.false;

				expect(timeFormatTester('23012.123')).to.be.false;
				expect(timeFormatTester('236012.123')).to.be.false;

				expect(timeFormatTester('23352.123')).to.be.false;
				expect(timeFormatTester('233560.123')).to.be.true; // leap second
				expect(timeFormatTester('233561.123')).to.be.false;

				expect(timeFormatTester('233512')).to.be.true;
				expect(timeFormatTester('233512.1')).to.be.true;
				expect(timeFormatTester('233512.12')).to.be.true;
				expect(timeFormatTester('233512.123')).to.be.true;
				expect(timeFormatTester('233512.1234')).to.be.true;
				expect(timeFormatTester('233512.12356789')).to.be.true;

				// hhmm
				expect(timeFormatTester('2352')).to.be.true;
				expect(timeFormatTester('2400')).to.be.true;

				expect(timeFormatTester('252')).to.be.false;
				expect(timeFormatTester('2452')).to.be.false;

				expect(timeFormatTester('2360')).to.be.false;

				// hh
				expect(timeFormatTester('00')).to.be.true;
				expect(timeFormatTester('05')).to.be.true;
				expect(timeFormatTester('24')).to.be.true;

				expect(timeFormatTester('25')).to.be.false;
			});
		});

		describe('dateTimeFormatTester()', () => {
			it('logic test', () => {
				// RFC 3339
				expect(dateTimeFormatTester('2018-12-16T05:04:05')).to.be.true;
				expect(dateTimeFormatTester('2018-12-16T05:04:05.51')).to.be.true;
				expect(dateTimeFormatTester('2018-12-16T05:04:05.51Z')).to.be.true;
				expect(dateTimeFormatTester('2018-12-16T05:04:05+09:00')).to.be.true;

				expect(dateTimeFormatTester('2018-12-16T03:34:21')).to.be.true;
				expect(dateTimeFormatTester('2018-12-16T03:34:21Z')).to.be.true;
				expect(dateTimeFormatTester('2018-12-16T03:34:21.000')).to.be.true;
				expect(dateTimeFormatTester('2018-12-16T03:34:21.000Z')).to.be.true;
				expect(dateTimeFormatTester('2018-12-16T03:34:21.000+09:00')).to.be.true;
				expect(dateTimeFormatTester('2018-12-16T03:34:21.000-08:00')).to.be.true;

				expect(dateTimeFormatTester('2018-00-16T03:34:21')).to.be.false;
				expect(dateTimeFormatTester('2018-13-16T03:34:21')).to.be.false;
				expect(dateTimeFormatTester('2018-1-16T03:34:21')).to.be.false;
				expect(dateTimeFormatTester('2018-12-6T03:34:21')).to.be.false;
				expect(dateTimeFormatTester('2018-12-32T03:34:21')).to.be.false;
				expect(dateTimeFormatTester('2018-12-16T0:34:21')).to.be.false;
				expect(dateTimeFormatTester('2018-12-16T24:34:21')).to.be.false;
				expect(dateTimeFormatTester('2018-12-16T03:4:21')).to.be.false;
				expect(dateTimeFormatTester('2018-12-16T03:60:21')).to.be.false;
				expect(dateTimeFormatTester('2018-12-16T03:34:1')).to.be.false;
				expect(dateTimeFormatTester('2018-12-16T03:34:60')).to.be.false;
				expect(dateTimeFormatTester('2018-12-16T03:34:21.')).to.be.false;

				// // leap second inserted
				// expect(dateTimeFormatTester('1990-12-31T23:59:60Z')).to.be.true;
				// expect(dateTimeFormatTester('1990-12-31T15:59:60-08:00')).to.be.true;

				// ISO 8601
				expect(dateTimeFormatTester('20181219T00:38:05Z')).to.be.true;
				expect(dateTimeFormatTester('20181219T00:38:05+00:00')).to.be.true;
			});
		});
	});

	// describe('urlTester()', () => {
	// 	it('common test', () => {
	// 		expect(commonTestRunner(
	// 			urlTester,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false
	// 		)).to.be.true;
	// 	});
	//
	// 	it('logic test', () => {
	// 		expect(urlTester('')).to.be.false;
	// 		expect(urlTester(' ')).to.be.false;
	// 		expect(urlTester('hello')).to.be.false;
	// 		expect(urlTester('http://hello')).to.be.false;
	// 		expect(urlTester('https://hello')).to.be.false;
	// 		expect(urlTester('http://hello.com')).to.be.true;
	// 		expect(urlTester('http://hello.com/')).to.be.true;
	// 		expect(urlTester('http://hello.com/#1')).to.be.true;
	// 		expect(urlTester('http://hello.com/child')).to.be.true;
	// 		expect(urlTester('http://hello.com/child/grand')).to.be.true;
	// 		expect(urlTester('http://hello.com/child/grand?query=some')).to.be.true;
	// 		expect(urlTester('http://hello.com/child/grand(some:angular)')).to.be.true;
	// 	});
	// });
	//
	// describe('ipv4Tester()', () => {
	// 	it('common test', () => {
	// 		expect(commonTestRunner(
	// 			ipv4Tester,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false
	// 		)).to.be.true;
	// 	});
	//
	// 	it('logic test', () => {
	// 		expect(ipv4Tester('')).to.be.false;
	// 		expect(ipv4Tester(' ')).to.be.false;
	// 		expect(ipv4Tester('127.0.0')).to.be.false;
	// 		expect(ipv4Tester('127.0.0.1')).to.be.true;
	// 		expect(ipv4Tester('256.0.0.1')).to.be.false;
	// 		expect(ipv4Tester('255.-1.0.1')).to.be.false;
	// 		expect(ipv4Tester('255.256.267.1')).to.be.false;
	// 		expect(ipv4Tester('255.255.255.0')).to.be.true;
	// 		expect(ipv4Tester('255.255.255.0.5')).to.be.false;
	// 	});
	// });
	//
	// describe('ipv6Tester()', () => {
	// 	it('common test', () => {
	// 		expect(commonTestRunner(
	// 			ipv6Tester,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false,
	// 			false
	// 		)).to.be.true;
	// 	});
	//
	// 	it('logic test', () => {
	// 		expect(ipv6Tester('')).to.be.false;
	// 		expect(ipv6Tester(' ')).to.be.false;
	// 		expect(ipv6Tester('127.0.0')).to.be.false;
	// 		// expect(ipv6Tester('1762:0:0:0:0:B03:1:AF18')).to.be.true;
	// 		// expect(ipv6Tester('fe80:0000:0000:0000:0204:61ff:fe9d:f156/1')).to.be.true;
	// 		expect(ipv6Tester('1200:0000:AB00:1234:O000:2552:7777:1313')).to.be.false; // has invalid character
	// 	});
	// });

	describe('object', () => {
		describe('objectTester()', () => {
			it('common test', () => {
				expect(commonTestRunner(
					objectTester,
					true, // null is object
					false,
					false,
					false,
					false,
					true, // array is object
					true
				)).to.be.true;
			});

			it('logic test', () => {
				expect(objectTester(null)).to.be.true;
				expect(objectTester({})).to.be.true;
				expect(objectTester({ a : 1 })).to.be.true;
			});
		});

		describe('hasPropertyTester()', () => {
			it('logic test', () => {
				expect(hasPropertyTester({})).to.be.false;
				expect(hasPropertyTester({ a : 1 })).to.be.true;
			});
		});
	});

	describe('date', () => {
		const now : Date = new Date();

		const year : number = now.getFullYear();
		const month : number = now.getMonth();
		const date : number = now.getDate();

		const hours : number = now.getHours();
		const minutes : number = now.getMinutes();
		const seconds : number = now.getSeconds();
		const ms : number = now.getMilliseconds();

		describe('dateTester()', () => {
			it('common test', () => {
				expect(commonTestRunner(
					dateTester,
					false,
					false,
					false,
					false,
					false,
					false,
					false
				)).to.be.true;
			});

			it('logic test', () => {
				expect(dateTester(new Date)).to.be.true;
				expect(dateTester((new Date).toISOString())).to.be.false;
			});
		});

		it('minDateTester()', () => {
			expect(minDateTester(
				new Date(year, month, date),
				new Date(year, month, date - 1)
			)).to.be.true;
			expect(minDateTester(
				new Date(year, month, date),
				new Date(year, month, date)
			)).to.be.true;
			expect(minDateTester(
				new Date(year, month, date),
				new Date(year, month, date + 1)
			)).to.be.false;

			expect(minDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms - 1)
			)).to.be.true;
			expect(minDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms)
			)).to.be.true;
			expect(minDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms + 1)
			)).to.be.false;
		});

		it('exclusiveMinDateTester()', () => {
			expect(exclusiveMinDateTester(
				new Date(year, month, date),
				new Date(year, month, date - 1)
			)).to.be.true;
			expect(exclusiveMinDateTester(
				new Date(year, month, date),
				new Date(year, month, date)
			)).to.be.false;
			expect(exclusiveMinDateTester(
				new Date(year, month, date),
				new Date(year, month, date + 1)
			)).to.be.false;

			expect(exclusiveMinDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms - 1)
			)).to.be.true;
			expect(exclusiveMinDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms)
			)).to.be.false;
			expect(exclusiveMinDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms + 1)
			)).to.be.false;
		});

		it('maxDateTester()', () => {
			expect(maxDateTester(
				new Date(year, month, date),
				new Date(year, month, date - 1)
			)).to.be.false;
			expect(maxDateTester(
				new Date(year, month, date),
				new Date(year, month, date)
			)).to.be.true;
			expect(maxDateTester(
				new Date(year, month, date),
				new Date(year, month, date + 1)
			)).to.be.true;

			expect(maxDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms - 1)
			)).to.be.false;
			expect(maxDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms)
			)).to.be.true;
			expect(maxDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms + 1)
			)).to.be.true;
		});

		it('exclusiveMaxDateTester()', () => {
			expect(exclusiveMaxDateTester(
				new Date(year, month, date),
				new Date(year, month, date - 1)
			)).to.be.false;
			expect(exclusiveMaxDateTester(
				new Date(year, month, date),
				new Date(year, month, date)
			)).to.be.false;
			expect(exclusiveMaxDateTester(
				new Date(year, month, date),
				new Date(year, month, date + 1)
			)).to.be.true;

			expect(exclusiveMaxDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms - 1)
			)).to.be.false;
			expect(exclusiveMaxDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms)
			)).to.be.false;
			expect(exclusiveMaxDateTester(
				new Date(year, month, date, hours, minutes, seconds, ms),
				new Date(year, month, date, hours, minutes, seconds, ms + 1)
			)).to.be.true;
		});
	});

	describe('array', () => {
		describe('arrayTester()', () => {
			it('common test', () => {
				expect(commonTestRunner(
					arrayTester,
					false,
					false,
					false,
					false,
					false,
					true,
					false
				)).to.be.true;
			});

			it('logic test', () => {
				expect(arrayTester([])).to.be.true;
				expect(arrayTester('not_array')).to.be.false;
			});
		});

		describe('arrayTypeOfTester()', () => {
			it('logic test', () => {
				expect(arrayTypeOfTester([], DataType.NUMBER)).to.be.true;
				expect(arrayTypeOfTester([1, 2], DataType.NUMBER)).to.be.true;
				expect(arrayTypeOfTester([1, 2, '3'], DataType.NUMBER)).to.be.false;

				expect(arrayTypeOfTester([new Date, new Date, new Date], DataType.DATE)).to.be.true;
			});
		});

		describe('uniqueItemsTester()', () => {
			it('logic test', () => {
				expect(uniqueItemsTester([])).to.be.true;
				expect(uniqueItemsTester([1, 2])).to.be.true;
				expect(uniqueItemsTester([1, 2, 2])).to.be.false;
			});
		});
	});

	describe('regexp', () => {
		describe('regExpTester()', () => {
			it('common test', () => {
				expect(commonTestRunner(
					regExpTester,
					false,
					false,
					false,
					false,
					false,
					false,
					false
				)).to.be.true;
			});

			it('logic test', () => {
				expect(regExpTester(/\d/)).to.be.true;
				expect(regExpTester(new RegExp('\d'))).to.be.true;

				expect(regExpTester('\d')).to.be.false;
			});
		});
	});
});
