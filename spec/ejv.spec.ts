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
					type: 'invalidType'
				};

				checkSchemeError({
					data,
					errorScheme,
					message: createErrorMsg(ERROR_MESSAGE.SCHEMES_HAS_INVALID_TYPE, {
						placeholders: ['invalidType']
					})
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

				// scheme errors found while checking the value are returned immediately at that level,
				// so customErrorMsg is applied only when they come back from nested schemes
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

					// current behavior, not a design decision yet
					it('applied to scheme error from object properties (current behavior)', () => {
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
						expect(error?.message).to.be.eql(customErrorMsg);
					});

					it('applied to scheme error from array items (current behavior)', () => {
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
						expect(error?.message).to.be.eql(customErrorMsg);
					});
				});
			});
		});
	});
});
