import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';
import { ErrorMsg, ErrorType } from '../src/constants';
import { EjvError, Scheme } from '../src/interfaces';
import { createErrorMsg } from '../src/util';


describe('ejv()', () => {
	describe('ejv() itself', () => {
		describe('data', () => {
			it('no data', () => {
				const error: EjvError = ejv(undefined, undefined);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.REQUIRED);
				expect(error).to.have.property('message', ErrorMsg.NO_DATA);
				expect(error).to.have.property('path', '/');
			});

			it('null data', () => {
				const error: EjvError = ejv(null, undefined);

				expect(error).to.be.instanceof(EjvError);
				expect(error).to.have.property('type', ErrorType.REQUIRED);
				expect(error).to.have.property('message', ErrorMsg.NO_DATA);
				expect(error).to.have.property('path', '/');
			});
		});

		describe('scheme', () => {
			it('no scheme', () => {
				expect(() => ejv({
					a: 'hello'
				}, undefined)).to.throw(ErrorMsg.NO_SCHEME);
			});

			it('null scheme', () => {
				expect(() => ejv({
					a: 'hello'
				}, null)).to.throw(ErrorMsg.NO_SCHEME);
			});

			it('empty scheme array', () => {
				expect(() => ejv({
					a: 'hello'
				}, [])).to.throw(ErrorMsg.EMPTY_SCHEME);
			});

			it('invalid scheme object', () => {
				expect(() => ejv({
					a: 'hello'
				}, ['string' as unknown as Scheme])).to.throw(ErrorMsg.NO_OBJECT_ARRAY_SCHEME);
			});

			it('no type', () => {
				expect(() => ejv({
					a: 'hello'
				}, [{
					key: 'a'
				} as unknown as Scheme])).to.throw(ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE);
			});

			it('invalid type', () => {
				expect(() => ejv({
					a: 'hello'
				}, [{
					key: 'a',
					type: 'invalidType'
				}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_INVALID_TYPE, {
					placeholders: ['invalidType']
				}));

				expect(() => ejv({
					a: 'hello'
				}, [{
					key: 'a',
					type: ['string', 'invalidType']
				}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_INVALID_TYPE, {
					placeholders: ['invalidType']
				}));
			});

			it('duplicated type', () => {
				expect(() => ejv({
					a: 'hello'
				}, [{
					key: 'a',
					type: ['string', 'string']
				}])).to.throw(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE);
			});
		});

		describe('options', () => {
			describe('customErrorMsg', () => {
				it('override required error', () => {
					const customErrorMsg = 'property \'a\' required';

					const error: EjvError = ejv({
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
					expect(error.type).to.be.eql(ErrorType.REQUIRED);
					expect(error.message).to.be.eql(customErrorMsg);
				});

				it('override type matching error', () => {
					const customErrorMsg = 'property \'a\' should be a number';

					const error: EjvError = ejv({
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
					expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
					expect(error.message).to.be.eql(customErrorMsg);
				});
			});
		});
	});
});
