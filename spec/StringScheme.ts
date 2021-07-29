import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError } from '../src/interfaces';
import { ErrorMsg, ErrorType } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { typeTester } from './common-test-runner';


describe('StringScheme', () => {
	describe('type', () => {
		describe('mismatch', () => {
			typeTester.filter(obj => obj.type !== 'string')
				.forEach((obj) => {
					const data = {
						a: obj.value
					};

					it(obj.type, () => {
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
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = 'ejv';
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
					enum: null
				}])).to.throw(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
			});

			it('not array', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					enum: 'a' as unknown as string[]
				}])).to.throw(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
			});

			it('not string', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					enum: [10]
				}])).to.throw(ErrorMsg.ENUM_SHOULD_BE_STRINGS);
			});
		});

		it('fail', () => {
			const enumArr: string[] = ['b', 'c'];

			const data = {
				a: 'a'
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				enum: enumArr
			}]);

			expect(error).to.be.instanceof(EjvError);
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

	describe('enumReverse', () => {
		describe('check parameter', () => {
			it('undefined is ok', () => {
				expect(ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					enumReverse: undefined
				}])).to.be.null;
			});

			it('null', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					enumReverse: null
				}])).to.throw(ErrorMsg.ENUM_REVERSE_SHOULD_BE_ARRAY);
			});

			it('not array', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					enumReverse: 'a' as unknown as string[]
				}])).to.throw(ErrorMsg.ENUM_REVERSE_SHOULD_BE_ARRAY);
			});

			it('not string', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					enumReverse: [10]
				}])).to.throw(ErrorMsg.ENUM_REVERSE_SHOULD_BE_STRINGS);
			});
		});

		it('fail', () => {
			const enumArr: string[] = ['a', 'c'];

			const data = {
				a: 'a'
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				enumReverse: enumArr
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.NOT_ONE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.NOT_ONE_OF, {
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
				enumReverse: ['b', 'c']
			}])).to.be.null;
		});
	});

	describe('minLength', () => {
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
					minLength: null
				}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
			});

			it('float number', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					minLength: 1.5
				}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
			});

			it('string', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					minLength: '1' as unknown as number
				}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
			});
		});

		it('fail', () => {
			const data = {
				a: 'ejv'
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				minLength: 4
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.MIN_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.MIN_LENGTH, {
				placeholders: ['4']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql('ejv');
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
	});

	describe('maxLength', () => {
		it('check parameter', () => {
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
					maxLength: null
				}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
			});

			it('float number', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					maxLength: 1.5
				}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
			});

			it('string', () => {
				expect(() => ejv({
					a: 'a'
				}, [{
					key: 'a',
					type: 'string',
					maxLength: '1' as unknown as number
				}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
			});
		});

		it('fail', () => {
			const data = {
				a: 'ejv'
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				maxLength: 2
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.MAX_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.MAX_LENGTH, {
				placeholders: ['2']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql('ejv');
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
					format: null
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

		describe('email', () => {
			it('single format', () => {
				const data = {
					a: 'ejv'
				};

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					format: 'email'
				}]);

				expect(error).to.be.instanceof(EjvError);
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

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}]);

				expect(error).to.be.instanceof(EjvError);
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

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					format: 'date'
				}]);

				expect(error).to.be.instanceof(EjvError);
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

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}]);

				expect(error).to.be.instanceof(EjvError);
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

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					format: 'time'
				}]);

				expect(error).to.be.instanceof(EjvError);
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

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}]);

				expect(error).to.be.instanceof(EjvError);
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

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					format: 'date-time'
				}]);

				expect(error).to.be.instanceof(EjvError);
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

				const error: EjvError = ejv(data, [{
					key: 'a',
					type: 'string',
					format: formatArr
				}]);

				expect(error).to.be.instanceof(EjvError);
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
					pattern: null
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
					pattern: [null, /ab/]
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
					pattern: new RegExp(null)
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

		it('by string', () => {
			expect(ejv({
				a: 'abc'
			}, [{
				key: 'a',
				type: 'string',
				pattern: 'ab+c'
			}])).to.be.null;

			const data = {
				a: 'abc'
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: 'ac'
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.PATTERN);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN, {
				placeholders: ['/ac/']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql('abc');
		});

		it('by string[]', () => {
			expect(ejv({
				a: 'abc'
			}, [{
				key: 'a',
				type: 'string',
				pattern: ['ab+c']
			}])).to.be.null;

			expect(ejv({
				a: 'abc'
			}, [{
				key: 'a',
				type: 'string',
				pattern: ['ac', 'ab+c']
			}])).to.be.null;

			expect(ejv({
				a: 'abc'
			}, [{
				key: 'a',
				type: 'string',
				pattern: ['ab+c', 'ac']
			}])).to.be.null;

			const data = {
				a: 'abc'
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: ['abcc', 'ac']
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
				placeholders: ['[/abcc/, /ac/]']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql('abc');
		});

		it('by RegExp', () => {
			expect(ejv({
				a: 'abc'
			}, [{
				key: 'a',
				type: 'string',
				pattern: /ab+c/
			}])).to.be.null;

			const data = {
				a: 'abc'
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: /ac/
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.PATTERN);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN, {
				placeholders: [/ac/.toString()]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql('abc');
		});

		it('by RegExp[]', () => {
			expect(ejv({
				a: 'abc'
			}, [{
				key: 'a',
				type: 'string',
				pattern: /ab+c/
			}])).to.be.null;

			expect(ejv({
				a: 'abc'
			}, [{
				key: 'a',
				type: 'string',
				pattern: [/ac/, /ab+c/]
			}])).to.be.null;

			expect(ejv({
				a: 'abc'
			}, [{
				key: 'a',
				type: 'string',
				pattern: [/ab+c/, /ac/]
			}])).to.be.null;

			const data = {
				a: 'abc'
			};

			const error: EjvError = ejv(data, [{
				key: 'a',
				type: 'string',
				pattern: [/abcc/, /ac/]
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error.type).to.be.eql(ErrorType.PATTERN_ONE_OF);
			expect(error.message).to.be.eql(createErrorMsg(ErrorMsg.PATTERN_ONE_OF, {
				placeholders: ['[/abcc/, /ac/]']
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(data);
			expect(error.errorData).to.be.eql('abc');
		});

		describe('special case', () => {
			it('array of object has string', () => {
				const error: EjvError = ejv({
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
