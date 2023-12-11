import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';
import { ErrorMsg, ErrorType } from '../src/constants';
import { AnyObject, EjvError, Scheme } from '../src/interfaces';
import { createErrorMsg } from '../src/util';


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
				expect(error).to.not.have.property('path');
				expect(error).to.not.have.property('errorScheme');
				expect(error).to.have.property('errorData', undefined);
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
				expect(error).to.not.have.property('path');
				expect(error).to.not.have.property('errorScheme');
				expect(error).to.have.property('errorData', null);
			});
		});

		describe('scheme', () => {
			const data = {
				a: 'hello'
			};

			it('no scheme', () => {
				const error: EjvError | null = ejv(data, undefined as unknown as Scheme[]);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.NO_SCHEME);
				expect(error).to.have.property('message', ErrorMsg.NO_SCHEME);
				expect(error).to.have.property('data', data);
				expect(error).to.not.have.property('path');
				expect(error).to.have.property('errorScheme', undefined);
				expect(error).to.not.have.property('errorData');
			});

			it('null scheme', () => {
				const error: EjvError | null = ejv(data, null as unknown as Scheme[]);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.NO_SCHEME);
				expect(error).to.have.property('message', ErrorMsg.NO_SCHEME);
				expect(error).to.have.property('data', data);
				expect(error).to.not.have.property('path');
				expect(error).to.have.property('errorScheme', null);
				expect(error).to.not.have.property('errorData');
			});

			it('empty scheme array', () => {
				const errorScheme: Scheme[] = [];

				const error: EjvError | null = ejv(data, errorScheme);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(error).to.have.property('message', ErrorMsg.EMPTY_SCHEME);
				expect(error).to.have.property('data', data);
				expect(error).to.not.have.property('path');
				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.not.have.property('errorData');
			});

			it('invalid scheme object', () => {
				const errorScheme: Scheme[] = ['string'];

				const error: EjvError | null = ejv(data, errorScheme);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(error).to.have.property('message', ErrorMsg.NO_OBJECT_ARRAY_SCHEME);
				expect(error).to.have.property('data', data);
				expect(error).to.not.have.property('path');
				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.not.have.property('errorData');
			});

			it('no type', () => {
				const errorScheme: Scheme = {
					key: 'a'
				} as unknown as Scheme;

				const error: EjvError | null = ejv(data, [errorScheme]);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(error).to.have.property('message', ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE);
				expect(error).to.have.property('data', data);
				expect(error).to.not.have.property('path');
				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.not.have.property('errorData');
			});

			it('invalid type', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'invalidType'
				};

				const error: EjvError | null = ejv(data, [errorScheme]);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(error).to.have.property('message', createErrorMsg(ErrorMsg.SCHEMES_HAS_INVALID_TYPE, {
					placeholders: ['invalidType']
				}));
				expect(error).to.have.property('data', data);
				expect(error).to.not.have.property('path');
				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.not.have.property('errorData');
			});

			it('duplicated type', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: ['string', 'string']
				};

				const error: EjvError | null = ejv(data, [errorScheme]);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(error).to.have.property('message', createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
					placeholders: ['string']
				}));
				expect(error).to.have.property('data', data);
				expect(error).to.not.have.property('path');
				expect(error).to.have.property('errorScheme', errorScheme);
				expect(error).to.not.have.property('errorData');
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
