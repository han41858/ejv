import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError, Scheme } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { checkSchemeError, TypeTester, typeTesterArr } from './common-test-util';


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
				const data = {
					a: 1
				};

				const errorScheme: Scheme = {
					key: 'a',
					type: 'number',
					enum: null as unknown as number[]
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY)
				});
			});

			it('not array', () => {
				const data = {
					a: 10
				};

				const errorScheme: Scheme = {
					key: 'a',
					type: 'number',
					enum: 1 as unknown as number[]
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY)
				});
			});

			it('not number', () => {
				const data = {
					a: 10
				};

				const errorScheme: Scheme = {
					key: 'a',
					type: 'number',
					enum: ['10']
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_NUMBERS)
				});
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

			expect(error.type).to.be.eql(ErrorType.ONE_VALUE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ONE_VALUE_OF, {
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

	describe('min & exclusiveMin', () => {
		describe('min only', () => {
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
					const data = {
						a: 3
					};

					const errorScheme: Scheme = {
						key: 'a',
						type: 'number',
						min: null as unknown as number
					};

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ErrorMsg.MIN_SHOULD_BE_NUMBER)
					});
				});

				it('min type', () => {
					const data = {
						a: 3
					};

					const errorScheme: Scheme = {
						key: 'a',
						type: 'number',
						min: '3'
					};

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ErrorMsg.MIN_SHOULD_BE_NUMBER)
					});
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

				expect(error1.type).to.be.eql(ErrorType.BIGGER_THAN_OR_EQUAL);
				expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.BIGGER_THAN_OR_EQUAL, {
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

		describe('exclusiveMin', () => {
			describe('check parameter', () => {
				it('exclusiveMin type', () => {
					const data = {
						a: 3
					};

					const errorScheme: Scheme = {
						key: 'a',
						type: 'number',
						min: 3,
						exclusiveMin: '3' as unknown as boolean
					};

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN)
					});
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

				expect(error1.type).to.be.eql(ErrorType.BIGGER_THAN);
				expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.BIGGER_THAN, {
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

				expect(error2.type).to.be.eql(ErrorType.BIGGER_THAN);
				expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.BIGGER_THAN, {
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

				expect(error1.type).to.be.eql(ErrorType.BIGGER_THAN_OR_EQUAL);
				expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.BIGGER_THAN_OR_EQUAL, {
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
	});

	describe('max & exclusiveMax', () => {
		describe('max only', () => {
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
					const data = {
						a: 3
					};

					const errorScheme: Scheme = {
						key: 'a',
						type: 'number',
						max: null as unknown as number
					};

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ErrorMsg.MAX_SHOULD_BE_NUMBER)
					});
				});

				it('max type', () => {
					const data = {
						a: 3
					};

					const errorScheme: Scheme = {
						key: 'a',
						type: 'number',
						max: '3'
					};

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ErrorMsg.MAX_SHOULD_BE_NUMBER)
					});
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

		describe('exclusiveMax', () => {
			describe('check parameter', () => {
				it('exclusiveMax type', () => {
					const data = {
						a: 3
					};

					const errorScheme: Scheme = {
						key: 'a',
						type: 'number',
						max: 3,
						exclusiveMax: '3' as unknown as boolean
					};

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN)
					});
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
	});

	describe('format', () => {
		describe('check parameter', () => {
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
				const data = {
					a: 123.5
				};

				const errorScheme: Scheme = {
					key: 'a',
					type: 'number',
					format: null as unknown as string
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
						placeholders: ['null']
					})
				});
			});

			describe('invalid number format', () => {
				const data = {
					a: 1
				};

				it('single', () => {
					const errorScheme: Scheme = {
						key: 'a',
						type: 'number',
						format: 'invalidNumberFormat'
					};

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
							placeholders: ['invalidNumberFormat']
						})
					});
				});

				it('multiple', () => {
					const errorScheme: Scheme = {
						key: 'a',
						type: 'number',
						format: ['index', 'invalidNumberFormat']
					};

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ErrorMsg.INVALID_NUMBER_FORMAT, {
							placeholders: ['invalidNumberFormat']
						})
					});
				});
			});
		});

		describe('integer', () => {
			describe('single format', () => {
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

			describe('multiple formats', () => {
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
		});

		describe('index', () => {
			describe('single format', () => {
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

			describe('multiple formats', () => {
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
		});
	});
});
