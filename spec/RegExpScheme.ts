import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { TypeTester, typeTesterArr } from './common-test-util';


describe('RegExpScheme', () => {
	describe('type', () => {
		describe('mismatch', () => {
			typeTesterArr
				.filter((obj: TypeTester): boolean => obj.type !== 'regexp')
				.forEach((obj: TypeTester): void => {
					it(obj.type, () => {
						const testData = {
							a: obj.value
						};

						const error: EjvError | null = ejv(testData, [{
							key: 'a',
							type: 'regexp'
						}]);

						expect(error).to.be.instanceof(EjvError);

						if (!error) {
							throw new Error('spec failed');
						}

						expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH);
						expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH, {
							placeholders: ['regexp']
						}));
						expect(error.path).to.be.eql('a');
						expect(error.data).to.be.deep.equal(testData);
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = 'ejv';
				const typeArr: string[] = ['boolean', 'regexp'];

				const testData = {
					a: value
				};

				const error: EjvError | null = ejv(testData, [{
					key: 'a',
					type: typeArr
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.TYPE_MISMATCH_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.TYPE_MISMATCH_ONE_OF, {
					placeholders: [JSON.stringify(typeArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(testData);
				expect(error.errorData).to.be.eql(value);
			});
		});

		describe('match', () => {
			it('optional', () => {
				expect(ejv({
					a: undefined
				}, [{
					key: 'a',
					type: 'regexp',
					optional: true
				}])).to.be.null;
			});

			it('single type', () => {
				expect(ejv({
					a: /./
				}, [{
					key: 'a',
					type: 'regexp'
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: /./
				}, [{
					key: 'a',
					type: ['regexp', 'number']
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: /./
				}, [{
					key: 'a',
					type: ['number', 'regexp']
				}])).to.be.null;
			});
		});
	});
});
