import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { TypeTester, typeTesterArr } from './common-test-runner';


describe('NumberScheme', () => {
	describe('type', () => {
		describe('mismatch', () => {
			typeTesterArr
				.filter((obj: TypeTester): boolean => obj.type !== 'number')
				.forEach((obj: TypeTester): void => {
					const data = {
						a: obj.value
					};

					it(obj.type, () => {
						const error: EjvError | null = ejv(data, [{
							key: 'a',
							type: 'number'
						}]);

						expect(error).to.be.instanceof(EjvError);

						if (!error) {
							throw new Error('spec failed');
						}

						expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
						expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
							placeholders: ['number']
						}));
						expect(error.path).to.be.eql('a');
						expect(error.data).to.be.deep.equal(data);
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = 123;
				const typeArr: string[] = ['boolean', 'string'];

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
					type: 'number',
					optional: true
				}])).to.be.null;
			});

			it('single type', () => {
				expect(ejv({
					a: 123
				}, [{
					key: 'a',
					type: 'number'
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: 123
				}, [{
					key: 'a',
					type: ['number', 'string']
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: 123
				}, [{
					key: 'a',
					type: ['string', 'number']
				}])).to.be.null;
			});
		});
	});

	describe('enum', () => {
		describe('normal', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 1
					}, [{
						key: 'a',
						type: 'number',
						enum: undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 1
					}, [{
						key: 'a',
						type: 'number',
						enum: null as unknown as number[]
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				});

				it('not array', () => {
					expect(() => ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						enum: 1 as unknown as number[]
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				});

				it('not number', () => {
					expect(() => ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						enum: ['10']
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_NUMBERS));
				});
			});

			it('fail', () => {
				const enumArr: number[] = [9, 11];

				const data = {
					a: 10
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'number',
					enum: enumArr
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ONE_OF, {
					placeholders: [JSON.stringify(enumArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(10);
			});

			it('ok', () => {
				expect(ejv({
					a: 10
				}, [{
					key: 'a',
					type: 'number',
					enum: [9, 10, 11]
				}])).to.be.null;
			});
		});

		describe('not', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 1
					}, [{
						key: 'a',
						type: 'number',
						not: {
							enum: undefined
						}
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 1
					}, [{
						key: 'a',
						type: 'number',
						not: {
							enum: null as unknown as number[]
						}
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				});

				it('not array', () => {
					expect(() => ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						not: {
							enum: 1 as unknown as number[]
						}
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				});

				it('not number', () => {
					expect(() => ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						enum: ['10']
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_NUMBERS));
				});
			});

			it('ok', () => {
				const enumArr: number[] = [9, 11];

				expect(ejv({
					a: 10
				}, [{
					key: 'a',
					type: 'number',
					not: {
						enum: enumArr
					}
				}])).to.be.null;


				const data = {
					a: 9
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'number',
					not: {
						enum: enumArr
					}
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ONE_OF, {
					reverse: true,
					placeholders: [JSON.stringify(enumArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(9);
			});
		});
	});

	describe('min & exclusiveMin', () => {
		describe('min only', () => {
			describe('normal', () => {
				describe('check parameter', () => {
					it('undefined is ok', () => {
						expect(ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							min: undefined
						}])).to.be.null;
					});

					it('null', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							min: null as unknown as number
						}])).to.throw(createErrorMsg(ErrorMsg.MIN_SHOULD_BE_NUMBER));
					});

					it('min type', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							min: '3'
						}])).to.throw(createErrorMsg(ErrorMsg.MIN_SHOULD_BE_NUMBER));
					});
				});

				it('ok', () => {
					const error1: EjvError | null = ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						min: 10
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
						placeholders: [10]
					}));

					expect(ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						min: 10
					}])).to.be.null;

					expect(ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						min: 10
					}])).to.be.null;
				});
			});

			describe('not', () => {
				describe('check parameter', () => {
					it('undefined is ok', () => {
						expect(ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							not: {
								min: undefined
							}
						}])).to.be.null;
					});

					it('null', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							not: {
								min: null as unknown as number
							}
						}])).to.throw(createErrorMsg(ErrorMsg.MIN_SHOULD_BE_NUMBER));
					});

					it('min type', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							not: {
								min: '3'
							}
						}])).to.throw(createErrorMsg(ErrorMsg.MIN_SHOULD_BE_NUMBER));
					});
				});

				it('ok', () => {
					expect(ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						not: {
							min: 10
						}
					}])).to.be.null;

					const error1: EjvError | null = ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						not: {
							min: 10
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
						reverse: true,
						placeholders: [10]
					}));

					const error2: EjvError | null = ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						not: {
							min: 10
						}
					}]);

					expect(error2).to.be.instanceof(EjvError);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
					expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
						reverse: true,
						placeholders: [10]
					}));
				});
			});
		});

		describe('exclusiveMin', () => {
			describe('normal', () => {
				describe('check parameter', () => {
					it('exclusiveMin type', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							min: 3,
							exclusiveMin: '3' as unknown as boolean
						}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN));
					});
				});

				it('exclusiveMin === true', () => {
					const error1: EjvError | null = ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						exclusiveMin: true
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.GREATER_THAN);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN, {
						placeholders: [10]
					}));

					const error2: EjvError | null = ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						exclusiveMin: true
					}]);

					expect(error2).to.be.instanceof(EjvError);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.GREATER_THAN);
					expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN, {
						placeholders: [10]
					}));

					expect(ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						exclusiveMin: true
					}])).to.be.null;
				});

				it('exclusiveMin === false', () => {
					const error1: EjvError | null = ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						exclusiveMin: false
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
						placeholders: [10]
					}));

					expect(ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						exclusiveMin: false
					}])).to.be.null;

					expect(ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						exclusiveMin: false
					}])).to.be.null;
				});
			});

			describe('not', () => {
				describe('check parameter', () => {
					it('exclusiveMin type', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							min: 3,
							not: {
								exclusiveMin: '3' as unknown as boolean
							}
						}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN));
					});
				});

				it('without exclusiveMin', () => {
					const error1: EjvError | null = ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: undefined
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
						reverse: false, // undefined
						placeholders: [10]
					}));

					expect(ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: undefined
						}
					}])).to.be.null;

					expect(ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: undefined
						}
					}])).to.be.null;
				});

				it('exclusiveMin === true', () => {
					const error1: EjvError | null = ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: true
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
						placeholders: [10]
					}));

					expect(ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: true
						}
					}])).to.be.null;

					expect(ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: true
						}
					}])).to.be.null;
				});

				it('exclusiveMin === false', () => {
					const error1: EjvError | null = ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: false
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.GREATER_THAN);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN, {
						placeholders: [10]
					}));

					const error2: EjvError | null = ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: false
						}
					}]);

					expect(error2).to.be.instanceof(EjvError);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.GREATER_THAN);
					expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN, {
						placeholders: [10]
					}));

					expect(ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						min: 10,
						not: {
							exclusiveMin: false
						}
					}])).to.be.null;
				});
			});

		});
	});

	describe('max & exclusiveMax', () => {
		describe('max only', () => {
			describe('normal', () => {
				describe('check parameter', () => {
					it('undefined is ok', () => {
						expect(ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							max: undefined
						}])).to.be.null;
					});

					it('null', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							max: null as unknown as number
						}])).to.throw(createErrorMsg(ErrorMsg.MAX_SHOULD_BE_NUMBER));
					});

					it('max type', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							max: '3'
						}])).to.throw(createErrorMsg(ErrorMsg.MAX_SHOULD_BE_NUMBER));
					});
				});

				it('ok', () => {
					expect(ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						max: 10
					}])).to.be.null;

					expect(ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						max: 10
					}])).to.be.null;

					const error1: EjvError | null = ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						max: 10
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.SMALLER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
						placeholders: [10]
					}));
				});
			});

			describe('not', () => {
				describe('check parameter', () => {
					it('undefined is ok', () => {
						expect(ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							not: {
								max: undefined
							}
						}])).to.be.null;
					});

					it('null', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							not: {
								max: null as unknown as number
							}
						}])).to.throw(createErrorMsg(ErrorMsg.MAX_SHOULD_BE_NUMBER));
					});

					it('max type', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							not: {
								max: '3'
							}
						}])).to.throw(createErrorMsg(ErrorMsg.MAX_SHOULD_BE_NUMBER));
					});
				});

				it('ok', () => {
					const error1: EjvError | null = ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						not: {
							max: 10
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.SMALLER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
						reverse: true,
						placeholders: [10]
					}));

					const error2: EjvError | null = ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						not: {
							max: 10
						}
					}]);

					expect(error2).to.be.instanceof(EjvError);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.SMALLER_THAN_OR_EQUAL);
					expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
						reverse: true,
						placeholders: [10]
					}));

					expect(ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						not: {
							max: 10
						}
					}])).to.be.null;
				});
			});
		});

		describe('exclusiveMax', () => {
			describe('normal', () => {
				describe('check parameter', () => {
					it('exclusiveMax type', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							max: 3,
							exclusiveMax: '3' as unknown as boolean
						}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN));
					});
				});

				it('exclusiveMax === true', () => {
					expect(ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						exclusiveMax: true
					}])).to.be.null;

					const error1: EjvError | null = ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						exclusiveMax: true
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.SMALLER_THAN);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN, {
						placeholders: [10]
					}));

					const error2: EjvError | null = ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						exclusiveMax: true
					}]);

					expect(error2).to.be.instanceof(EjvError);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.SMALLER_THAN);
					expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN, {
						placeholders: [10]
					}));
				});

				it('exclusiveMax === false', () => {
					expect(ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						exclusiveMax: false
					}])).to.be.null;

					expect(ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						exclusiveMax: false
					}])).to.be.null;

					const error1: EjvError | null = ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						exclusiveMax: false
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.SMALLER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
						placeholders: [10]
					}));
				});
			});

			describe('not', () => {
				describe('check parameter', () => {
					it('exclusiveMax type', () => {
						expect(() => ejv({
							a: 3
						}, [{
							key: 'a',
							type: 'number',
							max: 3,
							not: {
								exclusiveMax: '3' as unknown as boolean
							}
						}])).to.throw(createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN));
					});
				});

				it('without exclusiveMax', () => {
					expect(ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: undefined
						}
					}])).to.be.null;

					expect(ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: undefined
						}
					}])).to.be.null;

					const error1: EjvError | null = ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: undefined
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.SMALLER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
						placeholders: [10]
					}));
				});

				it('exclusiveMax === true', () => {
					expect(ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: true
						}
					}])).to.be.null;

					expect(ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: true
						}
					}])).to.be.null;

					const error1: EjvError | null = ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: true
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.SMALLER_THAN_OR_EQUAL);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN_OR_EQUAL, {
						placeholders: [10]
					}));
				});

				it('exclusiveMax === false', () => {
					expect(ejv({
						a: 9
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: false
						}
					}])).to.be.null;

					const error1: EjvError | null = ejv({
						a: 10
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: false
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.SMALLER_THAN);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN, {
						placeholders: [10]
					}));

					const error2: EjvError | null = ejv({
						a: 11
					}, [{
						key: 'a',
						type: 'number',
						max: 10,
						not: {
							exclusiveMax: false
						}
					}]);

					expect(error2).to.be.instanceof(EjvError);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.SMALLER_THAN);
					expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.SMALLER_THAN, {
						placeholders: [10]
					}));
				});
			});
		});


	});

	describe('format', () => {
		describe('check parameter', () => {
			describe('normal', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 123.5
					}, [{
						key: 'a',
						type: 'number',
						format: undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 123.5
					}, [{
						key: 'a',
						type: 'number',
						format: null as unknown as string
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
						placeholders: ['null']
					}));
				});

				describe('invalid number format', () => {
					it('single', () => {
						expect(() => ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							format: 'invalidNumberFormat'
						}])).to.throw(createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
							placeholders: ['invalidNumberFormat']
						}));
					});

					it('multiple', () => {
						expect(() => ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							format: ['index', 'invalidNumberFormat']
						}])).to.throw(createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
							placeholders: ['invalidNumberFormat']
						}));
					});
				});
			});

			describe('not', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 123.5
					}, [{
						key: 'a',
						type: 'number',
						not: {
							format: undefined
						}
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 123.5
					}, [{
						key: 'a',
						type: 'number',
						not: {
							format: null as unknown as string
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
						placeholders: ['null']
					}));
				});

				describe('invalid number format', () => {
					it('single', () => {
						expect(() => ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: 'invalidNumberFormat'
							}
						}])).to.throw(createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
							placeholders: ['invalidNumberFormat']
						}));
					});

					it('multiple', () => {
						expect(() => ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: ['index', 'invalidNumberFormat']
							}
						}])).to.throw(createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
							placeholders: ['invalidNumberFormat']
						}));
					});
				});
			});
		});

		describe('integer', () => {
			describe('single format', () => {
				describe('normal', () => {
					it('fail', () => {
						const error: EjvError | null = ejv({
							a: 123.5
						}, [{
							key: 'a',
							type: 'number',
							format: 'integer'
						}]);

						expect(error).to.be.instanceof(EjvError);

						if (!error) {
							throw new Error('spec failed');
						}

						expect(error.type).to.be.eql(ErrorType.FORMAT);
						expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
							placeholders: ['integer']
						}));
					});

					it('ok', () => {
						expect(ejv({
							a: 123
						}, [{
							key: 'a',
							type: 'number',
							format: 'integer'
						}])).to.be.null;
					});
				});

				describe('not', () => {
					it('ok', () => {
						expect(ejv({
							a: 123.5
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: 'integer'
							}
						}])).to.be.null;
					});

					it('fail', () => {
						const error: EjvError | null = ejv({
							a: 123
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: 'integer'
							}
						}]);

						expect(error).to.be.instanceof(EjvError);

						if (!error) {
							throw new Error('spec failed');
						}

						expect(error.type).to.be.eql(ErrorType.FORMAT);
						expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
							reverse: true,
							placeholders: ['integer']
						}));
					});
				});
			});

			describe('multiple formats', () => {
				describe('normal', () => {
					it('fail', () => {
						const formatArr: string[] = ['integer'];

						const error: EjvError | null = ejv({
							a: 123.5
						}, [{
							key: 'a',
							type: 'number',
							format: formatArr
						}]);

						expect(error).to.be.instanceof(EjvError);

						if (!error) {
							throw new Error('spec failed');
						}

						expect(error.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							placeholders: [JSON.stringify(formatArr)]
						}));
					});

					it('ok', () => {
						expect(ejv({
							a: -7
						}, [{
							key: 'a',
							type: 'number',
							format: ['integer']
						}])).to.be.null;

						expect(ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							format: ['integer']
						}])).to.be.null;

						expect(ejv({
							a: 123
						}, [{
							key: 'a',
							type: 'number',
							format: ['integer']
						}])).to.be.null;
					});

					it('ok - with others', () => {
						expect(ejv({
							a: -7
						}, [{
							key: 'a',
							type: 'number',
							format: ['integer', 'index']
						}])).to.be.null;

						expect(ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							format: ['integer', 'index']
						}])).to.be.null;

						expect(ejv({
							a: 123
						}, [{
							key: 'a',
							type: 'number',
							format: ['integer', 'index']
						}])).to.be.null;
					});

					it('ok - with others', () => {
						expect(ejv({
							a: -7
						}, [{
							key: 'a',
							type: 'number',
							format: ['index', 'integer']
						}])).to.be.null;

						expect(ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							format: ['index', 'integer']
						}])).to.be.null;

						expect(ejv({
							a: 123
						}, [{
							key: 'a',
							type: 'number',
							format: ['index', 'integer']
						}])).to.be.null;
					});
				});

				describe('not', () => {
					it('ok', () => {
						const formatArr: string[] = ['integer'];

						expect(ejv({
							a: 123.5
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}])).to.be.null;
					});

					it('failed', () => {
						const formatArr: string[] = ['integer'];

						const error1: EjvError | null = ejv({
							a: -7
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error2: EjvError | null = ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error3: EjvError | null = ejv({
							a: 123
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error3).to.be.instanceof(EjvError);

						if (!error3) {
							throw new Error('spec failed');
						}

						expect(error3.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));
					});

					it('failed - with others', () => {
						const formatArr: string[] = ['index', 'integer'];

						const error1: EjvError | null = ejv({
							a: -7
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error2: EjvError | null = ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error3: EjvError | null = ejv({
							a: 123
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error3).to.be.instanceof(EjvError);

						if (!error3) {
							throw new Error('spec failed');
						}

						expect(error3.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));
					});

					it('failed - with others', () => {
						const formatArr: string[] = ['index', 'integer'];

						const error1: EjvError | null = ejv({
							a: -7
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error2: EjvError | null = ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error3: EjvError | null = ejv({
							a: 123
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error3).to.be.instanceof(EjvError);

						if (!error3) {
							throw new Error('spec failed');
						}

						expect(error3.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));
					});
				});
			});
		});

		describe('index', () => {
			describe('single format', () => {
				describe('normal', () => {
					it('fail', () => {
						const error1: EjvError | null = ejv({
							a: 1.5
						}, [{
							key: 'a',
							type: 'number',
							format: 'index'
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
							placeholders: ['index']
						}));

						const error2: EjvError | null = ejv({
							a: -1
						}, [{
							key: 'a',
							type: 'number',
							format: 'index'
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
							placeholders: ['index']
						}));

						const error3: EjvError | null = ejv({
							a: -1.6
						}, [{
							key: 'a',
							type: 'number',
							format: 'index'
						}]);

						expect(error3).to.be.instanceof(EjvError);

						if (!error3) {
							throw new Error('spec failed');
						}

						expect(error3.type).to.be.eql(ErrorType.FORMAT);
						expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
							placeholders: ['index']
						}));
					});

					it('ok', () => {
						expect(ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							format: 'index'
						}])).to.be.null;

						expect(ejv({
							a: 6
						}, [{
							key: 'a',
							type: 'number',
							format: 'index'
						}])).to.be.null;
					});
				});

				describe('not', () => {
					it('ok', () => {
						expect(ejv({
							a: 1.5
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: 'index'
							}
						}])).to.be.null;

						expect(ejv({
							a: -1
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: 'index'
							}
						}])).to.be.null;

						expect(ejv({
							a: -1.6
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: 'index'
							}
						}])).to.be.null;
					});

					it('fail', () => {
						const error1: EjvError | null = ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: 'index'
							}
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
							reverse: true,
							placeholders: ['index']
						}));

						const error2: EjvError | null = ejv({
							a: 6
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: 'index'
							}
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
							reverse: true,
							placeholders: ['index']
						}));
					});
				});
			});

			describe('multiple formats', () => {
				describe('normal', () => {
					it('fail', () => {
						const formatArr: string[] = ['index'];

						const error1: EjvError | null = ejv({
							a: 1.5
						}, [{
							key: 'a',
							type: 'number',
							format: formatArr
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error2: EjvError | null = ejv({
							a: -1
						}, [{
							key: 'a',
							type: 'number',
							format: formatArr
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error3: EjvError | null = ejv({
							a: -1.6
						}, [{
							key: 'a',
							type: 'number',
							format: formatArr
						}]);

						expect(error3).to.be.instanceof(EjvError);

						if (!error3) {
							throw new Error('spec failed');
						}

						expect(error3.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							placeholders: [JSON.stringify(formatArr)]
						}));
					});

					it('ok', () => {
						expect(ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							format: ['index']
						}])).to.be.null;

						expect(ejv({
							a: 6
						}, [{
							key: 'a',
							type: 'number',
							format: ['index']
						}])).to.be.null;
					});

					it('ok - with others', () => {
						expect(ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							format: ['index', 'integer']
						}])).to.be.null;

						expect(ejv({
							a: 6
						}, [{
							key: 'a',
							type: 'number',
							format: ['index', 'integer']
						}])).to.be.null;
					});

					it('ok - with others', () => {
						expect(ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							format: ['integer', 'index']
						}])).to.be.null;

						expect(ejv({
							a: 6
						}, [{
							key: 'a',
							type: 'number',
							format: ['integer', 'index']
						}])).to.be.null;
					});
				});

				describe('not', () => {
					it('ok', () => {
						const formatArr: string[] = ['index'];

						expect(ejv({
							a: 1.5
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}])).to.be.null;

						expect(ejv({
							a: -1
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}])).to.be.null;

						expect(ejv({
							a: -1.6
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}])).to.be.null;
					});

					it('failed', () => {
						const formatArr: string[] = ['index'];

						const error1: EjvError | null = ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error2: EjvError | null = ejv({
							a: 6
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));
					});

					it('failed - with others', () => {
						const formatArr: string[] = ['index', 'integer'];

						const error1: EjvError | null = ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error2: EjvError | null = ejv({
							a: 6
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));
					});

					it('failed - with others', () => {
						const formatArr: string[] = ['integer', 'index'];

						const error1: EjvError | null = ejv({
							a: 0
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error1).to.be.instanceof(EjvError);

						if (!error1) {
							throw new Error('spec failed');
						}

						expect(error1.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));

						const error2: EjvError | null = ejv({
							a: 6
						}, [{
							key: 'a',
							type: 'number',
							not: {
								format: formatArr
							}
						}]);

						expect(error2).to.be.instanceof(EjvError);

						if (!error2) {
							throw new Error('spec failed');
						}

						expect(error2.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
						expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
							reverse: true,
							placeholders: [JSON.stringify(formatArr)]
						}));
					});
				});
			});
		});
	});
});
