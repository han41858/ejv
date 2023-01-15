import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { DateScheme, EjvError } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { TypeTester, typeTesterArr } from './common-test-runner';


describe('DateScheme', () => {
	const now: Date = new Date();

	const year: number = now.getFullYear();
	const month: number = now.getMonth();
	const date: number = now.getDate();

	const hours: number = now.getHours();
	const minutes: number = now.getMinutes();
	const seconds: number = now.getSeconds();
	const ms: number = now.getMilliseconds();

	// TODO: deprecate
	const nowOnlyDate: Date = new Date();
	nowOnlyDate.setHours(0, 0, 0, 0);

	// TODO: deprecate
	const dateTestData = {
		date: nowOnlyDate
	};

	// TODO: deprecate
	const dateTimeTestData = {
		date: now
	};

	const TestCases: Date[] = [
		// dates
		new Date(year, month, date - 1),
		new Date(year, month, date),
		new Date(year, month, date + 1),

		// with time
		new Date(year, month, date, hours, minutes, seconds, ms - 1),
		new Date(year, month, date, hours, minutes, seconds, ms),
		new Date(year, month, date, hours, minutes, seconds, ms + 1)
	];

	type ResultDefine = {
		scheme: Partial<DateScheme>;

		error: null | keyof typeof ErrorType;
		placeholder?: string;
		reverse?: boolean;
	}


	function checkError (defines: ResultDefine[]): void {
		if (defines.length !== TestCases.length) {
			throw new Error('invalid spec');
		}

		defines.forEach((define: ResultDefine, i: number): void => {
			const checkValue: Date = i < 3 ? nowOnlyDate : now;

			const result: EjvError | null = ejv({
				date: checkValue
			}, [{
				key: 'date',
				type: 'date',

				...define.scheme
			}]);

			console.log('## %o', {
				i,
				data: {
					date: checkValue
				},
				scheme: [{
					key: 'date',
					type: 'date',

					...define.scheme
				}],
				result
			});


			if (define.error === null) {
				expect(result).to.be.null;
			}
			else {
				expect(result).to.be.instanceOf(EjvError);

				if (!result) {
					throw new Error('spec failed');
				}

				expect(result.type).to.be.eql(ErrorType[define.error]);
				expect(result.message).to.eql(createErrorMsg(ErrorMsg[define.error], {
					placeholders: [define.placeholder || ''],
					reverse: define.reverse || false
				}));
				expect(result.path).to.be.eql('date');
				expect(result.errorData).to.be.instanceof(Date);
				expect(result.errorData).to.be.eql(checkValue);
			}
		});
	}


	describe('type', () => {
		describe('mismatch', () => {
			typeTesterArr
				.filter((obj: TypeTester): boolean => obj.type !== 'date')
				.forEach((obj: TypeTester): void => {
					const data = {
						a: obj.value
					};

					it(obj.type, () => {
						const error: EjvError | null = ejv(data, [{
							key: 'a',
							type: 'date'
						}]);

						expect(error).to.be.instanceof(EjvError);

						if (!error) {
							throw new Error('spec failed');
						}

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

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: typeArr
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

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

	// TODO: nested not
	describe.skip('min & exclusiveMin', () => {
		describe('check parameter', () => {
			describe('normal', () => {
				it('min === null', () => {
					expect(() => ejv({
						date: new Date
					}, [{
						key: 'date',
						type: 'date',
						min: null as unknown as number
					}])).to.throw(createErrorMsg(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING));
				});

				it('exclusiveMin === null', () => {
					expect(() => ejv({
						date: new Date
					}, [{
						key: 'date',
						type: 'date',
						min: new Date(),
						exclusiveMin: null as unknown as boolean
					}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN));
				});
			});

			describe('not', () => {
				it('min === null', () => {
					expect(() => ejv({
						date: new Date()
					}, [{
						key: 'date',
						type: 'date',
						not: {
							min: null as unknown as number
						}
					}])).to.throw(createErrorMsg(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING));
				});

				it.skip('exclusiveMin === null', () => {
					expect(() => ejv({
						date: new Date
					}, [{
						key: 'date',
						type: 'date',
						min: new Date(),
						not: {
							exclusiveMin: null as unknown as boolean
						}
					}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN));
				});
			});
		});

		describe('by date', () => {
			describe('min only', () => {
				it('normal', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								min: one
							},
							error: null
						};

						if ([2, 5].includes(i)) {
							result.error = 'AFTER_OR_SAME_DATE';
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('not', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								not: {
									min: one
								}
							},
							error: null
						};

						if ([0, 1, 3, 4].includes(i)) {
							result.error = 'AFTER_OR_SAME_DATE';
							result.placeholder = one.toISOString();
							result.reverse = true;
						}

						return result;
					}));
				});
			});

			describe('with exclusiveMin', () => {
				describe('normal', () => {
					it('exclusiveMin === false', () => {
						checkError(TestCases.map((one: Date, i: number): ResultDefine => {
							const result: ResultDefine = {
								scheme: {
									min: one,
									exclusiveMin: false
								},
								error: null
							};

							if ([2, 5].includes(i)) {
								result.error = 'AFTER_OR_SAME_DATE';
								result.placeholder = one.toISOString();
							}

							return result;
						}));
					});

					it('exclusiveMin === true', () => {
						checkError(TestCases.map((one: Date, i: number): ResultDefine => {
							const result: ResultDefine = {
								scheme: {
									min: one,
									exclusiveMin: true
								},
								error: null
							};

							if ([1, 2, 4, 5].includes(i)) {
								result.error = 'AFTER_DATE';
								result.placeholder = one.toISOString();
							}

							return result;
						}));
					});
				});

				describe('not - min', () => {
					it('exclusiveMin === false', () => {
						checkError(TestCases.map((one: Date, i: number): ResultDefine => {
							const result: ResultDefine = {
								scheme: {
									not: {
										min: one
									},
									exclusiveMin: false
								},
								error: null
							};

							if ([0, 3].includes(i)) {
								result.error = 'AFTER_OR_SAME_DATE';
								result.placeholder = one.toISOString();
								result.reverse = true;
							}

							return result;
						}));
					});

					it('exclusiveMin === true', () => {
						checkError(TestCases.map((one: Date, i: number): ResultDefine => {
							const result: ResultDefine = {
								scheme: {
									not: {
										min: one
									},
									exclusiveMin: true
								},
								error: null
							};

							if ([0, 1, 3, 4].includes(i)) {
								result.error = 'AFTER_DATE';
								result.placeholder = one.toISOString();
								result.reverse = true;
							}

							return result;
						}));
					});
				});

				describe('not - exclusiveMin', () => {
					it.skip('exclusiveMin === false', () => {
						checkError(TestCases.map((one: Date, i: number): ResultDefine => {
							const result: ResultDefine = {
								scheme: {
									min: one,
									not: {
										exclusiveMin: false
									}
								},
								error: null
							};

							if ([1, 2, 4, 5].includes(i)) {
								result.error = 'AFTER_DATE';
								result.placeholder = one.toISOString();
								result.reverse = true;
							}

							return result;
						}));
					});

					it('exclusiveMin === true', () => {
						checkError(TestCases.map((one: Date, i: number): ResultDefine => {
							const result: ResultDefine = {
								scheme: {
									min: one,
									not: {
										exclusiveMin: true
									}
								},
								error: null
							};

							if ([0, 3].includes(i)) {
								result.error = 'AFTER_OR_SAME_DATE';
								result.placeholder = one.toISOString();
								result.reverse = true;
							}

							return result;
						}));
					});
				});

				describe.skip('not - both', () => {
					it('exclusiveMin === false', () => {

					});

					it('exclusiveMin === true', () => {

					});
				});
			});
		});

		describe('by date string', () => {
			describe('min only', () => {
				it('normal', () => {
					expect(ejv(dateTestData, [{
						key: 'date',
						type: 'date',
						min: new Date(year, month, date - 1).toISOString()
					}])).to.be.null;

					expect(ejv(dateTestData, [{
						key: 'date',
						type: 'date',
						min: new Date(year, month, date).toISOString()
					}])).to.be.null;

					const min1: Date = new Date(year, month, date + 1);

					const error1: EjvError | null = ejv(dateTestData, [{
						key: 'date',
						type: 'date',
						min: min1.toISOString()
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
					expect(error1.message).to.eql(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
						placeholders: [min1.toISOString()]
					}));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.deep.equal(dateTestData);
					expect(error1.errorData).to.be.instanceof(Date);

					// with time
					expect(ejv(dateTimeTestData, [{
						key: 'date',
						type: 'date',
						min: new Date(year, month, date, hours, minutes, seconds, ms - 1).toISOString()
					}])).to.be.null;

					expect(ejv(dateTimeTestData, [{
						key: 'date',
						type: 'date',
						min: new Date(year, month, date, hours, minutes, seconds, ms).toISOString()
					}])).to.be.null;


					const min2: Date = new Date(year, month, date, hours, minutes, seconds, ms + 1);

					const error2: EjvError | null = ejv(dateTimeTestData, [{
						key: 'date',
						type: 'date',
						min: min2.toISOString()
					}]);

					expect(error2).to.be.instanceof(EjvError);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
					expect(error2.message).to.eql(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
						placeholders: [min2.toISOString()]
					}));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.deep.equal(dateTimeTestData);
					expect(error2.errorData).to.be.instanceof(Date);
				});

				it('not', () => {

				});
			});

			describe('with exclusiveMin', () => {
				describe('normal', () => {
					it('exclusiveMin === false', () => {
						expect(ejv(dateTestData, [{
							key: 'date',
							type: 'date',
							min: new Date(year, month, date - 1).toISOString(),
							exclusiveMin: false
						}])).to.be.null;

						expect(ejv(dateTestData, [{
							key: 'date',
							type: 'date',
							min: new Date(year, month, date).toISOString(),
							exclusiveMin: false
						}])).to.be.null;


						const min1: Date = new Date(year, month, date + 1);

						const error1: EjvError | null = ejv(dateTestData, [{
							key: 'date',
							type: 'date',
							min: min1.toISOString(),
							exclusiveMin: false
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
						expect(error1.message).to.eql(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
							placeholders: [min1.toISOString()]
						}));
						expect(error1.path).to.be.eql('date');
						expect(error1.data).to.be.deep.equal(dateTestData);
						expect(error1.errorData).to.be.instanceof(Date);

						// with time
						expect(ejv(dateTimeTestData, [{
							key: 'date',
							type: 'date',
							min: new Date(year, month, date, hours, minutes, seconds, ms - 1).toISOString(),
							exclusiveMin: false
						}])).to.be.null;

						expect(ejv(dateTimeTestData, [{
							key: 'date',
							type: 'date',
							min: new Date(year, month, date, hours, minutes, seconds, ms).toISOString(),
							exclusiveMin: false
						}])).to.be.null;


						const min2: Date = new Date(year, month, date, hours, minutes, seconds, ms + 1);

						const error2: EjvError | null = ejv(dateTimeTestData, [{
							key: 'date',
							type: 'date',
							min: min2.toISOString(),
							exclusiveMin: false
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.AFTER_OR_SAME_DATE);
						expect(error2.message).to.eql(createErrorMsg(ErrorMsg.AFTER_OR_SAME_DATE, {
							placeholders: [min2.toISOString()]
						}));
						expect(error2.path).to.be.eql('date');
						expect(error2.data).to.be.deep.equal(dateTimeTestData);
						expect(error2.errorData).to.be.instanceof(Date);
					});

					it('exclusiveMin === true', () => {
						expect(ejv(dateTestData, [{
							key: 'date',
							type: 'date',
							min: new Date(year, month, date - 1).toISOString(),
							exclusiveMin: true
						}])).to.be.null;


						const min1: Date = new Date(year, month, date);

						const error1: EjvError | null = ejv(dateTestData, [{
							key: 'date',
							type: 'date',
							min: min1.toISOString(),
							exclusiveMin: true
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.AFTER_DATE);
						expect(error1.message).to.eql(createErrorMsg(ErrorMsg.AFTER_DATE, {
							placeholders: [min1.toISOString()]
						}));
						expect(error1.path).to.be.eql('date');
						expect(error1.data).to.be.deep.equal(dateTestData);
						expect(error1.errorData).to.be.instanceof(Date);


						const min2: Date = new Date(year, month, date + 1);

						const error2: EjvError | null = ejv(dateTestData, [{
							key: 'date',
							type: 'date',
							min: min2.toISOString(),
							exclusiveMin: true
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.AFTER_DATE);
						expect(error2.message).to.eql(createErrorMsg(ErrorMsg.AFTER_DATE, {
							placeholders: [min2.toISOString()]
						}));
						expect(error2.path).to.be.eql('date');
						expect(error2.data).to.be.deep.equal(dateTestData);
						expect(error2.errorData).to.be.instanceof(Date);

						// with time
						expect(ejv(dateTimeTestData, [{
							key: 'date',
							type: 'date',
							min: new Date(year, month, date, hours, minutes, seconds, ms - 1).toISOString(),
							exclusiveMin: true
						}])).to.be.null;


						const min3: Date = new Date(year, month, date, hours, minutes, seconds, ms);

						const error3: EjvError | null = ejv(dateTimeTestData, [{
							key: 'date',
							type: 'date',
							min: min3.toISOString(),
							exclusiveMin: true
						}]);

						expect(error3).to.be.instanceof(EjvError);

						if (!error3) {
							throw new Error('spec failed');
						}

						expect(error3.type).to.be.eql(ErrorType.AFTER_DATE);
						expect(error3.message).to.eql(createErrorMsg(ErrorMsg.AFTER_DATE, {
							placeholders: [min3.toISOString()]
						}));
						expect(error3.path).to.be.eql('date');
						expect(error3.data).to.be.deep.equal(dateTimeTestData);
						expect(error3.errorData).to.be.instanceof(Date);


						const min4: Date = new Date(year, month, date, hours, minutes, seconds, ms + 1);
						const error4: EjvError | null = ejv(dateTimeTestData, [{
							key: 'date',
							type: 'date',
							min: min4.toISOString(),
							exclusiveMin: true
						}]);

						expect(error4).to.be.instanceof(EjvError);

						if (!error4) {
							throw new Error('spec failed');
						}

						expect(error4.type).to.be.eql(ErrorType.AFTER_DATE);
						expect(error4.message).to.eql(createErrorMsg(ErrorMsg.AFTER_DATE, {
							placeholders: [min4.toISOString()]
						}));
						expect(error4.path).to.be.eql('date');
						expect(error4.data).to.be.deep.equal(dateTimeTestData);
						expect(error4.errorData).to.be.instanceof(Date);
					});
				});

				describe('not - min', () => {

				});

				describe('not - exclusiveMin', () => {

				});

				describe('not - both', () => {

				});
			});
		});
	});

	describe('max & exclusiveMax', () => {
		describe('check parameter', () => {
			it('max === null', () => {
				expect(() => ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: null as unknown as number
				}])).to.throw(createErrorMsg(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING));
			});

			it('exclusiveMax === null', () => {
				expect(() => ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(),
					exclusiveMax: null as unknown as boolean
				}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN));
			});
		});

		describe('by date', () => {
			it('without exclusiveMax', () => {
				const max1: Date = new Date(year, month, date - 1);

				const error1: EjvError | null = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: max1
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error1.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: [max1.toISOString()]
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
				const max2: Date = new Date(year, month, date, hours, minutes, seconds, ms - 1);

				const error2: EjvError | null = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: max2
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error2.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: [max2.toISOString()]
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
				const max1: Date = new Date(year, month, date - 1);

				const error1: EjvError | null = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: max1,
					exclusiveMax: false
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error1.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: [max1.toISOString()]
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
				const max2: Date = new Date(year, month, date, hours, minutes, seconds, ms - 1);
				const error2: EjvError | null = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: max2,
					exclusiveMax: false
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error2.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: [max2.toISOString()]
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
				const max1: Date = new Date(year, month, date - 1);
				const error1: EjvError | null = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: max1,
					exclusiveMax: true
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error1.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: [max1.toISOString()]
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);


				const max2: Date = new Date(year, month, date);

				const error2: EjvError | null = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: max2,
					exclusiveMax: true
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error2.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: [max2.toISOString()]
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
				const max3: Date = new Date(year, month, date, hours, minutes, seconds, ms - 1);

				const error3: EjvError | null = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: max3,
					exclusiveMax: true
				}]);

				expect(error3).to.be.instanceof(EjvError);

				if (!error3) {
					throw new Error('spec failed');
				}

				expect(error3.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error3.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: [max3.toISOString()]
				}));
				expect(error3.path).to.be.eql('date');
				expect(error3.data).to.be.deep.equal(dateTimeTestData);
				expect(error3.errorData).to.be.instanceof(Date);


				const max4: Date = new Date(year, month, date, hours, minutes, seconds, ms);
				const error4: EjvError | null = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: max4,
					exclusiveMax: true
				}]);

				expect(error4).to.be.instanceof(EjvError);

				if (!error4) {
					throw new Error('spec failed');
				}

				expect(error4.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error4.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: [max4.toISOString()]
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
				const max1: Date = new Date(year, month, date - 1);

				const error1: EjvError | null = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: max1.toISOString()
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error1.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: [max1.toISOString()]
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date).toISOString()
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date + 1).toISOString()
				}])).to.be.null;


				// with time
				const max2: Date = new Date(year, month, date, hours, minutes, seconds, ms - 1);

				const error2: EjvError | null = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: max2.toISOString()
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error2.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: [max2.toISOString()]
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms).toISOString()
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms + 1).toISOString()
				}])).to.be.null;
			});

			it('exclusiveMax === false', () => {
				const max1: Date = new Date(year, month, date - 1);

				const error1: EjvError | null = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: max1.toISOString(),
					exclusiveMax: false
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error1.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: [max1.toISOString()]
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date).toISOString(),
					exclusiveMax: false
				}])).to.be.null;

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date + 1).toISOString(),
					exclusiveMax: false
				}])).to.be.null;


				// with time
				const max2: Date = new Date(year, month, date, hours, minutes, seconds, ms - 1);

				const error2: EjvError | null = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: max2.toISOString(),
					exclusiveMax: false
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.type).to.be.eql(ErrorType.BEFORE_OR_SAME_DATE);
				expect(error2.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_OR_SAME_DATE, {
					placeholders: [max2.toISOString()]
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTimeTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms).toISOString(),
					exclusiveMax: false
				}])).to.be.null;

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms + 1).toISOString(),
					exclusiveMax: false
				}])).to.be.null;
			});

			it('exclusiveMax === true', () => {
				const max1: Date = new Date(year, month, date - 1);

				const error1: EjvError | null = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: max1.toISOString(),
					exclusiveMax: true
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error1.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: [max1.toISOString()]
				}));
				expect(error1.path).to.be.eql('date');
				expect(error1.data).to.be.deep.equal(dateTestData);
				expect(error1.errorData).to.be.instanceof(Date);


				const max2: Date = new Date(year, month, date);

				const error2: EjvError | null = ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: max2.toISOString(),
					exclusiveMax: true
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: [max2.toISOString()]
				}));
				expect(error2.path).to.be.eql('date');
				expect(error2.data).to.be.deep.equal(dateTestData);
				expect(error2.errorData).to.be.instanceof(Date);

				expect(ejv(dateTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date + 1).toISOString(),
					exclusiveMax: true
				}])).to.be.null;


				// with time
				const max3: Date = new Date(year, month, date, hours, minutes, seconds, ms - 1);

				const error3: EjvError | null = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: max3.toISOString(),
					exclusiveMax: true
				}]);

				expect(error3).to.be.instanceof(EjvError);

				if (!error3) {
					throw new Error('spec failed');
				}

				expect(error3.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error3.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: [max3.toISOString()]
				}));
				expect(error3.path).to.be.eql('date');
				expect(error3.data).to.be.deep.equal(dateTimeTestData);
				expect(error3.errorData).to.be.instanceof(Date);


				const max4: Date = new Date(year, month, date, hours, minutes, seconds, ms);

				const error4: EjvError | null = ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: max4.toISOString(),
					exclusiveMax: true
				}]);

				expect(error4).to.be.instanceof(EjvError);

				if (!error4) {
					throw new Error('spec failed');
				}

				expect(error4.type).to.be.eql(ErrorType.BEFORE_DATE);
				expect(error4.message).to.eql(createErrorMsg(ErrorMsg.BEFORE_DATE, {
					placeholders: [max4.toISOString()]
				}));
				expect(error4.path).to.be.eql('date');
				expect(error4.data).to.be.deep.equal(dateTimeTestData);
				expect(error4.errorData).to.be.instanceof(Date);

				expect(ejv(dateTimeTestData, [{
					key: 'date',
					type: 'date',
					max: new Date(year, month, date, hours, minutes, seconds, ms + 1).toISOString(),
					exclusiveMax: true
				}])).to.be.null;
			});
		});
	});
});
