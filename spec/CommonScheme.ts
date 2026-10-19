import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError, Scheme } from '../src/interfaces';
import { ERROR_MESSAGE, ERROR_TYPE } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { checkSchemeError } from './common-test-util';


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

				expect(error.type).to.be.eql(ERROR_TYPE.REQUIRED);
				expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.REQUIRED));
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

				expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
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

				expect(error.type).to.be.eql(ERROR_TYPE.REQUIRED);
				expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.REQUIRED));
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

				expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
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

				expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
				expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
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

			expect(error.type).to.be.eql(ERROR_TYPE.REQUIRED);
			expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.REQUIRED));
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

			expect(error.type).to.be.eql(ERROR_TYPE.REQUIRED);
			expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.REQUIRED));
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

	describe('parent', () => {
		describe('type', () => {
			it('inherited when type is omitted', () => {
				expect(ejv({ a: 1 }, [{ key: 'a', parent: { type: 'number' } }])).to.be.null;

				const error: EjvError | null = ejv({ a: 'x' }, [{ key: 'a', parent: { type: 'number' } }]);

				expect(error?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
				expect(error?.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
					placeholders: ['number']
				}));
				expect(error?.path).to.be.eql('a');
			});

			it('multiple types', () => {
				const error: EjvError | null = ejv({ a: true }, [{ key: 'a', parent: { type: ['number', 'string'] } }]);

				expect(error?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH_ONE_OF);
				expect(error?.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH_ONE_OF, {
					placeholders: [JSON.stringify(['number', 'string'])]
				}));
			});

			it('inherited from grandparent', () => {
				expect(ejv({ a: 1 }, [{ key: 'a', parent: { parent: { type: 'number' } } }])).to.be.null;

				const error: EjvError | null = ejv({ a: 'x' }, [{ key: 'a', parent: { parent: { type: 'number' } } }]);

				expect(error?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
				expect(error?.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
					placeholders: ['number']
				}));

				const multipleTypesError: EjvError | null = ejv({ a: true }, [{ key: 'a', parent: { parent: { type: ['number', 'string'] } } }]);

				expect(multipleTypesError?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH_ONE_OF);
				expect(multipleTypesError?.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH_ONE_OF, {
					placeholders: [JSON.stringify(['number', 'string'])]
				}));
			});

			it('own type first', () => {
				expect(ejv({ a: 'x' }, [{ key: 'a', type: 'string', parent: { type: 'number' } }])).to.be.null;
			});
		});

		describe('number min & max', () => {
			it('inherited', () => {
				const schemes = [{ key: 'a', type: 'number', parent: { min: 1, max: 2 } }];

				expect(ejv({ a: 1 }, schemes)).to.be.null;
				expect(ejv({ a: 2 }, schemes)).to.be.null;

				const minError: EjvError | null = ejv({ a: 0 }, schemes);

				expect(minError?.type).to.be.eql(ERROR_TYPE.BIGGER_THAN_OR_EQUAL);
				expect(minError?.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.BIGGER_THAN_OR_EQUAL, {
					placeholders: [1]
				}));

				const maxError: EjvError | null = ejv({ a: 3 }, schemes);

				expect(maxError?.type).to.be.eql(ERROR_TYPE.SMALLER_THAN_OR_EQUAL);
				expect(maxError?.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.SMALLER_THAN_OR_EQUAL, {
					placeholders: [2]
				}));
			});

			it('own value first', () => {
				expect(ejv({ a: 1 }, [{ key: 'a', type: 'number', min: 0, parent: { min: 5 } }])).to.be.null;
				expect(ejv({ a: 9 }, [{ key: 'a', type: 'number', max: 10, parent: { max: 5 } }])).to.be.null;
			});
		});

		describe('date min & max', () => {
			it('inherited', () => {
				const minError: EjvError | null = ejv({
					a: new Date(2019, 0, 1)
				}, [{ key: 'a', type: 'date', parent: { min: '2020-01-01' } }]);

				expect(minError?.type).to.be.eql(ERROR_TYPE.AFTER_OR_SAME_DATE);

				const maxError: EjvError | null = ejv({
					a: new Date(2021, 0, 1)
				}, [{ key: 'a', type: 'date', parent: { max: '2020-12-31' } }]);

				expect(maxError?.type).to.be.eql(ERROR_TYPE.BEFORE_OR_SAME_DATE);

				expect(ejv({
					a: new Date(2020, 5, 1)
				}, [{ key: 'a', type: 'date', parent: { min: '2020-01-01', max: '2020-12-31' } }])).to.be.null;
			});
		});
	});

	describe('validate', () => {
		const positive = (value: number): string | null => {
			return value > 0 ? null : 'should be positive';
		};

		describe('check parameter', () => {
			it('undefined is ok', () => {
				expect(ejv({ a: 1 }, [{ key: 'a', type: 'number', validate: undefined }])).to.be.null;
			});

			it('not function', () => {
				checkSchemeError({
					data: { a: 1 },
					errorScheme: { key: 'a', type: 'number', validate: 'x' as unknown as () => null },
					message: ERROR_MESSAGE.VALIDATE_SHOULD_BE_FUNCTION
				});
			});

			const invalidReturns: unknown[] = [false, true, undefined, 0];

			invalidReturns.forEach((returnValue: unknown): void => {
				it(`returns ${ String(returnValue) }`, () => {
					checkSchemeError({
						data: { a: 1 },
						errorScheme: { key: 'a', type: 'number', validate: (() => returnValue) as () => null },
						message: createErrorMsg(ERROR_MESSAGE.VALIDATE_SHOULD_RETURN_NULL_OR_STRING, {
							placeholders: [String(JSON.stringify(returnValue))]
						})
					});
				});
			});
		});

		it('returns null : valid', () => {
			expect(ejv({ a: 1 }, [{ key: 'a', type: 'number', validate: positive }])).to.be.null;
		});

		it('returns string : error with the message', () => {
			const data = { a: -1 };
			const scheme: Scheme = { key: 'a', type: 'number', validate: positive };

			const error: EjvError | null = ejv(data, [scheme]);

			expect(error).to.be.instanceof(EjvError);
			expect(error?.type).to.be.eql(ERROR_TYPE.CUSTOM);
			expect(error?.message).to.be.eql('should be positive');
			expect(error?.path).to.be.eql('a');
			expect(error?.data).to.be.eql(data);
			expect(error?.errorData).to.be.eql(-1);
			expect(error?.errorScheme).to.be.eql(scheme);
			expect(error?.isDataError).to.be.true;
		});

		it('returns empty string : error with default message', () => {
			const error: EjvError | null = ejv({ a: 1 }, [{ key: 'a', type: 'number', validate: (): string => '' }]);

			expect(error?.type).to.be.eql(ERROR_TYPE.CUSTOM);
			expect(error?.message).to.be.eql(ERROR_MESSAGE.CUSTOM);
		});

		it('called after the other rules pass', () => {
			let callCount: number = 0;

			const counter = (): null => {
				callCount++;
				return null;
			};

			expect(ejv({ a: 0 }, [{ key: 'a', type: 'number', min: 1, validate: counter }])?.type).to.be.eql(ERROR_TYPE.BIGGER_THAN_OR_EQUAL);
			expect(ejv({ a: 'x' }, [{ key: 'a', type: 'number', validate: counter }])?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
			expect(callCount).to.be.eql(0);

			expect(ejv({ a: 1 }, [{ key: 'a', type: 'number', min: 1, validate: counter }])).to.be.null;
			expect(callCount).to.be.eql(1);
		});

		it('not called for undefined or null allowed by optional, nullable', () => {
			let callCount: number = 0;

			const counter = (): null => {
				callCount++;
				return null;
			};

			expect(ejv({}, [{ key: 'a', type: 'number', optional: true, validate: counter }])).to.be.null;
			expect(ejv({ a: null }, [{ key: 'a', type: 'number', nullable: true, validate: counter }])).to.be.null;
			expect(callCount).to.be.eql(0);
		});

		it('types without other rules', () => {
			expect(ejv({ a: false }, [{
				key: 'a',
				type: 'boolean',
				validate: (value: unknown): string | null => value === true ? null : 'should be true'
			}])?.type).to.be.eql(ERROR_TYPE.CUSTOM);

			expect(ejv({ a: /ejv/ }, [{
				key: 'a',
				type: 'regexp',
				validate: (value: unknown): string | null => (value as RegExp).flags.includes('g') ? null : 'should be global'
			}])?.message).to.be.eql('should be global');
		});

		describe('data : the data passed to ejv()', () => {
			it('nested object', () => {
				const data = { password: 'abc', confirm: { value: 'abd' } };

				const error: EjvError | null = ejv(data, [{
					key: 'password',
					type: 'string'
				}, {
					key: 'confirm',
					type: 'object',
					properties: [{
						key: 'value',
						type: 'string',
						validate: (value: unknown, rootData: unknown): string | null => {
							return value === (rootData as typeof data).password ? null : 'not matched';
						}
					}]
				}]);

				expect(error?.type).to.be.eql(ERROR_TYPE.CUSTOM);
				expect(error?.path).to.be.eql('confirm/value');
			});

			it('array items', () => {
				const data = { max: 2, list: [1, 3] };

				const error: EjvError | null = ejv(data, [{
					key: 'list',
					type: 'array',
					items: {
						type: 'number',
						validate: (value: unknown, rootData: unknown): string | null => {
							return (value as number) <= (rootData as typeof data).max ? null : 'too big';
						}
					}
				}]);

				expect(error?.message).to.be.eql('too big');
				expect(error?.path).to.be.eql('list/1');
			});
		});

		it('with customErrorMsg', () => {
			const error: EjvError | null = ejv({ a: -1 }, [{ key: 'a', type: 'number', validate: positive }], {
				customErrorMsg: { [ERROR_TYPE.CUSTOM]: 'custom message' }
			});

			expect(error?.message).to.be.eql('custom message');
		});

		it('errors thrown by validate are not caught', () => {
			expect(() => ejv({ a: 1 }, [{
				key: 'a',
				type: 'number',
				validate: (): string | null => {
					throw new Error('bug in validate');
				}
			}])).to.throw('bug in validate');
		});
	});
});
