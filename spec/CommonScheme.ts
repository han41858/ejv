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

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string'
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.REQUIRED);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.REQUIRED));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.undefined;
			});

			it('correct type', () => {
				const error: EjvError | null = ejv({
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

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string'
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
					placeholders: ['string']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(123);
			});
		});

		describe('optional === false', () => {
			it('undefined value', () => {
				const data = {
					a: undefined
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					optional: false
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.REQUIRED);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.REQUIRED));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.undefined;
			});

			it('correct type', () => {
				const error: EjvError | null = ejv({
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

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					optional: false
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

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
				const error: EjvError | null = ejv({
					a: undefined
				}, [{
					key: 'a',
					type: 'string',
					optional: true
				}]);

				expect(error).to.be.null;
			});

			it('correct type', () => {
				const error: EjvError | null = ejv({
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

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					optional: true
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

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

			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string'
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.REQUIRED);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.REQUIRED));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.null;
		});

		it('nullable === false', () => {
			const data = {
				a: null
			};

			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				nullable: false
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.REQUIRED);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.REQUIRED));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.null;
		});

		it('nullable === true', () => {
			const error: EjvError | null = ejv({
				a: null
			}, [{
				key: 'a',
				type: 'string',
				nullable: true
			}]);

			expect(error).to.be.null;
		});
	});
});
