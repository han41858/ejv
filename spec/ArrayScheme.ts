import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { AnyObject, EjvError, Scheme } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { TypeTester, typeTesterArr } from './common-test-runner';


describe('ArrayScheme', () => {
	describe('type', () => {
		describe('mismatch', () => {
			typeTesterArr
				.filter((obj: TypeTester): boolean => obj.type !== 'array')
				.forEach((obj: TypeTester): void => {
					it(obj.type, () => {
						const testObj = {
							a: obj.value
						};

						const error: EjvError = ejv(testObj, [{
							key: 'a',
							type: 'array'
						}]);

						expect(error).to.be.instanceof(EjvError);
						expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
						expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
							placeholders: ['array']
						}));
						expect(error.path).to.be.eql('a');
						expect(error.data).to.be.eql(testObj);
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = 'ejv';
				const typeArr: string[] = ['boolean', 'array'];

				const testObj = {
					a: value
				};

				const error: EjvError = ejv(testObj, [{
					key: 'a',
					type: typeArr
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH_ONE_OF, {
					placeholders: [JSON.stringify(typeArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql(testObj);
				expect(error.errorData).to.be.eql(value);
			});
		});

		describe('match', () => {
			it('optional', () => {
				expect(ejv({
					a: undefined
				}, [{
					key: 'a',
					type: 'array',
					optional: true
				}])).to.be.null;
			});

			it('single type', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array'
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: ['array', 'number']
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: ['number', 'array']
				}])).to.be.null;
			});
		});

		describe('has invalid value', () => {
			it('has undefined', () => {
				const value = ['a', undefined];
				const testObj = {
					a: value
				};

				const error: EjvError = ejv(testObj, [
					{ key: 'a', type: 'array', items: 'string' }
				]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.ITEMS_TYPE);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ITEMS_TYPE, {
					placeholders: ['string']
				}));
				expect(error.path).to.be.eql('a/1');
				expect(error.data).to.be.eql(testObj);
				expect(error.errorData).to.be.eql(undefined);
			});

			it('has undefined, but optional', () => {
				const value = ['a', undefined];
				const testObj = {
					a: value
				};

				expect(ejv(testObj, [
					{
						key: 'a', type: 'array', items: [
							{ type: 'string', optional: true }
						]
					}
				])).to.be.null;
			});

			it('has null', () => {
				const value = ['a', null];
				const testObj = {
					a: value
				};

				const error: EjvError = ejv(testObj, [
					{ key: 'a', type: 'array', items: 'string' }
				]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.ITEMS_TYPE);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ITEMS_TYPE, {
					placeholders: ['string']
				}));
				expect(error.path).to.be.eql('a/1');
				expect(error.data).to.be.eql(testObj);
				expect(error.errorData).to.be.eql(null);
			});

			it('has null, but nullable', () => {
				const value = ['a', null];

				expect(ejv({
					a: value
				}, [
					{
						key: 'a', type: 'array', items: [
							{ type: 'string', nullable: true }
						]
					}
				])).to.be.null;
			});
		});
	});

	describe('minLength', () => {
		describe('check parameter', () => {
			it('undefined is ok', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					minLength: undefined
				}])).to.be.null;
			});

			it('null', () => {
				expect(() => ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					minLength: null
				}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
			});

			it('float number', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					minLength: 1.5
				}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
			});

			it('string', () => {
				expect(() => ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					minLength: '1' as unknown as number
				}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
			});
		});

		it('fail', () => {
			const value = [1, 2, 3];
			const testData = {
				a: value
			};

			const error: EjvError = ejv(testData, [{
				key: 'a',
				type: 'array',
				minLength: 4
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.MIN_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.MIN_LENGTH, {
				placeholders: ['4']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(testData);
			expect(error.errorData).to.be.ordered.members(value);
		});

		it('ok', () => {
			expect(ejv({
				a: [1, 2, 3]
			}, [{
				key: 'a',
				type: 'array',
				minLength: 2
			}])).to.be.null;

			expect(ejv({
				a: [1, 2, 3]
			}, [{
				key: 'a',
				type: 'array',
				minLength: 3
			}])).to.be.null;
		});
	});

	describe('maxLength', () => {
		describe('check parameter', () => {
			it('undefined is ok', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					maxLength: undefined
				}])).to.be.null;
			});

			it('null', () => {
				expect(() => ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					maxLength: null
				}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
			});

			it('float number', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					maxLength: 1.5
				}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
			});

			it('string', () => {
				expect(() => ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					maxLength: '1' as unknown as number
				}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
			});
		});

		it('fail', () => {
			const value = [1, 2, 3];
			const testData = {
				a: value
			};

			const error: EjvError = ejv(testData, [{
				key: 'a',
				type: 'array',
				maxLength: 2
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.MAX_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.MAX_LENGTH, {
				placeholders: ['2']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(testData);
			expect(error.errorData).to.be.ordered.members(value);
		});

		it('ok', () => {
			expect(ejv({
				a: [1, 2, 3]
			}, [{
				key: 'a',
				type: 'array',
				maxLength: 3
			}])).to.be.null;

			expect(ejv({
				a: [1, 2, 3]
			}, [{
				key: 'a',
				type: 'array',
				maxLength: 4
			}])).to.be.null;
		});
	});

	describe('unique', () => {
		describe('check parameter', () => {
			it('undefined is ok', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					unique: undefined
				}])).to.be.null;
			});

			it('null', () => {
				expect(() => ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					unique: null
				}])).to.throw(createErrorMsg(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN));
			});

			it('not boolean', () => {
				expect(() => ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					unique: 'hello' as unknown as boolean
				}])).to.throw(createErrorMsg(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN));
			});
		});

		it('default', () => {
			const error: EjvError = ejv({
				a: [1, 2, 3],
				b: [1, 1, 1],
				c: ['a', 'a', 'a']
			}, [{
				key: 'a',
				type: 'array'
			}, {
				key: 'b',
				type: 'array'
			}, {
				key: 'c',
				type: 'array',
				items: {
					type: 'string',
					minLength: 1
				}
			}]);

			expect(error).to.be.null;
		});

		it('false', () => {
			const error: EjvError = ejv({
				a: [1, 2, 3],
				b: [1, 1, 1],
				c: ['a', 'a', 'a']
			}, [{
				key: 'a',
				type: 'array',
				unique: false
			}, {
				key: 'b',
				type: 'array',
				unique: false
			}, {
				key: 'c',
				type: 'array',
				unique: false,
				items: {
					type: 'string',
					minLength: 1
				}
			}]);

			expect(error).to.be.null;
		});

		it('true', () => {
			const numberValue = [1, 1, 1];
			const numberTestObj = {
				a: [1, 2, 3],
				b: numberValue
			};

			const error: EjvError = ejv(numberTestObj, [{
				key: 'a',
				type: 'array',
				unique: true
			}, {
				key: 'b',
				type: 'array',
				unique: true
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.UNIQUE_ITEMS);
			expect(error.message).to.be.eql(ErrorMsg.UNIQUE_ITEMS);
			expect(error.path).to.be.eql('b');
			expect(error.data).to.be.deep.equal(numberTestObj);
			expect(error.errorData).to.be.ordered.members(numberValue);

			const stringValue = ['a', 'a', 'a'];
			const stringTestObj = {
				a: stringValue
			};

			const stringsError: EjvError = ejv(stringTestObj, [{
				key: 'a',
				type: 'array',
				unique: true,
				items: {
					type: 'string',
					minLength: 1
				}
			}]);

			expect(stringsError).to.be.instanceof(EjvError);
			expect(stringsError.type).to.be.eql(ErrorType.UNIQUE_ITEMS);
			expect(stringsError.message).to.be.eql(ErrorMsg.UNIQUE_ITEMS);
			expect(stringsError.path).to.be.eql('a');
			expect(stringsError.data).to.be.deep.equal(stringTestObj);
			expect(stringsError.errorData).to.be.ordered.members(stringValue);
		});
	});

	describe('items', () => {
		describe('check parameter', () => {
			it('undefined is ok', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					items: undefined
				}])).to.be.null;
			});

			it('null', () => {
				expect(() => ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					items: null
				}])).to.throw(createErrorMsg(ErrorMsg.INVALID_ITEMS_SCHEME, {
					placeholders: ['null']
				}));
			});
		});

		describe('single data type', () => {
			describe('check parameter', () => {
				it('invalid data type', () => {
					expect(() => ejv({
						a: [1, 2, 3]
					}, [{
						key: 'a',
						type: 'array',
						items: 'invalidDataType'
					}])).to.throw(); // error message by partial scheme
				});
			});

			it('fail', () => {
				const value = [1, 2, 3];
				const testObj = {
					a: value
				};

				const error: EjvError = ejv(testObj, [{
					key: 'a',
					type: 'array',
					items: 'string'
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.ITEMS_TYPE);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ITEMS_TYPE, {
					placeholders: ['string']
				}));
				expect(error.path).to.be.eql('a/0');
				expect(error.data).to.be.deep.equal(testObj);
				expect(error.errorData).to.be.eql(value[0]);
			});

			it('ok', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					items: 'number'
				}])).to.be.null;
			});

			it('ok - empty array', () => {
				const error: EjvError = ejv({
					a: []
				}, [{
					key: 'a',
					type: 'array',
					items: 'object'
				}]);

				expect(error).to.be.null;
			});
		});

		describe('multiple data type', () => {
			describe('check parameter', () => {
				it('invalid data type', () => {
					expect(() => ejv({
						a: [1, 2, 3]
					}, [{
						key: 'a',
						type: 'array',
						items: ['number', 'invalidDataType']
					}])).to.throw(); // error message by partial scheme
				});
			});

			it('fail', () => {
				const enumArr: string[] = ['boolean', 'string'];

				const value = [1, 2, 2];
				const testObj = {
					a: [1, 2, 3],
					b: [1, 2, 2]
				};

				const error: EjvError = ejv(testObj, [{
					key: 'a',
					type: 'array',
					items: enumArr
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.ITEMS_TYPE);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ITEMS_TYPE, {
					placeholders: [JSON.stringify(enumArr)]
				}));
				expect(error.path).to.be.eql('a/0');
				expect(error.data).to.be.deep.equal(testObj);
				expect(error.errorData).to.be.eql(value[0]);
			});

			it('ok', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					items: ['string', 'number']
				}])).to.be.null;

				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					items: ['number', 'string']
				}])).to.be.null;
			});
		});

		describe('single scheme', () => {
			// single scheme has it's original error type & message
			describe('check parameter', () => {
				it('invalid data type', () => {
					const scheme: AnyObject = {
						type: 'invalidDataType'
					};

					expect(() => ejv({
						a: [1, 2, 3]
					}, [{
						key: 'a',
						type: 'array',
						items: scheme as unknown as Scheme
					}])).to.throw(); // error message by partial scheme
				});
			});

			it('fail', () => {
				const itemScheme: Scheme = {
					type: 'number',
					min: 2
				};

				const value = [1, 2, 3];
				const testObj = {
					a: value
				};

				const error: EjvError = ejv(testObj, [{
					key: 'a',
					type: 'array',
					items: itemScheme
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
					placeholders: ['' + 2]
				}));
				expect(error.path).to.be.eql('a/0');
				expect(error.data).to.be.deep.equal(testObj);
				expect(error.errorData).to.be.eql(value[0]);
			});

			it('ok', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					items: {
						type: 'number',
						min: 1,
						max: 3
					}
				}])).to.be.null;
			});

			it('fail - array of object', () => {
				const data = {
					a: [
						{ number: 2 },
						{ number: 3 },
						{ number: 4 },
						{ number: 5 }
					]
				};

				const error: EjvError = ejv(data, [
					{
						key: 'a', type: 'array', items: [{
							type: 'object', properties: [
								{ key: 'number', type: 'number', min: 4 }
							]
						}]
					}
				]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
					placeholders: ['' + 4]
				}));
				expect(error.path).to.be.eql('a/0/number');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(2);
			});

			it('fail - array of deep object', () => {
				const data = {
					a: [
						{ b: { c: { d: { number: 2 } } } },
						{ b: { c: { d: { number: 3 } } } },
						{ b: { c: { d: { number: 4 } } } },
						{ b: { c: { d: { number: 5 } } } }
					]
				};

				const error: EjvError = ejv(data, [{
					key: 'a', type: 'array', items: [{
						type: 'object', properties: [{
							key: 'b', type: 'object', properties: [{
								key: 'c', type: 'object', properties: [{
									key: 'd', type: 'object', properties: [
										{ key: 'number', type: 'number', min: 4 }
									]
								}]
							}]
						}]
					}]
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.GREATER_THAN_OR_EQUAL);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.GREATER_THAN_OR_EQUAL, {
					placeholders: ['' + 4]
				}));
				expect(error.path).to.be.eql('a/0/b/c/d/number');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(2);
			});
		});

		describe('multiple schemes', () => {
			describe('check parameter', () => {
				it('invalid data type', () => {
					const scheme: AnyObject = {
						type: 'invalidDataType'
					};

					expect(() => ejv({
						a: [1, 2, 3]
					}, [{
						key: 'a',
						type: 'array',
						items: [scheme] as unknown as Scheme[]
					}])).to.throw(); // error message by partial scheme
				});
			});

			it('fail', () => {
				const itemScheme1: Scheme = {
					type: 'number',
					min: 2
				};

				const itemScheme2: Scheme = {
					type: 'number',
					min: 3
				};

				const allSchemes: Scheme[] = [itemScheme1, itemScheme2];

				const data = {
					a: [1, 2, 3]
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'array',
					items: allSchemes
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.ITEMS_SCHEMES);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ITEMS_SCHEMES, {
					placeholders: [JSON.stringify(allSchemes)]
				}));
				expect(error.path).to.be.eql('a/0');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(1);
			});

			it('ok', () => {
				expect(ejv({
					a: [1, 2, 3]
				}, [{
					key: 'a',
					type: 'array',
					items: [{
						type: 'number',
						min: 1,
						max: 3
					}]
				}])).to.be.null;

				// multiple schemes
				expect(ejv({
					a: [1]
				}, [{
					key: 'a',
					type: 'array',
					items: [{
						type: 'number',
						min: 1
					}, {
						type: 'string'
					}]
				}])).to.be.null;
			});

			it('nested array - single scheme', () => {
				const arr: string[] = ['ok', null];
				const testObj = {
					a: [{
						b: arr
					}]
				};

				const itemScheme: Scheme = { type: 'string', minLength: 1 };

				const error: EjvError = ejv(testObj, [{
					key: 'a', type: 'array', items: {
						type: 'object', properties: [{
							key: 'b', type: 'array', unique: true, minLength: 1, optional: true,
							items: itemScheme
						}]
					}
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
					placeholders: [JSON.stringify(itemScheme)]
				}));
				expect(error.path).to.be.eql('a/0/b/1');
				expect(error.data).to.be.eql(testObj);
				expect(error.errorData).to.be.eql(null);
			});

			it('nested array - multiple chemes', () => {
				const arr: string[] = ['ok', null];
				const testObj = {
					a: [{
						b: arr
					}]
				};

				const itemScheme: Scheme[] = [{ type: 'string', minLength: 1 }];

				const error: EjvError = ejv(testObj, [{
					key: 'a', type: 'array', items: {
						type: 'object', properties: [{
							key: 'b', type: 'array', unique: true, minLength: 1, optional: true,
							items: itemScheme
						}]
					}
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
					placeholders: [JSON.stringify(itemScheme)]
				}));
				expect(error.path).to.be.eql('a/0/b/1');
				expect(error.data).to.be.eql(testObj);
				expect(error.errorData).to.be.eql(null);
			});
		});
	});
});
