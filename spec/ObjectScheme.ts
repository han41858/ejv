import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { DataTypeName, EjvError, Scheme } from '../src/interfaces';
import { ERROR_MESSAGE, ERROR_TYPE } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { checkSchemeError, TYPE_TESTER_ARR, TypeTester } from './common-test-util';


describe('ObjectScheme', () => {
	describe('type', () => {
		describe('mismatch', () => {
			TYPE_TESTER_ARR
				.filter((obj: TypeTester): boolean => {
					return !['null', 'date', 'regexp', 'array', 'object', 'buffer'].includes(obj.type);
				})
				.forEach((obj: TypeTester): void => {
					const data = {
						a: obj.value
					};

					it(obj.type, () => {
						const error: EjvError | null = ejv(data, [{
							key: 'a',
							type: 'object'
						}]);

						expect(error).to.be.instanceof(EjvError);

						if (!error) {
							throw new Error('spec failed');
						}

						expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
						expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
							placeholders: ['object']
						}));
						expect(error.path).to.be.eql('a');
						expect(error.data).to.be.deep.equal(data);
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = {};
				const typeArr: DataTypeName[] = ['boolean', 'number'];

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

				expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH_ONE_OF, {
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
					type: 'object',
					optional: true
				}])).to.be.null;
			});

			TYPE_TESTER_ARR
				.filter((obj: TypeTester): boolean => {
					return ['null', 'date', 'regexp', 'array', 'object', 'buffer'].includes(obj.type);
				})
				.forEach((obj: TypeTester): void => {
					it(obj.type, () => {
						expect(ejv({
							a: obj.value
						}, [{
							key: 'a',
							type: 'object'
						}])).to.be.null;
					});
				});

			it('single type', () => {
				expect(ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object'
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: ['object', 'number']
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: ['number', 'object']
				}])).to.be.null;
			});
		});
	});

	describe('properties', () => {
		describe('check parameter', () => {
			const data = {
				a: {
					b: 1
				}
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'object',
					properties: undefined
				}])).to.be.null;
			});

			it('null', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'object',
					// @ts-expect-error: null
					properties: null
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY)
				});
			});

			it('not array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'object',
					// @ts-expect-error: type mismatch
					properties: 'b'
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY)
				});
			});

			it('empty array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'object',
					properties: []
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.PROPERTIES_SHOULD_HAVE_ITEMS)
				});
			});

			it('not object array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'object',
					properties: ['b'] as never
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT)
				});
			});

			it('null in array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'object',
					properties: [null as unknown as Scheme]
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT)
				});
			});
		});

		it('with single type', () => {
			const undefinedError: EjvError | null = ejv({
				a: {
					b: undefined
				}
			}, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: 'string'
				}]
			}]);

			expect(undefinedError).to.be.instanceof(EjvError);

			if (!undefinedError) {
				throw new Error('spec failed');
			}

			expect(undefinedError.type).to.be.eql(ERROR_TYPE.REQUIRED);
			expect(undefinedError.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.REQUIRED));
			expect(undefinedError.path).to.be.eql('a/b');

			const nullError: EjvError | null = ejv({
				a: null
			}, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: 'string'
				}]
			}]);

			expect(nullError).to.be.instanceof(EjvError);

			if (!nullError) {
				throw new Error('spec failed');
			}

			expect(nullError.type).to.be.eql(ERROR_TYPE.REQUIRED);
			expect(nullError.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.REQUIRED));
			expect(nullError.path).to.be.eql('a');

			const data = {
				a: {
					b: 1
				}
			};

			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: 'string'
				}]
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
			expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
				placeholders: ['string']
			}));
			expect(error.path).to.be.eql('a/b');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql(1);

			expect(ejv({
				a: {
					b: 1
				}
			}, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: 'number'
				}]
			}])).to.be.null;
		});

		it('with multiple types', () => {
			const typeArr: DataTypeName[] = ['string', 'boolean'];

			const undefinedError: EjvError | null = ejv({
				a: {
					b: undefined
				}
			}, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: typeArr
				}]
			}]);

			expect(undefinedError).to.be.instanceof(EjvError);

			if (!undefinedError) {
				throw new Error('spec failed');
			}

			expect(undefinedError.type).to.be.eql(ERROR_TYPE.REQUIRED);
			expect(undefinedError.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.REQUIRED));
			expect(undefinedError.path).to.be.eql('a/b');

			const data = {
				a: {
					b: 1
				}
			};

			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: typeArr
				}]
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH_ONE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH_ONE_OF, {
				placeholders: [JSON.stringify(typeArr)]
			}));
			expect(error.path).to.be.eql('a/b');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql(1);

			expect(ejv({
				a: {
					b: 1
				}
			}, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: ['number', 'string']
				}]
			}])).to.be.null;

			expect(ejv({
				a: {
					b: 1
				}
			}, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: ['string', 'number']
				}]
			}])).to.be.null;
		});
	});

	describe('allowNoProperty', () => {
		describe('check parameter', () => {
			const data = {
				a: {
					b: 1
				}
			};
			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'object',
					allowNoProperty: undefined
				}])).to.be.null;
			});

			it('null', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'object',
					// @ts-expect-error: null
					allowNoProperty: null
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN)
				});
			});
		});

		describe('default', () => {
			it('empty object', () => {
				const error: EjvError | null = ejv({
					a: {}
				}, [{
					key: 'a',
					type: 'object'
				}]);

				expect(error).to.be.null;
			});

			it('object has property', () => {
				const error: EjvError | null = ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object'
				}]);

				expect(error).to.be.null;
			});
		});

		describe('allowNoProperty === false', () => {
			it('empty object', () => {
				const error: EjvError | null = ejv({
					a: {}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: false
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ERROR_TYPE.PROPERTY);
				expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.PROPERTY));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.a('object');
			});

			it('object has property', () => {
				expect(ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: false
				}])).to.be.null;
			});
		});

		describe('allowNoProperty === true', () => {
			it('empty object', () => {
				const error: EjvError | null = ejv({
					a: {}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: true
				}]);

				expect(error).to.be.null;
			});

			it('object has property', () => {
				const error: EjvError | null = ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: true
				}]);

				expect(error).to.be.null;
			});
		});
	});

	describe('properties with not scheme', () => {
		const notSchemes: [string, unknown][] = [
			['array', []],
			['Date', new Date(0)],
			['RegExp', /a/],
			['buffer', new Uint8Array(1)]
		];

		notSchemes.forEach(([name, notScheme]: [string, unknown]): void => {
			it(name, () => {
				checkSchemeError({
					data: { a: { b: 1 } },
					errorScheme: {
						key: 'a',
						type: 'object',
						properties: [notScheme as Scheme]
					},
					message: ERROR_MESSAGE.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT
				});
			});
		});
	});

	describe('allowUnknownProperty', () => {
		const properties: Scheme[] = [{ key: 'a', type: 'number' }];

		describe('check parameter', () => {
			it('undefined is ok', () => {
				expect(ejv({ o: { a: 1, b: 2 } }, [{ key: 'o', type: 'object', allowUnknownProperty: undefined, properties }])).to.be.null;
			});

			it('not boolean', () => {
				checkSchemeError({
					data: { o: { a: 1 } },
					errorScheme: {
						key: 'o',
						type: 'object',
						allowUnknownProperty: 'false' as unknown as boolean,
						properties
					},
					message: ERROR_MESSAGE.ALLOW_UNKNOWN_PROPERTY_SHOULD_BE_BOOLEAN
				});
			});
		});

		it('allowed by default', () => {
			expect(ejv({ o: { a: 1, b: 2 } }, [{ key: 'o', type: 'object', properties }])).to.be.null;
			expect(ejv({ o: { a: 1, b: 2 } }, [{ key: 'o', type: 'object', allowUnknownProperty: true, properties }])).to.be.null;
		});

		it('not allowed', () => {
			const data = { o: { a: 1, b: 2 } };

			const error: EjvError | null = ejv(data, [{ key: 'o', type: 'object', allowUnknownProperty: false, properties }]);

			expect(error).to.be.instanceof(EjvError);
			expect(error?.type).to.be.eql(ERROR_TYPE.UNKNOWN_PROPERTY);
			expect(error?.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.UNKNOWN_PROPERTY, {
				placeholders: ['b']
			}));
			expect(error?.path).to.be.eql('o');
			expect(error?.data).to.be.eql(data);
			expect(error?.errorData).to.be.eql(data.o);
			expect(error?.isDataError).to.be.true;
		});

		it('declared properties only', () => {
			expect(ejv({ o: { a: 1 } }, [{ key: 'o', type: 'object', allowUnknownProperty: false, properties }])).to.be.null;
		});

		it('property with undefined value is ignored', () => {
			expect(ejv({ o: { a: 1, b: undefined } }, [{ key: 'o', type: 'object', allowUnknownProperty: false, properties }])).to.be.null;
		});

		it('declared properties are checked first', () => {
			const error: EjvError | null = ejv({ o: { a: 'x', b: 2 } }, [{ key: 'o', type: 'object', allowUnknownProperty: false, properties }]);

			expect(error?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
			expect(error?.path).to.be.eql('o/a');
		});

		it('works with properties only', () => {
			expect(ejv({ o: { a: 1 } }, [{ key: 'o', type: 'object', allowUnknownProperty: false }])).to.be.null;
		});

		it('object in array items', () => {
			const error: EjvError | null = ejv({
				arr: [{ a: 1 }, { a: 1, z: 1 }]
			}, [{
				key: 'arr',
				type: 'array',
				items: { type: 'object', allowUnknownProperty: false, properties }
			}]);

			expect(error?.type).to.be.eql(ERROR_TYPE.UNKNOWN_PROPERTY);
			expect(error?.path).to.be.eql('arr/1');
		});
	});
});
