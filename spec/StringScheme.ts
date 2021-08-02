import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError } from '../src/interfaces';
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
		describe('normal', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						enum: undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						enum: null as unknown as string[]
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				});

				it('not array', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						enum: 'a' as unknown as string[]
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				});

				it('not string', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						enum: [10]
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_STRINGS));
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

		describe('not', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							enum: undefined
						}
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							enum: null as unknown as string[]
						}
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				});

				it('not array', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							enum: 'a' as unknown as string[]
						}
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_ARRAY));
				});

				it('not string', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							enum: [10]
						}
					}])).to.throw(createErrorMsg(ErrorMsg.ENUM_SHOULD_BE_STRINGS));
				});
			});

			it('ok', () => {
				const enumArr: string[] = ['b', 'c'];

				const data = {
					a: 'a'
				};

				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						enum: enumArr
					}
				}])).to.be.null;
			});

			it('fail', () => {
				const data = {
					a: 'a'
				};

				const enumArr: string[] = ['a', 'b', 'c'];


				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						enum: enumArr
					}
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.ONE_OF, {
					reverse: true,
					placeholders: [JSON.stringify(enumArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('a');
			});
		});
	});

	describe('length', () => {
		describe('normal', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						length: undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						length: null as unknown as number
					}])).to.throw(createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
				});

				it('length type', () => {
					expect(() => ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						length: '3' as unknown as number
					}])).to.throw(createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
				});

				it('length type', () => {
					expect(() => ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							length: 3.5
						}
					}])).to.throw(createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
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
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.LENGTH));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(str);
			});
		});

		describe('not', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							length: undefined
						}
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							length: null as unknown as number
						}
					}])).to.throw(createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
				});

				it('length type', () => {
					expect(() => ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							length: '3' as unknown as number
						}
					}])).to.throw(createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
				});

				it('length type', () => {
					expect(() => ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							length: 3.5
						}
					}])).to.throw(createErrorMsg(ErrorMsg.LENGTH_SHOULD_BE_INTEGER));
				});
			});

			it('ok', () => {
				expect(ejv({
					a: 'ejv'
				}, [{
					key: 'a',
					type: 'string',
					not: {
						length: 4
					}
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
					not: {
						length: 3
					}
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.LENGTH);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.LENGTH, {
					reverse: true
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(str);
			});
		});
	});

	describe('minLength', () => {
		describe('normal', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						minLength: undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						minLength: null as unknown as number
					}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
				});

				it('float number', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						minLength: 1.5
					}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
				});

				it('string', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						minLength: '1' as unknown as number
					}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
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
					placeholders: ['4']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql('ejv');
			});
		});

		describe('not', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							minLength: undefined
						}
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							minLength: null as unknown as number
						}
					}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
				});

				it('float number', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							minLength: 1.5
						}
					}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
				});

				it('string', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							minLength: '1' as unknown as number
						}
					}])).to.throw(createErrorMsg(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER));
				});
			});
		});
	});

	describe('maxLength', () => {
		describe('normal', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						maxLength: undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						maxLength: null as unknown as number
					}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
				});

				it('float number', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						maxLength: 1.5
					}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
				});

				it('string', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						maxLength: '1' as unknown as number
					}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
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
					placeholders: ['2']
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

		describe('not', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							maxLength: undefined
						}
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							maxLength: null as unknown as number
						}
					}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
				});

				it('float number', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							maxLength: 1.5
						}
					}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
				});

				it('string', () => {
					expect(() => ejv({
						a: 'a'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							maxLength: '1' as unknown as number
						}
					}])).to.throw(createErrorMsg(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER));
				});
			});

			it('ok', () => {
				expect(ejv({
					a: 'ejv'
				}, [{
					key: 'a',
					type: 'string',
					not: {
						maxLength: 2
					}
				}])).to.be.null;
			});

			it('fail', () => {
				const data = {
					a: 'ejv'
				};

				const error1: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						maxLength: 3
					}
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.MAX_LENGTH);
				expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.MAX_LENGTH, {
					reverse: true,
					placeholders: ['3']
				}));
				expect(error1.path).to.be.eql('a');
				expect(error1.data).to.be.deep.equal(data);
				expect(error1.errorData).to.be.eql(data.a);


				const error2: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						maxLength: 4
					}
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.type).to.be.eql(ErrorType.MAX_LENGTH);
				expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.MAX_LENGTH, {
					reverse: true,
					placeholders: ['4']
				}));
				expect(error2.path).to.be.eql('a');
				expect(error2.data).to.be.deep.equal(data);
				expect(error2.errorData).to.be.eql(data.a);
			});
		});
	});

	describe('format', () => {
		describe('check parameter', () => {
			describe('normal', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						format: undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						format: null as unknown as string
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
						placeholders: ['null']
					}));
				});

				describe('invalid string format', () => {
					it('single format', () => {
						expect(() => ejv({
							a: 'a'
						}, [{
							key: 'a',
							type: 'string',
							format: 'invalidStringFormat'
						}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
							placeholders: ['invalidStringFormat']
						}));
					});

					it('multiple format', () => {
						expect(() => ejv({
							a: 'a'
						}, [{
							key: 'a',
							type: 'string',
							format: ['invalidStringFormat']
						}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
							placeholders: ['invalidStringFormat']
						}));
					});
				});
			});

			describe('not', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							format: undefined
						}
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							format: null as unknown as string
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
						placeholders: ['null']
					}));
				});

				describe('invalid string format', () => {
					it('single format', () => {
						expect(() => ejv({
							a: 'a'
						}, [{
							key: 'a',
							type: 'string',
							not: {
								format: 'invalidStringFormat'
							}
						}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
							placeholders: ['invalidStringFormat']
						}));
					});

					it('multiple format', () => {
						expect(() => ejv({
							a: 'a'
						}, [{
							key: 'a',
							type: 'string',
							not: {
								format: ['invalidStringFormat']
							}
						}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_FORMAT, {
							placeholders: ['invalidStringFormat']
						}));
					});
				});
			});
		});

		describe('email', () => {
			describe('normal', () => {
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

			describe('not', () => {
				it('single format', () => {
					const str: string = 'ejv';
					const data = {
						a: str
					};

					expect(ejv(data, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'email'
						}
					}])).to.be.null;


					const email: string = 'ejv@ejv.com';
					const emailData = {
						a: email
					};

					const error: EjvError | null = ejv(emailData, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'email'
						}
					}]);

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ErrorType.FORMAT);
					expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
						reverse: true,
						placeholders: ['email']
					}));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.deep.equal(emailData);
					expect(error.errorData).to.be.eql(email);
				});

				it('multiple format', () => {
					const formatArr: string[] = ['email', 'date'];

					const str: string = 'ejv';
					const data = {
						a: str
					};

					expect(ejv(data, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}])).to.be.null;


					const email: string = 'ejv@ejv.com';
					const emailData = {
						a: email
					};

					const error: EjvError | null = ejv(emailData, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}]);

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
					expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
						reverse: true,
						placeholders: [JSON.stringify(formatArr)]
					}));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.deep.equal(emailData);
					expect(error.errorData).to.be.eql(email);
				});
			});
		});


		describe('date', () => {
			describe('normal', () => {
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

			describe('not', () => {
				it('single format', () => {
					const str: string = 'ejv';
					const data = {
						a: str
					};

					expect(ejv(data, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'date'
						}
					}])).to.be.null;


					const dateStr: string = '2018-12-19';
					const dateData = {
						a: dateStr
					};

					const error: EjvError | null = ejv(dateData, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'date'
						}
					}]);

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ErrorType.FORMAT);
					expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
						reverse: true,
						placeholders: ['date']
					}));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.deep.equal(dateData);
					expect(error.errorData).to.be.eql(dateStr);
				});

				it('multiple format', () => {
					const formatArr: string[] = ['date'];

					const data = {
						a: 'ejv'
					};

					expect(ejv(data, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}])).to.be.null;


					const dateStr: string = '2018-12-19';
					const dateData = {
						a: dateStr
					};

					const error: EjvError | null = ejv(dateData, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}]);

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
					expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
						reverse: true,
						placeholders: [JSON.stringify(formatArr)]
					}));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.deep.equal(dateData);
					expect(error.errorData).to.be.eql(dateStr);
				});
			});
		});

		describe('time', () => {
			describe('normal', () => {
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

			describe('not', () => {
				it('single format', () => {
					const data = {
						a: 'ejv'
					};

					expect(ejv(data, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'time'
						}
					}])).to.be.null;


					const timeStr: string = '00:27:35.123';
					const timeData = {
						a: timeStr
					};

					const error: EjvError | null = ejv(timeData, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'time'
						}
					}]);

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ErrorType.FORMAT);
					expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
						reverse: true,
						placeholders: ['time']
					}));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.deep.equal(timeData);
					expect(error.errorData).to.be.eql(timeStr);
				});

				it('multiple format', () => {
					const formatArr: string[] = ['time'];

					const data = {
						a: 'ejv'
					};

					expect(ejv(data, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}])).to.be.null;


					const timeStr: string = '00:27:35.123';
					const timeData = {
						a: '00:27:35.123'
					};
					const error: EjvError | null = ejv(timeData, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}]);

					expect(error).to.be.instanceof(EjvError);

					if (!error) {
						throw new Error('spec failed');
					}

					expect(error.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
					expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
						reverse: true,
						placeholders: [JSON.stringify(formatArr)]
					}));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.deep.equal(timeData);
					expect(error.errorData).to.be.eql(timeStr);
				});
			});
		});

		describe('date-time', () => {
			describe('normal', () => {
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

			describe('not', () => {
				it('single format', () => {
					const data = {
						a: 'ejv'
					};

					expect(ejv(data, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'date-time'
						}
					}])).to.be.null;


					const timeDateStr1: string = '2018-12-19T00:27:35.123Z';
					const timeDateData1 = {
						a: timeDateStr1
					};

					const error1: EjvError | null = ejv(timeDateData1, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'date-time'
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.FORMAT);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
						reverse: true,
						placeholders: ['date-time']
					}));
					expect(error1.path).to.be.eql('a');
					expect(error1.data).to.be.deep.equal(timeDateData1);
					expect(error1.errorData).to.be.eql(timeDateStr1);


					const timeDateStr2: string = '2018-12-19T00:27:35+00:00';
					const timeDateData2 = {
						a: timeDateStr2
					};

					const error2: EjvError | null = ejv(timeDateData2, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'date-time'
						}
					}]);

					expect(error2).to.be.instanceof(EjvError);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.FORMAT);
					expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
						reverse: true,
						placeholders: ['date-time']
					}));
					expect(error2.path).to.be.eql('a');
					expect(error2.data).to.be.deep.equal(timeDateData2);
					expect(error2.errorData).to.be.eql(timeDateStr2);


					const timeDateStr3: string = '20181219T002735Z';
					const timeDateData3 = {
						a: timeDateStr3
					};

					const error3: EjvError | null = ejv(timeDateData3, [{
						key: 'a',
						type: 'string',
						not: {
							format: 'date-time'
						}
					}]);

					expect(error3).to.be.instanceof(EjvError);

					if (!error3) {
						throw new Error('spec failed');
					}

					expect(error3.type).to.be.eql(ErrorType.FORMAT);
					expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT, {
						reverse: true,
						placeholders: ['date-time']
					}));
					expect(error3.path).to.be.eql('a');
					expect(error3.data).to.be.deep.equal(timeDateData3);
					expect(error3.errorData).to.be.eql(timeDateStr3);
				});

				it('multiple format', () => {
					const formatArr: string[] = ['date-time'];

					const data = {
						a: 'ejv'
					};

					expect(ejv(data, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}])).to.be.null;


					const dateTimeStr1: string = '2018-12-19T00:27:35.123Z';
					const dateTimeData1 = {
						a: dateTimeStr1
					};

					const error1: EjvError | null = ejv(dateTimeData1, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}]);

					expect(error1).to.be.instanceof(EjvError);

					if (!error1) {
						throw new Error('spec failed');
					}

					expect(error1.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
					expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
						reverse: true,
						placeholders: [JSON.stringify(formatArr)]
					}));
					expect(error1.path).to.be.eql('a');
					expect(error1.data).to.be.deep.equal(dateTimeData1);
					expect(error1.errorData).to.be.eql(dateTimeStr1);


					const dateTimeStr2: string = '2018-12-19T00:27:35+00:00';
					const dateTimeData2 = {
						a: dateTimeStr2
					};

					const error2: EjvError | null = ejv(dateTimeData2, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}]);

					if (!error2) {
						throw new Error('spec failed');
					}

					expect(error2.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
					expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
						reverse: true,
						placeholders: [JSON.stringify(formatArr)]
					}));
					expect(error2.path).to.be.eql('a');
					expect(error2.data).to.be.deep.equal(dateTimeData2);
					expect(error2.errorData).to.be.eql(dateTimeStr2);


					const dateTimeStr3: string = '20181219T002735Z';
					const dateTimeData3 = {
						a: dateTimeStr3
					};

					const error3: EjvError | null = ejv(dateTimeData3, [{
						key: 'a',
						type: 'string',
						not: {
							format: formatArr
						}
					}]);

					if (!error3) {
						throw new Error('spec failed');
					}

					expect(error3.type).to.be.eql(ErrorType.FORMAT_ONE_OF);
					expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.FORMAT_ONE_OF, {
						reverse: true,
						placeholders: [JSON.stringify(formatArr)]
					}));
					expect(error3.path).to.be.eql('a');
					expect(error3.data).to.be.deep.equal(dateTimeData3);
					expect(error3.errorData).to.be.eql(dateTimeStr3);
				});
			});
		});
	});

	describe('pattern', () => {
		describe('check parameter', () => {
			describe('normal', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: null as unknown as string
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['null']
					}));
				});

				it('number', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: 1 as unknown as string
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['1']
					}));
				});

				it('empty string', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: ''
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['//']
					}));
				});

				it('empty array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: []
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[]']
					}));
				});

				it('null array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: [null as unknown as RegExp, /ab/]
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[/null/, /ab/]']
					}));
				});

				it('number array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: [1, 3] as unknown as string[]
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[1, 3]']
					}));
				});

				it('empty string array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: ['']
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[//]']
					}));
				});

				it('empty reg exp', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: new RegExp('')
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['//']
					}));
				});

				it('null reg exp', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: new RegExp(null as unknown as string)
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['/null/']
					}));
				});

				it('empty reg exp array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						pattern: [new RegExp('')]
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[//]']
					}));
				});
			});

			describe('not', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: undefined
						}
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: null as unknown as string
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['null']
					}));
				});

				it('number', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: 1 as unknown as string
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['1']
					}));
				});

				it('empty string', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: ''
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['//']
					}));
				});

				it('empty array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: []
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[]']
					}));
				});

				it('null array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: [null as unknown as RegExp, /ab/]
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[/null/, /ab/]']
					}));
				});

				it('number array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: [1, 3] as unknown as string[]
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[1, 3]']
					}));
				});

				it('empty string array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: ['']
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[//]']
					}));
				});

				it('empty reg exp', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: new RegExp('')
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['//']
					}));
				});

				it('null reg exp', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: new RegExp(null as unknown as string)
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['/null/']
					}));
				});

				it('empty reg exp array', () => {
					expect(() => ejv({
						a: 'ejv@ejv.com'
					}, [{
						key: 'a',
						type: 'string',
						not: {
							pattern: [new RegExp('')]
						}
					}])).to.throw(createErrorMsg(ErrorMsg.INVALID_STRING_PATTERN, {
						placeholders: ['[//]']
					}));
				});
			});
		});

		describe('by string', () => {
			it('normal', () => {
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

			it('not', () => {
				const str: string = 'abc';
				const data = {
					a: str
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: 'ab+c'
					}
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.PATTERN);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN, {
					reverse: true,
					placeholders: ['/ac/']
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(str);


				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: 'ac'
					}
				}])).to.be.null;
			});
		});


		describe('by string[]', () => {
			it('normal', () => {
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

			it('not', () => {
				const str: string = 'abc';
				const data = {
					a: str
				};

				const error1: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: ['ab+c']
					}
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
				expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
					reverse: true,
					placeholders: ['[/abcc/, /ac/]']
				}));
				expect(error1.path).to.be.eql('a');
				expect(error1.data).to.be.deep.equal(data);
				expect(error1.errorData).to.be.eql(str);


				const error2: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: ['ac', 'ab+c']
					}
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
				expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
					reverse: true,
					placeholders: ['[/abcc/, /ac/]']
				}));
				expect(error2.path).to.be.eql('a');
				expect(error2.data).to.be.deep.equal(data);
				expect(error2.errorData).to.be.eql(str);


				const error3: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: ['ab+c', 'ac']
					}
				}]);

				expect(error3).to.be.instanceof(EjvError);

				if (!error3) {
					throw new Error('spec failed');
				}

				expect(error3.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
				expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
					reverse: true,
					placeholders: ['[/abcc/, /ac/]']
				}));
				expect(error3.path).to.be.eql('a');
				expect(error3.data).to.be.deep.equal(data);
				expect(error3.errorData).to.be.eql(str);


				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: ['abcc', 'ac']
					}
				}])).to.be.null;
			});
		});

		describe('by RegExp', () => {
			it('normal', () => {
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

			it('not', () => {
				const str: string = 'abc';
				const data = {
					a: str
				};

				const error: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: /ab+c/
					}
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ErrorType.PATTERN);
				expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN, {
					reverse: true,
					placeholders: [/ab+c/.toString()]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.deep.equal(data);
				expect(error.errorData).to.be.eql(str);


				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: /ac/
					}
				}])).to.be.null;
			});
		});

		describe('by RegExp[]', () => {
			it('normal', () => {
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

			it('not', () => {
				const str: string = 'abc';
				const data = {
					a: str
				};

				const error1: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: [/ab+c/]
					}
				}]);

				expect(error1).to.be.instanceof(EjvError);

				if (!error1) {
					throw new Error('spec failed');
				}

				expect(error1.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
				expect(error1.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
					reverse: true,
					placeholders: ['[/abcc/, /ac/]']
				}));
				expect(error1.path).to.be.eql('a');
				expect(error1.data).to.be.deep.equal(data);
				expect(error1.errorData).to.be.eql(str);


				const error2: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: [/ac/, /ab+c/]
					}
				}]);

				expect(error2).to.be.instanceof(EjvError);

				if (!error2) {
					throw new Error('spec failed');
				}

				expect(error2.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
				expect(error2.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
					reverse: true,
					placeholders: ['[/abcc/, /ac/]']
				}));
				expect(error2.path).to.be.eql('a');
				expect(error2.data).to.be.deep.equal(data);
				expect(error2.errorData).to.be.eql(str);


				const error3: EjvError | null = ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: [/ab+c/, /ac/]
					}
				}]);

				expect(error3).to.be.instanceof(EjvError);

				if (!error3) {
					throw new Error('spec failed');
				}

				expect(error3.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
				expect(error3.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
					reverse: true,
					placeholders: ['[/abcc/, /ac/]']
				}));
				expect(error3.path).to.be.eql('a');
				expect(error3.data).to.be.deep.equal(data);
				expect(error3.errorData).to.be.eql(str);


				expect(ejv(data, [{
					key: 'a',
					type: 'string',
					not: {
						pattern: [/abcc/, /ac/]
					}
				}])).to.be.null;
			});
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
