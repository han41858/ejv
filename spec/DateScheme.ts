import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { typeTester } from './common-test-runner';


describe('DateScheme', () => {
	const now: Date = new Date();

	const year: number = now.getFullYear();
	const month: number = now.getMonth();
	const date: number = now.getDate();

	const hours: number = now.getHours();
	const minutes: number = now.getMinutes();
	const seconds: number = now.getSeconds();
	const ms: number = now.getMilliseconds();

	const nowOnlyDate: Date = new Date();
	nowOnlyDate.setHours(0, 0, 0, 0);

	const dateTestData = {
		date: nowOnlyDate
	};

	const dateTimeTestData = {
		date: now
	};

	function padZero (value: number, digit = 2): string {
		return ('' + value).padStart(digit, '0');
	}

	function getDateStr (
		year: number, month: number, date: number,
		hours?: number, minutes?: number, seconds?: number, ms?: number
	): string {
		const tempDate: Date = hours !== undefined ?
			new Date(year, month, date, hours, minutes, seconds, ms) :
			new Date(year, month, date);

		const dateStr: string = [
			tempDate.getFullYear(),
			padZero(tempDate.getMonth() + 1),
			padZero(tempDate.getDate())
		].join('-');

		const hoursStr: string = hours !== undefined ?
			[
				'T',
				[
					padZero(hours),
					padZero(minutes),
					padZero(seconds)
				].join(':'),
				'.',
				padZero(ms, 3),
				'Z'
			].join('') :
			'';

		return dateStr + hoursStr;
	}

	describe('type', () => {
		describe('mismatch', () => {
			typeTester.filter(obj => obj.type !== 'date')
				.forEach((obj) => {
					const data = {
						a: obj.value
					};

					it(obj.type, () => {
						const error: EjvError = ejv(data, [{
							key: 'a',
							type: 'date'
						}]);

						expect(error).to.be.instanceof(EjvError);
						expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
						expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
							placeholders: ['date']
						}));
						expect(error.path).to.be.eql('a');
						expect(error.data).to.be.deep.equal(data);
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = 'ejv';
				const typeArr: string[] = ['boolean', 'date'];

				const data = {
					a: value
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: typeArr
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH_ONE_OF, {
					placeholders: [JSON.stringify(typeArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(value);
			});
		});

		describe('match', () => {
			it('optional', () => {
				expect(ejv({
					a: undefined
				}, [{
					key: 'a',
					type: 'date',
					optional: true
				}])).to.be.null;
			});

			it('single type', () => {
				expect(ejv({
					a: new Date
				}, [{
					key: 'a',
					type: 'date'
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: new Date
				}, [{
					key: 'a',
					type: ['date', 'number']
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: new Date
				}, [{
					key: 'a',
					type: ['number', 'date']
				}])).to.be.null;
			});
		});
	});

	describe('min & exclusiveMin', () => {
		describe('check parameter', () => {
			it('min === null', () => {
				expect(() => ejv({
					date: new Date
				}, [{
					key: 'date',
					type: 'date',
					min: null
				}])).to.throw(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING);
			});

			it('exclusiveMin === null', () => {
				expect(() => ejv({
					date: new Date
				}, [{
					key: 'date',
					type: 'date',
					min: new Date,
					exclusiveMin: null
				}])).to.throw(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
			});
		});

		describe('by date', () => {

			it('without exclusiveMin', () => {
				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date - 1)
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date)
				}])).to.be.null;

				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date + 1)
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				// with time
				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms - 1)
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms)
				}])).to.be.null;

				const error2: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms + 1)
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);
			});

			it('exclusiveMin === false', () => {
				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date - 1),
					exclusiveMin: false
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date),
					exclusiveMin: false
				}])).to.be.null;

				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date + 1),
					exclusiveMin: false
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				// with time
				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms - 1),
					exclusiveMin: false
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms),
					exclusiveMin: false
				}])).to.be.null;

				const error2: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms + 1),
					exclusiveMin: false
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);
			});

			it('exclusiveMin === true', () => {
				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date - 1),
					exclusiveMin: true
				}])).to.be.null;

				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date),
					exclusiveMin: true
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.AFTER_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.AFTER_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				const error2: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date + 1),
					exclusiveMin: true
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.AFTER_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.AFTER_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				// with time
				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms - 1),
					exclusiveMin: true
				}])).to.be.null;

				const error3: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms),
					exclusiveMin: true
				}]);

				expect(error3).to.be.instanceof(EjvError);
				expect(error3.type).to.be.eql(ErrorType.AFTER_DATE);
				expect(error3.message).to.include(createErrorMsg(ErrorMsg.AFTER_DATE, {
					placeholders: ['']
				}));
				expect(error3.path).to.be.eql('date');
				expect(error3.data).to.be.deep.equal(dateTimeTestData);
				expect(error3.errorData).to.be.instanceof(Date);

				const error4: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: new Date(year, month, date, hours, minutes, seconds, ms + 1),
					exclusiveMin: true
				}]);

				expect(error4).to.be.instanceof(EjvError);
				expect(error4.type).to.be.eql(ErrorType.AFTER_DATE);
				expect(error4.message).to.include(createErrorMsg(ErrorMsg.AFTER_DATE, {
					placeholders: ['']
				}));
				expect(error4.path).to.be.eql('date');
				expect(error4.data).to.be.deep.equal(dateTimeTestData);
				expect(error4.errorData).to.be.instanceof(Date);
			});
		});

		describe('by date string', () => {
			it('without exclusiveMin', () => {
				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date - 1)
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date)
				}])).to.be.null;

				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date + 1)
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				// with time
				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms - 1)
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms)
				}])).to.be.null;

				const error2: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms + 1)
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);
			});

			it('exclusiveMin === false', () => {
				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date - 1),
					exclusiveMin: false
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date),
					exclusiveMin: false
				}])).to.be.null;

				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date + 1),
					exclusiveMin: false
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				// with time
				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms - 1),
					exclusiveMin: false
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms),
					exclusiveMin: false
				}])).to.be.null;

				const error2: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms + 1),
					exclusiveMin: false
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);
			});

			it('exclusiveMin === true', () => {
				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date - 1),
					exclusiveMin: true
				}])).to.be.null;

				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date),
					exclusiveMin: true
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.AFTER_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.AFTER_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				const error2: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date + 1),
					exclusiveMin: true
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.AFTER_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.AFTER_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				// with time
				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms - 1),
					exclusiveMin: true
				}])).to.be.null;

				const error3: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms),
					exclusiveMin: true
				}]);

				expect(error3).to.be.instanceof(EjvError);
				expect(error3.type).to.be.eql(ErrorType.AFTER_DATE);
				expect(error3.message).to.include(createErrorMsg(ErrorMsg.AFTER_DATE, {
					placeholders: ['']
				}));
				expect(error3.path).to.be.eql('date');
				expect(error3.data).to.be.deep.equal(dateTimeTestData);
				expect(error3.errorData).to.be.instanceof(Date);

				const error4: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					min: getDateStr(year, month, date, hours, minutes, seconds, ms + 1),
					exclusiveMin: true
				}]);

				expect(error4).to.be.instanceof(EjvError);
				expect(error4.type).to.be.eql(ErrorType.AFTER_DATE);
				expect(error4.message).to.include(createErrorMsg(ErrorMsg.AFTER_DATE, {
					placeholders: ['']
				}));
				expect(error4.path).to.be.eql('date');
				expect(error4.data).to.be.deep.equal(dateTimeTestData);
				expect(error4.errorData).to.be.instanceof(Date);
			});
		});
	});

	describe('max & exclusiveMax', () => {
		describe('check parameter', () => {
			it('max === null', () => {
				expect(() => ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: null
				}])).to.throw(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING);
			});

			it('exclusiveMax === null', () => {
				expect(() => ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date,
					exclusiveMax: null
				}])).to.throw(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
			});
		});

		describe('by date', () => {
			it('without exclusiveMax', () => {
				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date - 1)
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date)
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date + 1)
				}])).to.be.null;

				// with time
				const error2: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms - 1)
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms)
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms + 1)
				}])).to.be.null;
			});

			it('exclusiveMax === false', () => {
				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date - 1),
					exclusiveMax: false
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date),
					exclusiveMax: false
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date + 1),
					exclusiveMax: false
				}])).to.be.null;

				// with time
				const error2: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms - 1),
					exclusiveMax: false
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms),
					exclusiveMax: false
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms + 1),
					exclusiveMax: false
				}])).to.be.null;
			});

			it('exclusiveMax === true', () => {
				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date - 1),
					exclusiveMax: true
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				const error2: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date),
					exclusiveMax: true
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date + 1),
					exclusiveMax: true
				}])).to.be.null;

				// with time
				const error3: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms - 1),
					exclusiveMax: true
				}]);

				expect(error3).to.be.instanceof(EjvError);
				expect(error3.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error3.message).to.include(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: ['']
				}));
				expect(error3.path).to.be.eql('date');
				expect(error3.data).to.be.deep.equal(dateTimeTestData);
				expect(error3.errorData).to.be.instanceof(Date);

				const error4: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms),
					exclusiveMax: true
				}]);

				expect(error4).to.be.instanceof(EjvError);
				expect(error4.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error4.message).to.include(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: ['']
				}));
				expect(error4.path).to.be.eql('date');
				expect(error4.data).to.be.deep.equal(dateTimeTestData);
				expect(error4.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms + 1),
					exclusiveMax: true
				}])).to.be.null;
			});
		});

		describe('by date string', () => {
			it('without exclusiveMax', () => {
				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date - 1)
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date)
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date + 1)
				}])).to.be.null;

				// with time
				const error2: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms - 1)
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms)
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms + 1)
				}])).to.be.null;
			});

			it('exclusiveMax === false', () => {
				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date - 1),
					exclusiveMax: false
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date),
					exclusiveMax: false
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date + 1),
					exclusiveMax: false
				}])).to.be.null;

				// with time
				const error2: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms - 1),
					exclusiveMax: false
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms),
					exclusiveMax: false
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms + 1),
					exclusiveMax: false
				}])).to.be.null;
			});

			it('exclusiveMax === true', () => {
				const error1: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date - 1),
					exclusiveMax: true
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error1.message).to.include(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: ['']
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				const error2: EjvError = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date),
					exclusiveMax: true
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.message).to.include(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: ['']
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date + 1),
					exclusiveMax: true
				}])).to.be.null;

				// with time
				const error3: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms - 1),
					exclusiveMax: true
				}]);

				expect(error3).to.be.instanceof(EjvError);
				expect(error3.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error3.message).to.include(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: ['']
				}));
				expect(error3.path).to.be.eql('date');
				expect(error3.data).to.be.deep.equal(dateTimeTestData);
				expect(error3.errorData).to.be.instanceof(Date);

				const error4: EjvError = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms),
					exclusiveMax: true
				}]);

				expect(error4).to.be.instanceof(EjvError);
				expect(error4.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error4.message).to.include(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: ['']
				}));
				expect(error4.path).to.be.eql('date');
				expect(error4.data).to.be.deep.equal(dateTimeTestData);
				expect(error4.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: getDateStr(year, month, date, hours, minutes, seconds, ms + 1),
					exclusiveMax: true
				}])).to.be.null;
			});
		});
	});
});
