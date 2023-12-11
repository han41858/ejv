import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError, Scheme } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { TypeTester, typeTesterArr } from './common-test-runner';


describe('StringScheme', () => {
	describe('type', () => {
		describe('mismatch', () => {
			typeTesterArr
				.filter((obj: TypeTester): boolean => obj.type !== 'string')
				.forEach((obj: TypeTester): void => {
					const data = {
						a: obj.value
					};

					it(obj.type, () => {
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
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = 'ejv';
				const typeArr: string[] = ['boolean', 'number'];

				const data = {
					a: value
				};

				const error: EjvError | null = ejv(data, [{
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
					type: 'string',
					optional: true
				}])).to.be.null;
			});

			it('single type', () => {
				expect(ejv({
					a: 'ejv'
				}, [{
					key: 'a',
					type: 'string'
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: 'ejv'
				}, [{
					key: 'a',
					type: ['string', 'number']
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: 'ejv'
				}, [{
					key: 'a',
					type: ['number', 'string']
				}])).to.be.null;
			});
		});
	});

	describe('enum', () => {
		describe('check parameter', () => {
			const data = {
				a: 'a'
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					enum: undefined
				}])).to.be.null;
			});

			it('null', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					enum: null as unknown as string[]
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('not array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					enum: 'a' as unknown as string[]
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('not string', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					enum: [10]
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_STRINGS));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});
		});

		it('fail', () => {
			const enumArr: string[] = ['b', 'c'];

			const data = {
				a: 'a'
			};

			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				enum: enumArr
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.ONE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ONE_OF, {
				placeholders: [JSON.stringify(enumArr)]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql('a');
		});

		it('ok', () => {
			expect(ejv({
				a: 'a'
			}, [{
				key: 'a',
				type: 'string',
				enum: ['a', 'b', 'c']
			}])).to.be.null;
		});

	});

	describe('length', () => {
		describe('check parameter', () => {
			const data = {
				a: 'ejv'
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					length: undefined
				}])).to.be.null;
			});

			it('null', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					length: null as unknown as number
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('length type', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					length: '3' as unknown as number
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});
		});

		it('ok', () => {
			expect(ejv({
				a: 'ejv'
			}, [{
				key: 'a',
				type: 'string',
				length: 3
			}])).to.be.null;
		});

		it('fail', () => {
			const str: string = 'ejv';
			const data = {
				a: str
			};

			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				length: 4
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.LENGTH, {
				placeholders: [4]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql(str);
		});
	});

	describe('minLength', () => {
		describe('check parameter', () => {
			const data = {
				a: 'ejv'
			};
			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					minLength: undefined
				}])).to.be.null;
			});

			it('null', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					minLength: null as unknown as number
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('float number', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					minLength: 1.5
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('string', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					minLength: '1' as unknown as number
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});
		});

		it('ok', () => {
			expect(ejv({
				a: 'ejv'
			}, [{
				key: 'a',
				type: 'string',
				minLength: 2
			}])).to.be.null;

			expect(ejv({
				a: 'ejv'
			}, [{
				key: 'a',
				type: 'string',
				minLength: 3
			}])).to.be.null;
		});

		it('fail', () => {
			const data = {
				a: 'ejv'
			};

			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				minLength: 4
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.MIN_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.MIN_LENGTH, {
				placeholders: [4]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql('ejv');
		});
	});

	describe('maxLength', () => {
		describe('check parameter', () => {
			const data = {
				a: 'ejv'
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					maxLength: undefined
				}])).to.be.null;
			});

			it('null', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					maxLength: null as unknown as number
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('float number', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					maxLength: 1.5
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('string', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					maxLength: '1' as unknown as number
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});
		});

		it('fail', () => {
			const data = {
				a: 'ejv'
			};

			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				maxLength: 2
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.MAX_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.MAX_LENGTH, {
				placeholders: [2]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql(data.a);
		});

		it('ok', () => {
			expect(ejv({
				a: 'ejv'
			}, [{
				key: 'a',
				type: 'string',
				maxLength: 3
			}])).to.be.null;

			expect(ejv({
				a: 'ejv'
			}, [{
				key: 'a',
				type: 'string',
				maxLength: 4
			}])).to.be.null;
		});
	});

	describe('format', () => {
		describe('check parameter', () => {
			const data = {
				a: 'ejv@ejv.com'
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					format: undefined
				}])).to.be.null;
			});

			it('null', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					format: null as unknown as string
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
					placeholders: ['null']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			describe('invalid string format', () => {
				it('single format', () => {
					const errorScheme: Scheme = {
						key: 'a',
						type: 'string',
						format: 'invalidStringFormat'
					};

					const ejvError: EjvError | null = ejv(data, [errorScheme]);

					expect(ejvError).to.be.instanceOf(EjvError);
					expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
					expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
						placeholders: ['invalidStringFormat']
					}));
					expect(ejvError).to.have.property('data', data);
					expect(ejvError).to.not.have.property('path');
					expect(ejvError).to.have.property('errorScheme', errorScheme);
					expect(ejvError).to.not.have.property('errorData');
				});

				it('multiple format', () => {
					const errorScheme: Scheme = {
						key: 'a',
						type: 'string',
						format: ['invalidStringFormat']
					};

					const ejvError: EjvError | null = ejv(data, [errorScheme]);

					expect(ejvError).to.be.instanceOf(EjvError);
					expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
					expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
						placeholders: ['invalidStringFormat']
					}));
					expect(ejvError).to.have.property('data', data);
					expect(ejvError).to.not.have.property('path');
					expect(ejvError).to.have.property('errorScheme', errorScheme);
					expect(ejvError).to.not.have.property('errorData');
				});
			});
		});

		describe('email', () => {
			it('single format', () => {
				const data = {
					a: 'ejv'
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					format: 'email'
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.FORMAT);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
					placeholders: ['email']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');

				expect(ejv({
					a: 'ejv@ejv.com'
				}, [{
					key: 'a',
					type: 'string',
					format: 'email'
				}])).to.be.null;
			});

			it('multiple format', () => {
				const formatArr: string[] = ['email', 'date'];

				const data = {
					a: 'ejv'
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
					placeholders: [JSON.stringify(formatArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');

				expect(ejv({
					a: 'ejv@ejv.com'
				}, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}])).to.be.null;
			});
		});


		describe('date', () => {
			it('single format', () => {
				const data = {
					a: 'ejv'
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					format: 'date'
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.FORMAT);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
					placeholders: ['date']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');

				expect(ejv({
					a: '2018-12-19'
				}, [{
					key: 'a',
					type: 'string',
					format: 'date'
				}])).to.be.null;
			});

			it('multiple format', () => {
				const formatArr: string[] = ['date'];

				const data = {
					a: 'ejv'
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
					placeholders: [JSON.stringify(formatArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');

				expect(ejv({
					a: '2018-12-19'
				}, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}])).to.be.null;
			});
		});

		describe('time', () => {
			it('single format', () => {
				const data = {
					a: 'ejv'
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					format: 'time'
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.FORMAT);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
					placeholders: ['time']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');

				expect(ejv({
					a: '00:27:35.123'
				}, [{
					key: 'a',
					type: 'string',
					format: 'time'
				}])).to.be.null;
			});

			it('multiple format', () => {
				const formatArr: string[] = ['time'];

				const data = {
					a: 'ejv'
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
					placeholders: [JSON.stringify(formatArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');

				expect(ejv({
					a: '00:27:35.123'
				}, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}])).to.be.null;
			});
		});

		describe('date-time', () => {
			it('single format', () => {
				const data = {
					a: 'ejv'
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					format: 'date-time'
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.FORMAT);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
					placeholders: ['date-time']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');

				expect(ejv({
					a: '2018-12-19T00:27:35.123Z'
				}, [{
					key: 'a',
					type: 'string',
					format: 'date-time'
				}])).to.be.null;

				expect(ejv({
					a: '2018-12-19T00:27:35+00:00'
				}, [{
					key: 'a',
					type: 'string',
					format: 'date-time'
				}])).to.be.null;

				expect(ejv({
					a: '20181219T002735Z'
				}, [{
					key: 'a',
					type: 'string',
					format: 'date-time'
				}])).to.be.null;
			});

			it('multiple format', () => {
				const formatArr: string[] = ['date-time'];

				const data = {
					a: 'ejv'
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
					placeholders: [JSON.stringify(formatArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');

				expect(ejv({
					a: '2018-12-19T00:27:35.123Z'
				}, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}])).to.be.null;

				expect(ejv({
					a: '2018-12-19T00:27:35+00:00'
				}, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}])).to.be.null;

				expect(ejv({
					a: '20181219T002735Z'
				}, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}])).to.be.null;
			});
		});
	});

	describe('pattern', () => {
		describe('check parameter', () => {
			const data = {
				a: 'ejv@ejv.com'
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					pattern: undefined
				}])).to.be.null;
			});

			it('null', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: null as unknown as string
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['null']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('number', () => {

				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: 1 as unknown as string
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['1']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('empty string', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: ''
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['//']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('empty array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: []
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['[]']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('null array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: [null as unknown as RegExp, /ab/]
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['[/null/, /ab/]']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('number array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: [1, 3] as unknown as string[]
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['[1, 3]']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('empty string array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: ['']
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['[//]']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('empty reg exp', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: new RegExp('')
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['//']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('null reg exp', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: new RegExp(null as unknown as string)
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['/null/']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});

			it('empty reg exp array', () => {
				const errorScheme: Scheme = {
					key: 'a',
					type: 'string',
					pattern: [new RegExp('')]
				};

				const ejvError: EjvError | null = ejv(data, [errorScheme]);

				expect(ejvError).to.be.instanceOf(EjvError);
				expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
				expect(ejvError).to.have.property('message', createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
					placeholders: ['[//]']
				}));
				expect(ejvError).to.have.property('data', data);
				expect(ejvError).to.not.have.property('path');
				expect(ejvError).to.have.property('errorScheme', errorScheme);
				expect(ejvError).to.not.have.property('errorData');
			});
		});

		it('by string', () => {
			const str: string = 'abc';
			const data = {
				a: str
			};

			expect(ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: 'ab+c'
			}])).to.be.null;


			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: 'ac'
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.PATTERN);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN, {
				placeholders: ['/ac/']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql(str);
		});

		it('by string[]', () => {
			const str: string = 'abc';
			const data = {
				a: str
			};

			expect(ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: ['ab+c']
			}])).to.be.null;

			expect(ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: ['ac', 'ab+c']
			}])).to.be.null;

			expect(ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: ['ab+c', 'ac']
			}])).to.be.null;


			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: ['abcc', 'ac']
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
				placeholders: ['[/abcc/, /ac/]']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql(str);
		});

		it('by RegExp', () => {
			const str: string = 'abc';
			const data = {
				a: str
			};

			expect(ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: /ab+c/
			}])).to.be.null;


			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: /ac/
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.PATTERN);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN, {
				placeholders: [/ac/.toString()]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql(str);
		});

		it('by RegExp[]', () => {
			const str: string = 'abc';
			const data = {
				a: str
			};

			expect(ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: [/ab+c/]
			}])).to.be.null;

			expect(ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: [/ac/, /ab+c/]
			}])).to.be.null;

			expect(ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: [/ab+c/, /ac/]
			}])).to.be.null;


			const error: EjvError | null = ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: [/abcc/, /ac/]
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
				placeholders: ['[/abcc/, /ac/]']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql(str);
		});

		describe('special case', () => {
			it('array of object has string', () => {
				const error: EjvError | null = ejv({
					a: [{
						b: 'ejv'
					}]
				}, [{
					key: 'a',
					type: 'array',
					items: [{
						type: 'object',
						properties: [{
							key: 'b',
							type: 'string',
							pattern: /ejv/
						}]
					}]
				}]);

				expect(error).to.be.null;
			});
		});
	});
});
