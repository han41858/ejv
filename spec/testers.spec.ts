import { expect } from 'chai';

import { commonTestRunner } from './common-test-runner';

import {
	arrayTester,
	booleanTester,
	dateTester,
	definedTester,
	indexTester,
	integerTester,
	numberTester,
	objectTester,
	stringTester
} from '../src/tester';

describe('testers', function () {
	describe('defined', () => {
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

			it('additional test', () => {
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

			it('additional test', () => {
				expect(numberTester(true)).to.be.false;
				expect(numberTester(null)).to.be.false;

				expect(numberTester(-10.6)).to.be.true;
				expect(numberTester(-1)).to.be.true;
				expect(numberTester(0)).to.be.true;
				expect(numberTester(5)).to.be.true;
				expect(numberTester(5.5)).to.be.true;

				expect(numberTester('8')).to.be.false;
				expect(numberTester('8.5')).to.be.false;
			});
		});

		describe('integerTester()', () => {
			it('optional test', () => {
				expect(integerTester(-10.6)).to.be.false;
				expect(integerTester(-1)).to.be.true;
				expect(integerTester(0)).to.be.true;
				expect(integerTester(5)).to.be.true;
				expect(integerTester(5.5)).to.be.false;
			});
		});

		describe('indexTester()', () => {
			it('optional test', () => {
				expect(indexTester(-10.6)).to.be.false;
				expect(indexTester(-1)).to.be.false;
				expect(indexTester(0)).to.be.true;
				expect(indexTester(5)).to.be.true;
				expect(indexTester(5.5)).to.be.false;
			});
		});
	});

	// describe('integerTester()', () => {
	// 	it('common test', () => {
	// 		expect(commonTestRunner(
	// 			integerTester,
	// 			false,
	// 			false,
	// 			false,
	// 			true,
	// 			false,
	// 			false,
	// 			false
	// 		)).to.be.true;
	// 	});
	//
	// 	it('additional test', () => {
	// 		expect(integerTester(-10.6)).to.be.false;
	// 		expect(integerTester(-1)).to.be.true;
	// 		expect(integerTester(0)).to.be.true;
	// 		expect(integerTester(5)).to.be.true;
	// 		expect(integerTester(5.5)).to.be.false;
	//
	// 		expect(integerTester('8')).to.be.false;
	// 		expect(integerTester('8.5')).to.be.false;
	// 	});
	// });
	//
	// describe('indexTester()', () => {
	// 	it('common test', () => {
	// 		expect(commonTestRunner(
	// 			indexTester,
	// 			false,
	// 			false,
	// 			false,
	// 			true,
	// 			false,
	// 			false,
	// 			false
	// 		)).to.be.true;
	// 	});
	//
	// 	it('additional test', () => {
	// 		expect(indexTester(-10.6)).to.be.false;
	// 		expect(indexTester(-1)).to.be.false;
	// 		expect(indexTester(0)).to.be.true;
	// 		expect(indexTester(5)).to.be.true;
	// 		expect(indexTester(5.5)).to.be.false;
	//
	// 		expect(indexTester('8')).to.be.false;
	// 		expect(indexTester('8.5')).to.be.false;
	// 	});
	// });

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

		it('additional test', () => {
			expect(stringTester('')).to.be.true;
			expect(stringTester(' ')).to.be.true;
			expect(stringTester('hello')).to.be.true;
		});
	});

	// describe('emailTester()', () => {
	// 	it('common test', () => {
	// 		expect(commonTestRunner(
	// 			emailTester,
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
	// 	it('additional test', () => {
	// 		expect(emailTester('')).to.be.false;
	// 		expect(emailTester(' ')).to.be.false;
	// 		expect(emailTester('hello')).to.be.false;
	// 		expect(emailTester('hello@')).to.be.false;
	// 		expect(emailTester('hello@domain')).to.be.false;
	// 		expect(emailTester('hello@domain.')).to.be.false;
	// 		expect(emailTester('hello@domain.com')).to.be.true;
	// 		expect(emailTester('hello@domain.com.')).to.be.false;
	// 		expect(emailTester('hello@domain.com.another')).to.be.true;
	// 	});
	// });
	//
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
	// 	it('additional test', () => {
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
	// 	it('additional test', () => {
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
	// 	it('additional test', () => {
	// 		expect(ipv6Tester('')).to.be.false;
	// 		expect(ipv6Tester(' ')).to.be.false;
	// 		expect(ipv6Tester('127.0.0')).to.be.false;
	// 		// expect(ipv6Tester('1762:0:0:0:0:B03:1:AF18')).to.be.true;
	// 		// expect(ipv6Tester('fe80:0000:0000:0000:0204:61ff:fe9d:f156/1')).to.be.true;
	// 		expect(ipv6Tester('1200:0000:AB00:1234:O000:2552:7777:1313')).to.be.false; // has invalid character
	// 	});
	// });

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

		it('additional test', () => {
			expect(objectTester(null)).to.be.true;
			expect(objectTester({})).to.be.true;
			expect(objectTester({ a : 1 })).to.be.true;
		});
	});

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

		it('additional test', () => {
			expect(dateTester(new Date)).to.be.true;
			expect(dateTester((new Date).toISOString())).to.be.false;
		});
	});

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

		it('additional test', () => {
			expect(arrayTester([])).to.be.true;
			expect(arrayTester('not_array')).to.be.false;
		});
	});
});
