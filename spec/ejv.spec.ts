import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';
import { ERROR_MESSAGE, ERROR_TYPE } from '../src/constants';
import { AnyObject, EjvError, Scheme } from '../src/interfaces';
import { createErrorMsg } from '../src/util';
import { checkSchemeError } from './common-test-util';


describe('ejv()', () => {
	describe('ejv() itself', () => {
		describe('data', () => {
			it('no data', () => {
				const error: EjvError | null = ejv(
					undefined as unknown as AnyObject,
					undefined as unknown as Scheme[]
				);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ERROR_TYPE.NO_DATA);
				expect(error).to.have.property('message', ERROR_MESSAGE.NO_DATA);

				expect(error).to.have.property('data', undefined);
				expect(error).to.have.property('path', undefined);

				expect(error).to.have.property('errorScheme', undefined);
				expect(error).to.have.property('errorData', undefined);

				expect(error).to.have.property('isSchemeError', false);
				expect(error).to.have.property('isDataError', true);
			});

			it('null data', () => {
				const error: EjvError | null = ejv(
					null as unknown as AnyObject,
					undefined as unknown as Scheme[]
				);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ERROR_TYPE.NO_DATA);
				expect(error).to.have.property('message', ERROR_MESSAGE.NO_DATA);

				expect(error).to.have.property('data', null);
				expect(error).to.have.property('path', undefined);

				expect(error).to.have.property('errorScheme', undefined);
				expect(error).to.have.property('errorData', null);

				expect(error).to.have.property('isSchemeError', false);
				expect(error).to.have.property('isDataError', true);
			});
		});

		describe('scheme', () => {
			const data = {
				a: 'hello'
			};

			// can't use checkSchemeError()
			it('no scheme', () => {
				const error: EjvError | null = ejv(data, undefined as unknown as Scheme[]);

				expect(error).to.be.instanceof(EjvError);

				expect(error).to.have.property('type', ERROR_TYPE.NO_SCHEME);
				expect(error).to.have.property('message', ERROR_MESSAGE.NO_SCHEME);

				expect(error).to.have.property('data', data);
				expect(error).to.have.property('path', undefined);

				expect(error).to.have.property('errorScheme', undefined);
				expect(error).to.have.property('errorData', undefined);

				expect(error).to.have.property('isSchemeError', true);
				expect(error).to.have.property('isDataError', false);
			});

			// can't use checkSchemeError()
			it('null scheme', () => {
				const error: EjvError | null = ejv(data, null as unknown as Scheme[]);

				expect(error).to.be.instanceof(EjvError);

				expect(error).to.have.property('type', ERROR_TYPE.NO_SCHEME);
				expect(error).to.have.property('message', ERROR_MESSAGE.NO_SCHEME);

				expect(error).to.have.property('data', data);
				expect(error).to.have.property('path', undefined);

				expect(error).to.have.property('errorScheme', null);
				expect(error).to.have.property('errorData', undefined);

				expect(error).to.have.property('isSchemeError', true);
				expect(error).to.have.property('isDataError', false);
			});

			// can't use checkSchemeError()
			it('empty scheme array', () => {
				const errorScheme: Scheme[] = [];

				const error: EjvError | null = ejv(data, errorScheme);

				expect(error).to.be.instanceof(EjvError);

				expect(error).to.have.property('type', ERROR_TYPE.INVALID_SCHEMES);
				expect(error).to.have.property('message', ERROR_MESSAGE.EMPTY_SCHEME);

				expect(error).to.have.property('data', data);
				expect(error).to.have.property('path', undefined);

				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.have.property('errorData', undefined);

				expect(error).to.have.property('isSchemeError', true);
				expect(error).to.have.property('isDataError', false);
			});

			it('null in schemes', () => {
				const errorScheme: Scheme[] = [null as unknown as Scheme];

				const error: EjvError | null = ejv(data, errorScheme);

				expect(error).to.be.instanceof(EjvError);

				expect(error).to.have.property('type', ERROR_TYPE.INVALID_SCHEMES);
				expect(error).to.have.property('message', ERROR_MESSAGE.NO_OBJECT_ARRAY_SCHEME);
				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.have.property('isSchemeError', true);
			});

			// can't use checkSchemeError()
			it('invalid scheme object', () => {
				const errorScheme: Scheme[] = ['string'];

				const error: EjvError | null = ejv(data, errorScheme);

				expect(error).to.be.instanceof(EjvError);

				expect(error).to.have.property('type', ERROR_TYPE.INVALID_SCHEMES);
				expect(error).to.have.property('message', ERROR_MESSAGE.NO_OBJECT_ARRAY_SCHEME);

				expect(error).to.have.property('data', data);
				expect(error).to.have.property('path', undefined);

				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.have.property('errorData', undefined);

				expect(error).to.have.property('isSchemeError', true);
				expect(error).to.have.property('isDataError', false);
			});

			it('no type', () => {
				const errorScheme: Scheme = {
					key: 'a'
				} as unknown as Scheme;

				checkSchemeError({
					data,
					errorScheme,
					message: ERROR_MESSAGE.SCHEMES_SHOULD_HAVE_TYPE
				});
			});

			it('invalid type', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'invalidType' as never
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_INVALID_TYPE, {
						placeholders: ['invalidType']
					})
				});
			});

			it('invalid type : bigint', () => {
				checkSchemeError({
					data,
					errorScheme: { key: 'a', type: 1n as never },
					message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_INVALID_TYPE, {
						placeholders: ['1n']
					})
				});
			});

			const falsyTypes: [string, unknown][] = [
				['empty string', ''],
				['null', null],
				['null in array', ['number', null]],
				['empty string in array', ['', 'number']]
			];

			falsyTypes.forEach(([name, type]: [string, unknown]): void => {
				it(`invalid type : ${ name }`, () => {
					const errorScheme: Scheme = {
						key: 'a',
						type: type as never,
						parent: { type: 'number' }
					};

					const invalidType: unknown = Array.isArray(type)
						? type.find((one: unknown): boolean => !one)
						: type;

					checkSchemeError({
						data,
						errorScheme,
						message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_INVALID_TYPE, {
							placeholders: [JSON.stringify(invalidType)]
						})
					});
				});
			});

			it('duplicated type', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: ['string', 'string']
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_DUPLICATED_TYPE, {
						placeholders: ['string']
					})
				});
			});
		});

		describe('options', () => {
			describe('customErrorMsg', () => {
				it('override required error', () => {
					const customErrorMsg = 'property \'a\' required';

					const error: EjvError | null = ejv({
						// empty
					}, [{
						key: 'a',
						type: 'number'
					}], {
						customErrorMsg: {
							[ERROR_TYPE.REQUIRED]: customErrorMsg
						}
					});

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ERROR_TYPE.REQUIRED);
					expect(error.message).to.be.eql(customErrorMsg);
				});

				it('override type matching error', () => {
					const customErrorMsg = 'property \'a\' should be a number';

					const error: EjvError | null = ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'number'
					}], {
						customErrorMsg: {
							[ERROR_TYPE.TYPE_MISMATCH]: customErrorMsg
						}
					});

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
					expect(error.message).to.be.eql(customErrorMsg);
				});

				describe('errors from nested schemes', () => {
					const customErrorMsg = 'custom message';

					it('object properties', () => {
						const error: EjvError | null = ejv({
							o: { x: 'a' }
						}, [{
							key: 'o',
							type: 'object',
							properties: [{ key: 'x', type: 'number' }]
						}], {
							customErrorMsg: { [ERROR_TYPE.TYPE_MISMATCH]: customErrorMsg }
						});

						expect(error?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
						expect(error?.message).to.be.eql(customErrorMsg);
						expect(error?.path).to.be.eql('o/x');
					});

					it('array items by scheme', () => {
						const error: EjvError | null = ejv({
							arr: [1, 'x']
						}, [{
							key: 'arr',
							type: 'array',
							items: { type: 'number' }
						}], {
							customErrorMsg: { [ERROR_TYPE.TYPE_MISMATCH]: customErrorMsg }
						});

						expect(error?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
						expect(error?.message).to.be.eql(customErrorMsg);
						expect(error?.path).to.be.eql('arr/1');
					});

					it('array items by type', () => {
						const error: EjvError | null = ejv({
							arr: [1, 'x']
						}, [{
							key: 'arr',
							type: 'array',
							items: 'number'
						}], {
							customErrorMsg: { [ERROR_TYPE.ITEMS_TYPE]: customErrorMsg }
						});

						expect(error?.type).to.be.eql(ERROR_TYPE.ITEMS_TYPE);
						expect(error?.message).to.be.eql(customErrorMsg);
						expect(error?.path).to.be.eql('arr/1');
					});

					it('object properties in array items', () => {
						const error: EjvError | null = ejv({
							arr: [{ n: 1 }, { n: 'x' }]
						}, [{
							key: 'arr',
							type: 'array',
							items: {
								type: 'object',
								properties: [{ key: 'n', type: 'number' }]
							}
						}], {
							customErrorMsg: { [ERROR_TYPE.TYPE_MISMATCH]: customErrorMsg }
						});

						expect(error?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
						expect(error?.message).to.be.eql(customErrorMsg);
						expect(error?.path).to.be.eql('arr/1/n');
					});
				});

				// customErrorMsg is for data errors. scheme errors keep their messages at any depth
				describe('scheme errors', () => {
					const customErrorMsg = 'custom scheme error';

					it('not applied to scheme error of the top level', () => {
						const error: EjvError | null = ejv({
							a: 1
						}, [{
							key: 'a',
							type: 'number',
							enum: 'x' as unknown as number[]
						}], {
							customErrorMsg: { [ERROR_TYPE.INVALID_SCHEMES]: customErrorMsg }
						});

						expect(error?.type).to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
						expect(error?.isSchemeError).to.be.true;
						expect(error?.message).to.be.eql(ERROR_MESSAGE.ENUM_SHOULD_BE_ARRAY);
					});

					it('not applied to invalid scheme list', () => {
						const error: EjvError | null = ejv({
							a: 1
						}, [], {
							customErrorMsg: { [ERROR_TYPE.INVALID_SCHEMES]: customErrorMsg }
						});

						expect(error?.type).to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
						expect(error?.message).to.be.eql(ERROR_MESSAGE.EMPTY_SCHEME);
					});

					it('not applied to scheme error from object properties', () => {
						const error: EjvError | null = ejv({
							o: { x: 1 }
						}, [{
							key: 'o',
							type: 'object',
							properties: [{ key: 'x', type: 'number', enum: 'x' as unknown as number[] }]
						}], {
							customErrorMsg: { [ERROR_TYPE.INVALID_SCHEMES]: customErrorMsg }
						});

						expect(error?.type).to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
						expect(error?.isSchemeError).to.be.true;
						expect(error?.message).to.be.eql(ERROR_MESSAGE.ENUM_SHOULD_BE_ARRAY);
					});

					it('not applied to scheme error from array items', () => {
						const error: EjvError | null = ejv({
							arr: [1]
						}, [{
							key: 'arr',
							type: 'array',
							items: { type: 'number', enum: 'x' as unknown as number[] }
						}], {
							customErrorMsg: { [ERROR_TYPE.INVALID_SCHEMES]: customErrorMsg }
						});

						expect(error?.type).to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
						expect(error?.isSchemeError).to.be.true;
						expect(error?.message).to.be.eql(ERROR_MESSAGE.ENUM_SHOULD_BE_ARRAY);
					});
				});
			});
		});
	});

	describe('scheme object', () => {
		const notSchemes: [string, unknown][] = [
			['array', []],
			['Date', new Date(0)],
			['RegExp', /a/],
			['buffer', new Uint8Array(1)]
		];

		notSchemes.forEach(([name, notScheme]: [string, unknown]): void => {
			it(`not scheme in schemes : ${ name }`, () => {
				const error: EjvError | null = ejv({ a: 1 }, [notScheme as Scheme]);

				expect(error?.type).to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
				expect(error?.message).to.be.eql(ERROR_MESSAGE.NO_OBJECT_ARRAY_SCHEME);
				expect(error?.isSchemeError).to.be.true;
			});
		});

		it('instance of a class is a scheme', () => {
			class NumberSchemeClass {
				key: string = 'a';
				type = 'number' as const;
			}

			expect(ejv({ a: 1 }, [new NumberSchemeClass()])).to.be.null;
			expect(ejv({ a: 'x' }, [new NumberSchemeClass()])?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
		});
	});

	describe('empty type list', () => {
		it('type: []', () => {
			checkSchemeError({
				data: { a: 1 },
				errorScheme: { key: 'a', type: [] },
				message: ERROR_MESSAGE.SCHEMES_SHOULD_HAVE_TYPE
			});
		});
	});

	describe('options.allowUnknownProperty', () => {
		const schemes: Scheme[] = [{ key: 'a', type: 'number' }];

		it('allowed by default', () => {
			expect(ejv({ a: 1, b: 2 }, schemes)).to.be.null;
			expect(ejv({ a: 1, b: 2 }, schemes, { allowUnknownProperty: true })).to.be.null;
		});

		it('not allowed', () => {
			const data = { a: 1, b: 2 };

			const error: EjvError | null = ejv(data, schemes, { allowUnknownProperty: false });

			expect(error?.type).to.be.eql(ERROR_TYPE.UNKNOWN_PROPERTY);
			expect(error?.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.UNKNOWN_PROPERTY, {
				placeholders: ['b']
			}));
			expect(error?.path).to.be.eql('');
			expect(error?.data).to.be.eql(data);
			expect(error?.errorData).to.be.eql(data);
			expect(error?.isDataError).to.be.true;
		});

		it('declared properties are checked first', () => {
			expect(ejv({ a: 'x', b: 2 }, schemes, { allowUnknownProperty: false })?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
		});

		it('applied to the top level only', () => {
			expect(ejv({
				a: 1,
				o: { z: 1 }
			}, [...schemes, {
				key: 'o',
				type: 'object'
			}], { allowUnknownProperty: false })).to.be.null;
		});

		it('with customErrorMsg', () => {
			const error: EjvError | null = ejv({ a: 1, b: 2 }, schemes, {
				allowUnknownProperty: false,
				customErrorMsg: { [ERROR_TYPE.UNKNOWN_PROPERTY]: 'no extra property' }
			});

			expect(error?.message).to.be.eql('no extra property');
		});

		it('not boolean', () => {
			const error: EjvError | null = ejv({ a: 1 }, schemes, { allowUnknownProperty: 'false' as unknown as boolean });

			expect(error?.type).to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
			expect(error?.message).to.be.eql(ERROR_MESSAGE.ALLOW_UNKNOWN_PROPERTY_SHOULD_BE_BOOLEAN);
			expect(error?.isSchemeError).to.be.true;
		});
	});
});
