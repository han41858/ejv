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

	const nowOnlyDate: Date = new Date();
	nowOnlyDate.setHours(0, 0, 0, 0);


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

	describe('min & exclusiveMin', () => {
		describe('min only', () => {
			describe('normal', () => {
				describe('check parameter', () => {
					it('undefined is ok', () => {
						expect(ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							min: undefined
						}])).to.be.null;
					});

					it('null', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							min: null as unknown as string
						}])).to.throw(createErrorMsg(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING));
					});

					it('min type', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							min: 123 as unknown as string
						}])).to.throw(createErrorMsg(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING));
					});
				});

				it('by date', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								min: one
							},
							error: null
						};

						if ([2, 5].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('by date string', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								min: one.toISOString()
							},
							error: null
						};

						if ([2, 5].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});
			});

			describe('not', () => {
				describe('check parameter', () => {
					it('undefined is ok', () => {
						expect(ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							not: {
								min: undefined
							}
						}])).to.be.null;
					});

					it('null', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							not: {
								min: null as unknown as string
							}
						}])).to.throw(createErrorMsg(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING));
					});

					it('min type', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							not: {
								min: 123 as unknown as string
							}
						}])).to.throw(createErrorMsg(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING));
					});
				});

				it('by date', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								not: {
									min: one
								}
							},
							error: null,
							reverse: true
						};

						if ([0, 1, 3, 4].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE; // TODO: BEFORE ???
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('by date string', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								not: {
									min: one.toISOString()
								}
							},
							error: null,
							reverse: true
						};

						if ([0, 1, 3, 4].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});
			});
		});

		describe('exclusiveMin', () => {
			describe('normal', () => {
				describe('check parameter', () => {
					it('exclusiveMin type', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							min: now,
							exclusiveMin: now.toISOString() as unknown as boolean
						}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN));
					});
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
							result.error = ErrorType.AFTER_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

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
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});
			});

			describe('not', () => {
				describe('check parameter', () => {
					it('exclusiveMin type', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							min: now,
							not: {
								exclusiveMin: now.toISOString() as unknown as boolean
							}
						}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN));
					});
				});

				it('exclusiveMin === undefined', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								min: one,
								not: {
									exclusiveMin: undefined
								}
							},
							error: null
						};

						if ([2, 5].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
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
								not: {
									exclusiveMin: true
								}
							},
							error: null
						};

						if ([2, 5].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('exclusiveMin === false', () => {
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
							result.error = ErrorType.AFTER_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});
			});
		});
	});

	describe.skip('max & exclusiveMax', () => {
		describe('max only', () => {
			describe('normal', () => {
				describe('check parameter', () => {
					it('undefined is ok', () => {
						expect(ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							max: undefined
						}])).to.be.null;
					});

					it('null', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							max: null as unknown as string
						}])).to.throw(createErrorMsg(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING));
					});

					it('max type', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							max: 123 as unknown as string
						}])).to.throw(createErrorMsg(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING));
					});
				});

				it('by date', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								max: one
							},
							error: null
						};

						if ([0, 3].includes(i)) {
							result.error = ErrorType.BEFORE_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('by date string', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								max: one.toISOString()
							},
							error: null
						};

						if ([0, 3].includes(i)) {
							result.error = ErrorType.BEFORE_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});
			});

			describe.skip('not', () => {
				describe('check parameter', () => {
					it('undefined is ok', () => {
						expect(ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							not: {
								max: undefined
							}
						}])).to.be.null;
					});

					it('null', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							not: {
								max: null as unknown as string
							}
						}])).to.throw(createErrorMsg(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING));
					});

					it('max type', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							not: {
								max: 123 as unknown as string
							}
						}])).to.throw(createErrorMsg(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING));
					});
				});

				it('by date', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								not: {
									max: one
								}
								// means
								// min : one,
								// exclusiveMin: true
							},
							error: null,
							reverse: true
						};

						if ([1, 2, 4, 5].includes(i)) {
							result.error = ErrorType.AFTER_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('by date string', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								not: {
									max: one.toISOString()
								}
							},
							error: null,
							reverse: true
						};

						if ([0, 1, 3, 4].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});
			});
		});

		describe('exclusiveMax', () => {
			describe('normal', () => {
				describe('check parameter', () => {
					it('exclusiveMax type', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							max: now,
							exclusiveMax: now.toISOString() as unknown as boolean
						}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN));
					});
				});

				it('exclusiveMax === true', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								max: one,
								exclusiveMax: true
							},
							error: null
						};

						if ([1, 2, 4, 5].includes(i)) {
							result.error = ErrorType.AFTER_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('exclusiveMax === false', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								max: one,
								exclusiveMax: false
							},
							error: null
						};

						if ([2, 5].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});
			});

			describe('not', () => {
				describe('check parameter', () => {
					it('exclusiveMax type', () => {
						expect(() => ejv({
							date: new Date()
						}, [{
							key: 'date',
							type: 'date',
							max: now,
							not: {
								exclusiveMax: now.toISOString() as unknown as boolean
							}
						}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN));
					});
				});

				it('exclusiveMax === undefined', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								max: one,
								not: {
									exclusiveMax: undefined
								}
							},
							error: null
						};

						if ([2, 5].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('exclusiveMax === true', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								max: one,
								not: {
									exclusiveMax: true
								}
							},
							error: null
						};

						if ([2, 5].includes(i)) {
							result.error = ErrorType.AFTER_OR_SAME_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});

				it('exclusiveMax === false', () => {
					checkError(TestCases.map((one: Date, i: number): ResultDefine => {
						const result: ResultDefine = {
							scheme: {
								max: one,
								not: {
									exclusiveMax: false
								}
							},
							error: null
						};

						if ([1, 2, 4, 5].includes(i)) {
							result.error = ErrorType.AFTER_DATE;
							result.placeholder = one.toISOString();
						}

						return result;
					}));
				});
			});
		});
	});
});
