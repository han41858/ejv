import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';
import { ErrorMsg, ErrorType } from '../src/constants';
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
				expect(error).to.have.property('type', ErrorType.NO_DATA);
				expect(error).to.have.property('message', ErrorMsg.NO_DATA);

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
				expect(error).to.have.property('type', ErrorType.NO_DATA);
				expect(error).to.have.property('message', ErrorMsg.NO_DATA);

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

				expect(error).to.have.property('type', ErrorType.NO_SCHEME);
				expect(error).to.have.property('message', ErrorMsg.NO_SCHEME);

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

				expect(error).to.have.property('type', ErrorType.NO_SCHEME);
				expect(error).to.have.property('message', ErrorMsg.NO_SCHEME);

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

				expect(error).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(error).to.have.property('message', ErrorMsg.EMPTY_SCHEME);

				expect(error).to.have.property('data', data);
				expect(error).to.have.property('path', undefined);

				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.have.property('errorData', undefined);

				expect(error).to.have.property('isSchemeError', true);
				expect(error).to.have.property('isDataError', false);
			});

			// can't use checkSchemeError()
			it('invalid scheme object', () => {
				const errorScheme: Scheme[] = ['string'];

				const error: EjvError | null = ejv(data, errorScheme);

				expect(error).to.be.instanceof(EjvError);

				expect(error).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(error).to.have.property('message', ErrorMsg.NO_OBJECT_ARRAY_SCHEME);

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
					message: ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE
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
					message: createErrorMsg(ErrorMsg.SCHEMES_HAS_INVALID_TYPE, {
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
					message: createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
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
							[ErrorType.REQUIRED]: customErrorMsg
						}
					});

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ErrorType.REQUIRED);
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
							[ErrorType.TYPE_MISMATCH]: customErrorMsg
						}
					});

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
					expect(error.message).to.be.eql(customErrorMsg);
				});
			});
		});
	});
});
