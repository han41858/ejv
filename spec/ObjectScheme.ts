import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError, Scheme } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { typeTester } from './common-test-runner';


describe('ObjectScheme', () => {
	describe('type', () => {
		describe('mismatch', () => {
			typeTester
				.filter(obj => {
					return !['null', 'date', 'regexp', 'array', 'object'].includes(obj.type);
				})
				.forEach((obj) => {
					const data = {
						a: obj.value
					};

					it(obj.type, () => {
						const error: EjvError = ejv(data, [{
							key: 'a',
							type: 'object'
						}]);

						expect(error).to.be.instanceof(EjvError);
						expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
						expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
							placeholders: ['object']
						}));
						expect(error.path).to.be.eql('a');
						expect(error.data).to.be.deep.equal(data);
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = {};
				const typeArr: string[] = ['boolean', 'number'];

				const data = {
					a: value
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: typeArr
				}]);

				expect(error).to.be.instanceof(EjvError);
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
					type: 'object',
					optional: true
				}])).to.be.null;
			});

			typeTester
				.filter(obj => {
					return ['null', 'date', 'regexp', 'array', 'object'].includes(obj.type);
				})
				.forEach((obj) => {
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
			it('undefined is ok', () => {
				expect(ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					properties: undefined
				}])).to.be.null;
			});

			it('null', () => {
				expect(() => ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					properties: null
				}])).to.throw(createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY));
			});

			it('not array', () => {
				expect(() => ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					properties: 'b' as unknown as Scheme[]
				}])).to.throw(createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY));
			});

			it('empty array', () => {
				expect(() => ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					properties: []
				}])).to.throw(createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_HAVE_ITEMS));
			});

			it('not object array', () => {
				expect(() => ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					properties: ['b'] as unknown as Scheme[]
				}])).to.throw(createErrorMsg(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT));
			});
		});

		it('with single type', () => {
			const undefinedError: EjvError = ejv({
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
			expect(undefinedError.type).to.be.eql(ErrorType.REQUIRED);
			expect(undefinedError.message).to.be.eql(ErrorMsg.REQUIRED);
			expect(undefinedError.path).to.be.eql('a/b');

			const nullError: EjvError = ejv({
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
			expect(nullError.type).to.be.eql(ErrorType.REQUIRED);
			expect(nullError.message).to.be.eql(ErrorMsg.REQUIRED);
			expect(nullError.path).to.be.eql('a');

			const data = {
				a: {
					b: 1
				}
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: 'string'
				}]
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
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
			const typeArr: string[] = ['string', 'boolean'];

			const undefinedError: EjvError = ejv({
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
			expect(undefinedError.type).to.be.eql(ErrorType.REQUIRED);
			expect(undefinedError.message).to.be.eql(ErrorMsg.REQUIRED);
			expect(undefinedError.path).to.be.eql('a/b');

			const data = {
				a: {
					b: 1
				}
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'object',
				properties: [{
					key: 'b',
					type: typeArr
				}]
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH_ONE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH_ONE_OF, {
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
			it('undefined is ok', () => {
				expect(ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: undefined
				}])).to.be.null;
			});

			it('null', () => {
				expect(() => ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: null
				}])).to.throw(createErrorMsg(ErrorMsg.ALLOW_NO_PROPERTY_SHOULD_BE_BOOLEAN));
			});
		});

		describe('default', () => {
			it('empty object', () => {
				const error: EjvError = ejv({
					a: {}
				}, [{
					key: 'a',
					type: 'object'
				}]);

				expect(error).to.be.null;
			});

			it('object has property', () => {
				const error: EjvError = ejv({
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
				const error: EjvError = ejv({
					a: {}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: false
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.NO_PROPERTY);
				expect(error.message).to.be.eql(ErrorMsg.NO_PROPERTY);
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.a('object');
			});

			it('object has property', () => {
				const error: EjvError = ejv({
					a: {
						b: 1
					}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: false
				}]);

				expect(error).to.be.null;
			});
		});

		describe('allowNoProperty === true', () => {
			it('empty object', () => {
				const error: EjvError = ejv({
					a: {}
				}, [{
					key: 'a',
					type: 'object',
					allowNoProperty: true
				}]);

				expect(error).to.be.null;
			});

			it('object has property', () => {
				const error: EjvError = ejv({
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
});
