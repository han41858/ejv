import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';


describe('CommonScheme', () => {
	describe('optional', () => {
		describe('default', () => {
			it('undefined value', () => {
				const data = {
					a: undefined
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string'
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.REQUIRED);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.REQUIRED));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.undefined;
			});

			it('correct type', () => {
				const error: EjvError = ejv({
					a: 'abc'
				}, [{
					key: 'a',
					type: 'string'
				}]);

				expect(error).to.be.null;
			});

			it('incorrect type', () => {
				const data = {
					a: 123
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string'
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
					placeholders: ['string']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(123);
			});
		});

		// TODO: not

		describe('optional === false', () => {
			it('undefined value', () => {
				const data = {
					a: undefined
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					optional: false
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.REQUIRED);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.REQUIRED));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.undefined;
			});

			it('correct type', () => {
				const error: EjvError = ejv({
					a: 'abc'
				}, [{
					key: 'a',
					type: 'string',
					optional: false
				}]);

				expect(error).to.be.null;
			});

			it('incorrect type', () => {
				const data = {
					a: 123
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					optional: false
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
					placeholders: ['string']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(123);
			});
		});

		describe('optional === true', () => {
			it('undefined value', () => {
				const error: EjvError = ejv({
					a: undefined
				}, [{
					key: 'a',
					type: 'string',
					optional: true
				}]);

				expect(error).to.be.null;
			});

			it('correct type', () => {
				const error: EjvError = ejv({
					a: 'abc'
				}, [{
					key: 'a',
					type: 'string',
					optional: true
				}]);

				expect(error).to.be.null;
			});

			it('incorrect type', () => {
				const data = {
					a: 123
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					optional: true
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
					placeholders: ['string']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(123);
			});
		});
	});

	describe('nullable', () => {
		it('default', () => {
			const data = {
				a: null
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string'
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.REQUIRED);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.REQUIRED));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.null;
		});

		// TODO: not

		it('nullable === false', () => {
			const data = {
				a: null
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				nullable: false
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.REQUIRED);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.REQUIRED));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.null;
		});

		it('nullable === true', () => {
			const error: EjvError = ejv({
				a: null
			}, [{
				key: 'a',
				type: 'string',
				nullable: true
			}]);

			expect(error).to.be.null;
		});
	});

	describe('not', () => {
		describe('error', () => {
			describe('same type in not', () => {
				it('single & single', () => {
					expect(() => ejv({
						a: 'hello'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							type: 'string'
						}
					}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
						placeholders: ['string']
					}));
				});

				it('single & array', () => {
					expect(() => ejv({
						a: 'hello'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							type: ['string']
						}
					}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
						placeholders: ['string']
					}));
				});

				it('array & single', () => {
					expect(() => ejv({
						a: 'hello'
					}, [{
						key: 'a',
						type: ['string'],
						not: {
							type: 'string'
						}
					}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
						placeholders: ['string']
					}));
				});

				it('array & array', () => {
					expect(() => ejv({
						a: 'hello'
					}, [{
						key: 'a',
						type: ['string'],
						not: {
							type: ['string']
						}
					}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE, {
						placeholders: ['string']
					}));
				});
			});

			describe('duplicated rule in not', () => {
				it('in object', () => {
					expect(() => ejv({
						a: 'hello'
					}, [{
						key: 'a',
						type: 'string',
						optional: true,
						not: {
							optional: true
						}
					}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_RULES_CONTRARY));
				});

				it('in object array', () => {
					expect(() => ejv({
						a: 'hello'
					}, [{
						key: 'a',
						type: 'string',
						optional: true,
						not: [{
							optional: true
						}]
					}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_RULES_CONTRARY));
				});

				it('in object array', () => {
					expect(() => ejv({
						a: 'hello'
					}, [{
						key: 'a',
						type: 'string',
						optional: true,
						not: [{
							nullable: true
						}, {
							optional: true
						}]
					}])).to.throw(createErrorMsg(ErrorMsg.SCHEMES_HAS_RULES_CONTRARY));
				});
			});
		});

		describe('check types', () => {
			it('with single type', () => {
				const value = 'hello';

				expect(ejv({
					a: value
				}, [{
					key: 'a',
					not: {
						type: 'boolean'
					}
				}])).to.be.null;


				const error: EjvError = ejv({
					a: value
				}, [{
					key: 'a',
					not: {
						type: 'string'
					}
				}]);

				expect(error).to.be.instanceOf(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
				expect(error.path).to.be.eql('a');
				expect(error.errorData).to.be.eql(value);
			});

			it('with single type - nested', () => {
				const value = 'hello';

				expect(ejv({
					a: value
				}, [{
					key: 'a',
					not: {
						not: {
							type: 'string'
						}
					}
				}])).to.be.null;

				const error: EjvError = ejv({
					a: value
				}, [{
					key: 'a',
					not: {
						not: {
							type: 'number'
						}
					}
				}]);

				expect(error).to.be.instanceOf(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
				expect(error.path).to.be.eql('a');
				expect(error.errorData).to.be.eql(value);
			});

			it('with type array', () => {
				const value = 'hello';

				expect(ejv({
					a: value
				}, [{
					key: 'a',
					not: {
						type: ['boolean', 'number'] // not boolean & not number
					}
				}])).to.be.null;


				const error: EjvError = ejv({
					a: value
				}, [{
					key: 'a',
					not: {
						type: ['string', 'number'] // not string & not number
					}
				}]);

				expect(error).to.be.instanceOf(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH_ONE_OF);
				expect(error.path).to.be.eql('a');
				expect(error.errorData).to.be.eql(value);
			});

			it('with type array - nested', () => {
				const value = 'hello';

				expect(ejv({
					a: value
				}, [{
					key: 'a',
					not: {
						not: {
							type: ['string']
						}
					}
				}])).to.be.null;


				const error: EjvError = ejv({
					a: value
				}, [{
					key: 'a',
					not: {
						not: {
							type: ['number', 'boolean'] // number | boolean
						}
					}
				}]);

				expect(error).to.be.instanceOf(EjvError);
				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH_ONE_OF);
				expect(error.path).to.be.eql('a');
				expect(error.errorData).to.be.eql(value);
			});
		});
	});
});
