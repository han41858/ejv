import { expect } from 'chai';

import { ejv } from '../src/ejv';
import { DataType, ErrorMsg, ErrorMsgCursorA } from '../src/constants';
import { EjvError, Scheme } from '../src/interfaces';

const typeTester : {
	type : string,
	value : any
}[] = [
	{ type : 'null', value : null },
	{ type : 'boolean', value : true },
	{ type : 'number', value : 123 },
	{ type : 'string', value : 'ejv' },
	{ type : 'object', value : {} },
	{ type : 'date', value : new Date },
	{ type : 'regexp', value : new RegExp('ejv') },
	{ type : 'array', value : [1, 2, 3] }
];

describe('ejv()', () => {
	describe('ejv() itself', () => {
		describe('data', () => {
			it('no data', () => {
				expect(ejv).to.throw(Error, ErrorMsg.NO_DATA);
			});

			it('null data', () => {
				expect(() => ejv(null)).to.throw(Error, ErrorMsg.NO_JSON_DATA);
			});
		});

		describe('scheme', () => {
			it('no scheme', () => {
				expect(() => ejv({
					a : 'hello'
				})).to.throw(ErrorMsg.NO_SCHEME);
			});

			it('null scheme', () => {
				expect(() => ejv({
					a : 'hello'
				}, null)).to.throw(ErrorMsg.NO_SCHEME);
			});

			it('empty scheme array', () => {
				expect(() => ejv({
					a : 'hello'
				}, [])).to.throw(ErrorMsg.EMPTY_SCHEME);
			});

			it('invalid scheme object', () => {
				expect(() => ejv({
					a : 'hello'
				}, ['string'])).to.throw(ErrorMsg.NO_OBJECT_ARRAY_SCHEME);
			});

			it('no type', () => {
				expect(() => ejv({
					a : 'hello'
				}, [{
					key : 'a'
				}])).to.throw(ErrorMsg.SCHEMES_SHOULD_HAVE_TYPE);
			});

			it('invalid type', () => {
				expect(() => ejv({
					a : 'hello'
				}, [{
					key : 'a',
					type : 'invalidType'
				}])).to.throw(ErrorMsg.SCHEMES_HAS_INVALID_TYPE.replace(ErrorMsgCursorA, 'invalidType'));

				expect(() => ejv({
					a : 'hello'
				}, [{
					key : 'a',
					type : ['string', 'invalidType']
				}])).to.throw(ErrorMsg.SCHEMES_HAS_INVALID_TYPE.replace(ErrorMsgCursorA, 'invalidType'));
			});

			it('duplicated type', () => {
				expect(() => ejv({
					a : 'hello'
				}, [{
					key : 'a',
					type : ['string', 'string']
				}])).to.throw(ErrorMsg.SCHEMES_HAS_DUPLICATED_TYPE);
			});
		});
	});

	describe('number', () => {
		describe('type', () => {
			describe('mismatch', () => {
				typeTester.filter(obj => obj.type !== 'number')
					.forEach((obj) => {
						it(obj.type, () => {
							const error : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'number'
							}]);

							expect(error).to.be.instanceof(EjvError);

							expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'number')
							);
							expect(error.path).to.be.eql('a');
							expect(error.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = 123;
					const typeArr : string[] = ['boolean', 'string'];

					const error : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(typeArr)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql(value);
				});
			});

			describe('match', () => {
				it('optional', () => {
					expect(ejv({
						a : undefined
					}, [{
						key : 'a',
						type : 'number',
						optional : true
					}])).to.be.null;
				});

				it('single type', () => {
					expect(ejv({
						a : 123
					}, [{
						key : 'a',
						type : 'number'
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : 123
					}, [{
						key : 'a',
						type : ['number', 'string']
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : 123
					}, [{
						key : 'a',
						type : ['string', 'number']
					}])).to.be.null;
				});
			});
		});

		describe('enum', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 1
					}, [{
						key : 'a',
						type : 'number',
						enum : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 1
					}, [{
						key : 'a',
						type : 'number',
						enum : null
					}])).to.be.throw(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
				});

				it('not array', () => {
					expect(() => ejv({
						a : 10
					}, [{
						key : 'a',
						type : 'number',
						enum : 1
					}])).to.throw(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
				});

				it('not number', () => {
					expect(() => ejv({
						a : 10
					}, [{
						key : 'a',
						type : 'number',
						enum : ['10']
					}])).to.throw(ErrorMsg.ENUM_SHOULD_BE_NUMBERS);
				});
			});

			it('fail', () => {
				const enumArr : number[] = [9, 11];

				const error : EjvError = ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					enum : enumArr
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.ONE_OF
					.replace(ErrorMsgCursorA, JSON.stringify(enumArr))
				);
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql(10);
			});

			it('ok', () => {
				expect(ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					enum : [9, 10, 11]
				}])).to.be.null;
			});
		});

		describe('min & exclusiveMin', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 1
					}, [{
						key : 'a',
						type : 'number',
						min : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 3
					}, [{
						key : 'a',
						type : 'number',
						min : null
					}])).to.throw(ErrorMsg.MIN_SHOULD_BE_NUMBER);
				});

				it('min type', () => {
					expect(() => ejv({
						a : 3
					}, [{
						key : 'a',
						type : 'number',
						min : '3'
					}])).to.throw(ErrorMsg.MIN_SHOULD_BE_NUMBER);
				});

				it('exclusiveMin type', () => {
					expect(() => ejv({
						a : 3
					}, [{
						key : 'a',
						type : 'number',
						min : 3,
						exclusiveMin : '3'
					}])).to.throw(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
				});
			});

			it('without exclusiveMin', () => {
				expect(ejv({
					a : 1
				}, [{
					key : 'a',
					type : 'number',
					min : 1,
					exclusiveMin : undefined
				}])).to.be.null;

				const error1 : EjvError = ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					min : 10
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.keyword).to.be.eql(
					ErrorMsg.GREATER_THAN_OR_EQUAL
						.replace(ErrorMsgCursorA, '10')
				);

				expect(ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					min : 10
				}])).to.be.null;

				expect(ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					min : 10
				}])).to.be.null;
			});

			it('exclusiveMin === true', () => {
				const error1 : EjvError = ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : true
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.keyword).to.be.eql(
					ErrorMsg.GREATER_THAN
						.replace(ErrorMsgCursorA, '10')
				);

				const error2 : EjvError = ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : true
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.keyword).to.be.eql(
					ErrorMsg.GREATER_THAN
						.replace(ErrorMsgCursorA, '10')
				);

				expect(ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : true
				}])).to.be.null;
			});

			it('exclusiveMin === false', () => {
				const error1 : EjvError = ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : false
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.keyword).to.be.eql(
					ErrorMsg.GREATER_THAN_OR_EQUAL
						.replace(ErrorMsgCursorA, '10')
				);

				expect(ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : false
				}])).to.be.null;

				expect(ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : false
				}])).to.be.null;
			});
		});

		describe('max & exclusiveMax', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 1
					}, [{
						key : 'a',
						type : 'number',
						max : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 3
					}, [{
						key : 'a',
						type : 'number',
						max : null
					}])).to.throw(ErrorMsg.MAX_SHOULD_BE_NUMBER);
				});

				it('max type', () => {
					expect(() => ejv({
						a : 3
					}, [{
						key : 'a',
						type : 'number',
						max : '3'
					}])).to.throw(ErrorMsg.MAX_SHOULD_BE_NUMBER);
				});

				it('exclusiveMax type', () => {
					expect(() => ejv({
						a : 3
					}, [{
						key : 'a',
						type : 'number',
						max : 3,
						exclusiveMax : '3'
					}])).to.throw(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
				});
			});

			it('without exclusiveMax', () => {
				expect(ejv({
					a : 1
				}, [{
					key : 'a',
					type : 'number',
					max : 1,
					exclusiveMax : undefined
				}])).to.be.null;

				expect(ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					max : 10
				}])).to.be.null;

				expect(ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					max : 10
				}])).to.be.null;

				const error1 : EjvError = ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					max : 10
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.keyword).to.be.eql(
					ErrorMsg.SMALLER_THAN_OR_EQUAL
						.replace(ErrorMsgCursorA, '10')
				);
			});

			it('exclusiveMax === true', () => {
				expect(ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : true
				}])).to.be.null;

				const error1 : EjvError = ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : true
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.keyword).to.be.eql(
					ErrorMsg.SMALLER_THAN
						.replace(ErrorMsgCursorA, '10')
				);

				const error2 : EjvError = ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : true
				}]);

				expect(error2).to.be.instanceof(EjvError);
				expect(error2.keyword).to.be.eql(
					ErrorMsg.SMALLER_THAN
						.replace(ErrorMsgCursorA, '10')
				);
			});

			it('exclusiveMax === false', () => {
				expect(ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : false
				}])).to.be.null;

				expect(ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : false
				}])).to.be.null;

				const error1 : EjvError = ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : false
				}]);

				expect(error1).to.be.instanceof(EjvError);
				expect(error1.keyword).to.be.eql(
					ErrorMsg.SMALLER_THAN_OR_EQUAL
						.replace(ErrorMsgCursorA, '10')
				);
			});
		});

		describe('format', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 123.5
					}, [{
						key : 'a',
						type : 'number',
						format : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 123.5
					}, [{
						key : 'a',
						type : 'number',
						format : null
					}])).to.be.throw(ErrorMsg.INVALID_NUMBER_FORMAT
						.replace(ErrorMsgCursorA, 'null'));
				});

				describe('invalid number format', () => {
					it('single', () => {
						expect(() => ejv({
							a : 1
						}, [{
							key : 'a',
							type : 'number',
							format : 'invalidNumberFormat'
						}])).to.throw(ErrorMsg.INVALID_NUMBER_FORMAT
							.replace(ErrorMsgCursorA, 'invalidNumberFormat'));
					});

					it('multiple', () => {
						expect(() => ejv({
							a : 1
						}, [{
							key : 'a',
							type : 'number',
							format : ['index', 'invalidNumberFormat']
						}])).to.throw(ErrorMsg.INVALID_NUMBER_FORMAT
							.replace(ErrorMsgCursorA, 'invalidNumberFormat'));
					});
				});
			});

			describe('integer', () => {
				describe('single format', () => {
					it('fail', () => {
						const error : EjvError = ejv({
							a : 123.5
						}, [{
							key : 'a',
							type : 'number',
							format : 'integer'
						}]);

						expect(error).to.be.instanceof(EjvError);
						expect(error.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, 'integer')
						);
					});

					it('ok', () => {
						expect(ejv({
							a : 123
						}, [{
							key : 'a',
							type : 'number',
							format : 'integer'
						}])).to.be.null;
					});
				});

				describe('multiple formats', () => {
					it('fail', () => {
						const formatArr : string[] = ['integer'];

						const error : EjvError = ejv({
							a : 123.5
						}, [{
							key : 'a',
							type : 'number',
							format : formatArr
						}]);

						expect(error).to.be.instanceof(EjvError);
						expect(error.keyword).to.be.eql(ErrorMsg.FORMAT_ONE_OF
							.replace(ErrorMsgCursorA, JSON.stringify(formatArr))
						);
					});

					it('ok', () => {
						expect(ejv({
							a : -7
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer']
						}])).to.be.null;

						expect(ejv({
							a : 0
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer']
						}])).to.be.null;

						expect(ejv({
							a : 123
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer']
						}])).to.be.null;
					});

					it('ok - with others', () => {
						expect(ejv({
							a : -7
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer', 'index']
						}])).to.be.null;

						expect(ejv({
							a : 0
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer', 'index']
						}])).to.be.null;

						expect(ejv({
							a : 123
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer', 'index']
						}])).to.be.null;
					});

					it('ok - with others', () => {
						expect(ejv({
							a : -7
						}, [{
							key : 'a',
							type : 'number',
							format : ['index', 'integer']
						}])).to.be.null;

						expect(ejv({
							a : 0
						}, [{
							key : 'a',
							type : 'number',
							format : ['index', 'integer']
						}])).to.be.null;

						expect(ejv({
							a : 123
						}, [{
							key : 'a',
							type : 'number',
							format : ['index', 'integer']
						}])).to.be.null;
					});
				});
			});

			describe('index', () => {
				describe('single format', () => {
					it('fail', () => {
						const error1 : EjvError = ejv({
							a : 1.5
						}, [{
							key : 'a',
							type : 'number',
							format : 'index'
						}]);

						expect(error1).to.be.instanceof(EjvError);
						expect(error1.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, 'index')
						);

						const error2 : EjvError = ejv({
							a : -1
						}, [{
							key : 'a',
							type : 'number',
							format : 'index'
						}]);

						expect(error2).to.be.instanceof(EjvError);
						expect(error2.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, 'index')
						);

						const error3 : EjvError = ejv({
							a : -1.6
						}, [{
							key : 'a',
							type : 'number',
							format : 'index'
						}]);

						expect(error3).to.be.instanceof(EjvError);
						expect(error3.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, 'index')
						);
					});

					it('ok', () => {
						expect(ejv({
							a : 0
						}, [{
							key : 'a',
							type : 'number',
							format : 'index'
						}])).to.be.null;

						expect(ejv({
							a : 6
						}, [{
							key : 'a',
							type : 'number',
							format : 'index'
						}])).to.be.null;
					});
				});

				describe('multiple formats', () => {
					it('fail', () => {
						const formatArr : string[] = ['index'];

						const error1 : EjvError = ejv({
							a : 1.5
						}, [{
							key : 'a',
							type : 'number',
							format : formatArr
						}]);

						expect(error1).to.be.instanceof(EjvError);
						expect(error1.keyword).to.be.eql(ErrorMsg.FORMAT_ONE_OF
							.replace(ErrorMsgCursorA, JSON.stringify(formatArr))
						);

						const error2 : EjvError = ejv({
							a : -1
						}, [{
							key : 'a',
							type : 'number',
							format : formatArr
						}]);

						expect(error2).to.be.instanceof(EjvError);
						expect(error2.keyword).to.be.eql(ErrorMsg.FORMAT_ONE_OF
							.replace(ErrorMsgCursorA, JSON.stringify(formatArr))
						);

						const error3 : EjvError = ejv({
							a : -1.6
						}, [{
							key : 'a',
							type : 'number',
							format : formatArr
						}]);

						expect(error3).to.be.instanceof(EjvError);
						expect(error3.keyword).to.be.eql(ErrorMsg.FORMAT_ONE_OF
							.replace(ErrorMsgCursorA, JSON.stringify(formatArr))
						);
					});

					it('ok', () => {
						expect(ejv({
							a : 0
						}, [{
							key : 'a',
							type : 'number',
							format : ['index']
						}])).to.be.null;

						expect(ejv({
							a : 6
						}, [{
							key : 'a',
							type : 'number',
							format : ['index']
						}])).to.be.null;
					});

					it('ok - with others', () => {
						expect(ejv({
							a : 0
						}, [{
							key : 'a',
							type : 'number',
							format : ['index', 'integer']
						}])).to.be.null;

						expect(ejv({
							a : 6
						}, [{
							key : 'a',
							type : 'number',
							format : ['index', 'integer']
						}])).to.be.null;
					});

					it('ok - with others', () => {
						expect(ejv({
							a : 0
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer', 'index']
						}])).to.be.null;

						expect(ejv({
							a : 6
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer', 'index']
						}])).to.be.null;
					});
				});
			});
		});
	});

	describe('string', () => {
		describe('type', () => {
			describe('mismatch', () => {
				typeTester.filter(obj => obj.type !== 'string')
					.forEach((obj) => {
						it(obj.type, () => {
							const error : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'string'
							}]);

							expect(error).to.be.instanceof(EjvError);

							expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'string')
							);
							expect(error.path).to.be.eql('a');
							expect(error.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = 'ejv';
					const typeArr : string[] = ['boolean', 'number'];

					const error : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(typeArr)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql(value);
				});
			});

			describe('match', () => {
				it('optional', () => {
					expect(ejv({
						a : undefined
					}, [{
						key : 'a',
						type : 'string',
						optional : true
					}])).to.be.null;
				});

				it('single type', () => {
					expect(ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string'
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : ['string', 'number']
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : ['number', 'string']
					}])).to.be.null;
				});
			});
		});

		describe('enum', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						enum : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						enum : null
					}])).to.be.throw(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
				});

				it('not array', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						enum : 'a'
					}])).to.throw(ErrorMsg.ENUM_SHOULD_BE_ARRAY);
				});

				it('not string', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						enum : [10]
					}])).to.throw(ErrorMsg.ENUM_SHOULD_BE_STRINGS);
				});
			});

			it('fail', () => {
				const enumArr : string[] = ['b', 'c'];

				const error : EjvError = ejv({
					a : 'a'
				}, [{
					key : 'a',
					type : 'string',
					enum : enumArr
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.ONE_OF
					.replace(ErrorMsgCursorA, JSON.stringify(enumArr))
				);
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql('a');
			});

			it('ok', () => {
				expect(ejv({
					a : 'a'
				}, [{
					key : 'a',
					type : 'string',
					enum : ['a', 'b', 'c']
				}])).to.be.null;
			});
		});

		describe('minLength', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						minLength : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						minLength : null
					}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
				});

				it('float number', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						minLength : 1.5
					}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
				});

				it('string', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						minLength : '1'
					}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
				});
			});

			it('fail', () => {
				const error : EjvError = ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					minLength : 4
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.MIN_LENGTH
					.replace(ErrorMsgCursorA, '4'));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql('ejv');
			});

			it('ok', () => {
				expect(ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					minLength : 2
				}])).to.be.null;

				expect(ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					minLength : 3
				}])).to.be.null;
			});
		});

		describe('maxLength', () => {
			it('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						maxLength : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						maxLength : null
					}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
				});

				it('float number', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						maxLength : 1.5
					}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
				});

				it('string', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						maxLength : '1'
					}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
				});
			});

			it('fail', () => {
				const error : EjvError = ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					maxLength : 2
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.MAX_LENGTH
					.replace(ErrorMsgCursorA, '2'));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql('ejv');
			});

			it('ok', () => {
				expect(ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					maxLength : 3
				}])).to.be.null;

				expect(ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					maxLength : 4
				}])).to.be.null;
			});
		});

		describe('format', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						format : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						format : null
					}])).to.be.throw(ErrorMsg.INVALID_STRING_FORMAT
						.replace(ErrorMsgCursorA, 'null'));
				});

				describe('invalid string format', () => {
					it('single format', () => {
						expect(() => ejv({
							a : 'a'
						}, [{
							key : 'a',
							type : 'string',
							format : 'invalidStringFormat'
						}])).to.throw(ErrorMsg.INVALID_STRING_FORMAT
							.replace(ErrorMsgCursorA, 'invalidStringFormat'));
					});

					it('multiple format', () => {
						expect(() => ejv({
							a : 'a'
						}, [{
							key : 'a',
							type : 'string',
							format : ['invalidStringFormat']
						}])).to.throw(ErrorMsg.INVALID_STRING_FORMAT
							.replace(ErrorMsgCursorA, 'invalidStringFormat'));
					});
				});
			});

			describe('email', () => {
				it('single format', () => {
					const error : EjvError = ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						format : 'email'
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.FORMAT
						.replace(ErrorMsgCursorA, 'email')
					);
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql('ejv');

					expect(ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						format : 'email'
					}])).to.be.null;
				});

				it('multiple format', () => {
					const formatArr : string[] = ['email', 'date'];

					const error : EjvError = ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.FORMAT_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(formatArr))
					);
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql('ejv');

					expect(ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}])).to.be.null;
				});
			});

			describe('date', () => {
				it('single format', () => {
					const error : EjvError = ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						format : 'date'
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.FORMAT
						.replace(ErrorMsgCursorA, 'date')
					);
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql('ejv');

					expect(ejv({
						a : '2018-12-19'
					}, [{
						key : 'a',
						type : 'string',
						format : 'date'
					}])).to.be.null;
				});

				it('multiple format', () => {
					const formatArr : string[] = ['date'];

					const error : EjvError = ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.FORMAT_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(formatArr))
					);
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql('ejv');

					expect(ejv({
						a : '2018-12-19'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}])).to.be.null;
				});
			});

			describe('time', () => {
				it('single format', () => {
					const error : EjvError = ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						format : 'time'
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.FORMAT
						.replace(ErrorMsgCursorA, 'time')
					);
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql('ejv');

					expect(ejv({
						a : '00:27:35.123'
					}, [{
						key : 'a',
						type : 'string',
						format : 'time'
					}])).to.be.null;
				});

				it('multiple format', () => {
					const formatArr : string[] = ['time'];

					const error : EjvError = ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.FORMAT_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(formatArr))
					);
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql('ejv');

					expect(ejv({
						a : '00:27:35.123'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}])).to.be.null;
				});
			});

			describe('date-time', () => {
				it('single format', () => {
					const error : EjvError = ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						format : 'date-time'
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.FORMAT
						.replace(ErrorMsgCursorA, 'date-time')
					);
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql('ejv');

					expect(ejv({
						a : '2018-12-19T00:27:35.123Z'
					}, [{
						key : 'a',
						type : 'string',
						format : 'date-time'
					}])).to.be.null;

					expect(ejv({
						a : '2018-12-19T00:27:35+00:00'
					}, [{
						key : 'a',
						type : 'string',
						format : 'date-time'
					}])).to.be.null;

					expect(ejv({
						a : '20181219T002735Z'
					}, [{
						key : 'a',
						type : 'string',
						format : 'date-time'
					}])).to.be.null;
				});

				it('multiple format', () => {
					const formatArr : string[] = ['date-time'];

					const error : EjvError = ejv({
						a : 'ejv'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.FORMAT_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(formatArr))
					);
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql('ejv');

					expect(ejv({
						a : '2018-12-19T00:27:35.123Z'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}])).to.be.null;

					expect(ejv({
						a : '2018-12-19T00:27:35+00:00'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}])).to.be.null;

					expect(ejv({
						a : '20181219T002735Z'
					}, [{
						key : 'a',
						type : 'string',
						format : formatArr
					}])).to.be.null;
				});
			});
		});

		describe('pattern', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : null
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, 'null'));
				});

				it('number', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : 1
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '1'));
				});

				it('empty string', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : ''
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '//'));
				});

				it('empty array', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : []
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '[]'));
				});

				it('null array', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : [null, /ab/]
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '[/null/, /ab/]'));
				});

				it('number array', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : [1, 3]
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '[1, 3]'));
				});

				it('empty string array', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : ['']
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '[//]'));
				});

				it('empty reg exp', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : new RegExp('')
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '//'));
				});

				it('null reg exp', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : new RegExp(null)
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '/null/'));
				});

				it('empty reg exp array', () => {
					expect(() => ejv({
						a : 'ejv@ejv.com'
					}, [{
						key : 'a',
						type : 'string',
						pattern : [new RegExp('')]
					}])).to.be.throw(ErrorMsg.INVALID_STRING_PATTERN
						.replace(ErrorMsgCursorA, '[//]'));
				});
			});

			it('by string', () => {
				expect(ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : 'ab+c'
				}])).to.be.null;

				const error : EjvError = ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : 'ac'
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.PATTERN
					.replace(ErrorMsgCursorA, '/ac/'));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql('abc');
			});

			it('by string[]', () => {
				expect(ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : ['ab+c']
				}])).to.be.null;

				expect(ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : ['ac', 'ab+c']
				}])).to.be.null;

				expect(ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : ['ab+c', 'ac']
				}])).to.be.null;

				const error : EjvError = ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : ['abcc', 'ac']
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.PATTERN_ONE_OF
					.replace(ErrorMsgCursorA, '[/abcc/, /ac/]'));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql('abc');
			});

			it('by RegExp', () => {
				expect(ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : /ab+c/
				}])).to.be.null;

				const error : EjvError = ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : /ac/
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.PATTERN
					.replace(ErrorMsgCursorA, /ac/.toString()));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql('abc');
			});

			it('by RegExp[]', () => {
				expect(ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : /ab+c/
				}])).to.be.null;

				expect(ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : [/ac/, /ab+c/]
				}])).to.be.null;

				expect(ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : [/ab+c/, /ac/]
				}])).to.be.null;

				const error : EjvError = ejv({
					a : 'abc'
				}, [{
					key : 'a',
					type : 'string',
					pattern : [/abcc/, /ac/]
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.PATTERN_ONE_OF
					.replace(ErrorMsgCursorA, '[/abcc/, /ac/]'));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql('abc');
			});
		});
	});

	describe('object', () => {
		describe('type', () => {
			describe('mismatch', () => {
				typeTester.filter(obj => {
						return !['null', 'date', 'regexp', 'array', 'object'].includes(obj.type);
					})
					.forEach((obj) => {
						it(obj.type, () => {
							const error : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'object'
							}]);

							expect(error).to.be.instanceof(EjvError);

							expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'object')
							);
							expect(error.path).to.be.eql('a');
							expect(error.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = {};
					const typeArr : string[] = ['boolean', 'number'];

					const error : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(typeArr)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql(value);
				});
			});

			describe('match', () => {
				it('optional', () => {
					expect(ejv({
						a : undefined
					}, [{
						key : 'a',
						type : 'object',
						optional : true
					}])).to.be.null;
				});

				typeTester.filter(obj => {
						return ['null', 'date', 'regexp', 'array', 'object'].includes(obj.type);
					})
					.forEach((obj) => {
						it(obj.type, () => {
							expect(ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'object'
							}])).to.be.null;
						});
					});

				it('single type', () => {
					expect(ejv({
						a : {
							b : 1
						}
					}, [{
						key : 'a',
						type : 'object'
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : {
							b : 1
						}
					}, [{
						key : 'a',
						type : ['object', 'number']
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : {
							b : 1
						}
					}, [{
						key : 'a',
						type : ['number', 'object']
					}])).to.be.null;
				});
			});
		});

		describe('properties', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : {
							b : 1
						}
					}, [{
						key : 'a',
						type : 'object',
						properties : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : {
							b : 1
						}
					}, [{
						key : 'a',
						type : 'object',
						properties : null
					}])).to.throw(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY);
				});

				it('not array', () => {
					expect(() => ejv({
						a : {
							b : 1
						}
					}, [{
						key : 'a',
						type : 'object',
						properties : 'b'
					}])).to.throw(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY);
				});

				it('empty array', () => {
					expect(() => ejv({
						a : {
							b : 1
						}
					}, [{
						key : 'a',
						type : 'object',
						properties : []
					}])).to.throw(ErrorMsg.PROPERTIES_SHOULD_HAVE_ITEMS);
				});

				it('not object array', () => {
					expect(() => ejv({
						a : {
							b : 1
						}
					}, [{
						key : 'a',
						type : 'object',
						properties : ['b']
					}])).to.throw(ErrorMsg.PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT);
				});
			});

			it('with single type', () => {
				const undefinedError : EjvError = ejv({
					a : {
						b : undefined
					}
				}, [{
					key : 'a',
					type : 'object',
					properties : [{
						key : 'b',
						type : 'string'
					}]
				}]);

				expect(undefinedError).to.be.instanceof(EjvError);

				expect(undefinedError.keyword).to.be.eql(ErrorMsg.REQUIRED);
				expect(undefinedError.path).to.be.eql('a/b');

				const error : EjvError = ejv({
					a : {
						b : 1
					}
				}, [{
					key : 'a',
					type : 'object',
					properties : [{
						key : 'b',
						type : 'string'
					}]
				}]);

				expect(error).to.be.instanceof(EjvError);

				expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
					.replace(ErrorMsgCursorA, 'string'));
				expect(error.path).to.be.eql('a/b');
				expect(error.data).to.be.eql(1);

				expect(ejv({
					a : {
						b : 1
					}
				}, [{
					key : 'a',
					type : 'object',
					properties : [{
						key : 'b',
						type : 'number'
					}]
				}])).to.be.null;
			});

			it('with multiple types', () => {
				const typeArr : string[] = ['string', 'boolean'];

				const undefinedError : EjvError = ejv({
					a : {
						b : undefined
					}
				}, [{
					key : 'a',
					type : 'object',
					properties : [{
						key : 'b',
						type : typeArr
					}]
				}]);

				expect(undefinedError).to.be.instanceof(EjvError);

				expect(undefinedError.keyword).to.be.eql(ErrorMsg.REQUIRED);
				expect(undefinedError.path).to.be.eql('a/b');

				const error : EjvError = ejv({
					a : {
						b : 1
					}
				}, [{
					key : 'a',
					type : 'object',
					properties : [{
						key : 'b',
						type : typeArr
					}]
				}]);

				expect(error).to.be.instanceof(EjvError);

				expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
					.replace(ErrorMsgCursorA, JSON.stringify(typeArr)));
				expect(error.path).to.be.eql('a/b');
				expect(error.data).to.be.eql(1);

				expect(ejv({
					a : {
						b : 1
					}
				}, [{
					key : 'a',
					type : 'object',
					properties : [{
						key : 'b',
						type : ['number', 'string']
					}]
				}])).to.be.null;

				expect(ejv({
					a : {
						b : 1
					}
				}, [{
					key : 'a',
					type : 'object',
					properties : [{
						key : 'b',
						type : ['string', 'number']
					}]
				}])).to.be.null;
			});
		});
	});

	describe('date', () => {
		describe('type', () => {
			describe('mismatch', () => {
				typeTester.filter(obj => obj.type !== 'date')
					.forEach((obj) => {
						it(obj.type, () => {
							const error : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'date'
							}]);

							expect(error).to.be.instanceof(EjvError);

							expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'date')
							);
							expect(error.path).to.be.eql('a');
							expect(error.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = 'ejv';
					const typeArr : string[] = ['boolean', 'date'];

					const error : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(typeArr)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql(value);
				});
			});

			describe('match', () => {
				it('optional', () => {
					expect(ejv({
						a : undefined
					}, [{
						key : 'a',
						type : 'date',
						optional : true
					}])).to.be.null;
				});

				it('single type', () => {
					expect(ejv({
						a : new Date
					}, [{
						key : 'a',
						type : 'date'
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : new Date
					}, [{
						key : 'a',
						type : ['date', 'number']
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : new Date
					}, [{
						key : 'a',
						type : ['number', 'date']
					}])).to.be.null;
				});
			});
		});

		describe('min & exclusiveMin', () => {
			describe('check parameter', () => {
				it('min === null', () => {
					expect(() => ejv({
						date : new Date
					}, [{
						key : 'date',
						type : 'date',
						min : null
					}])).to.throw(ErrorMsg.MIN_DATE_SHOULD_BE_DATE_OR_STRING);
				});

				it('exclusiveMin === null', () => {
					expect(() => ejv({
						date : new Date
					}, [{
						key : 'date',
						type : 'date',
						min : new Date,
						exclusiveMin : null
					}])).to.throw(ErrorMsg.EXCLUSIVE_MIN_SHOULD_BE_BOOLEAN);
				});
			});

			describe('by date', () => {
				it('without exclusiveMin', () => {
					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 29)
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30)
					}])).to.be.null;

					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 31)
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.AFTER_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					// with time
					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, -1)
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}])).to.be.null;

					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, 1)
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.AFTER_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);
				});

				it('exclusiveMin === false', () => {
					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 29),
						exclusiveMin : false
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30),
						exclusiveMin : false
					}])).to.be.null;

					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 31),
						exclusiveMin : false
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.AFTER_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					// with time
					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, -1),
						exclusiveMin : false
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, 0),
						exclusiveMin : false
					}])).to.be.null;

					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, 1),
						exclusiveMin : false
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.AFTER_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);
				});

				it('exclusiveMin === true', () => {
					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 29),
						exclusiveMin : true
					}])).to.be.null;

					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30),
						exclusiveMin : true
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.AFTER_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 31),
						exclusiveMin : true
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.AFTER_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);

					// with time
					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, -1),
						exclusiveMin : true
					}])).to.be.null;

					const error3 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, 0),
						exclusiveMin : true
					}]);

					expect(error3).to.be.instanceof(EjvError);
					expect(error3.keyword).to.include(ErrorMsg.AFTER_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error3.path).to.be.eql('date');
					expect(error3.data).to.be.instanceof(Date);

					const error4 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : new Date(2018, 11, 30,
							0, 0, 0, 1),
						exclusiveMin : true
					}]);

					expect(error4).to.be.instanceof(EjvError);
					expect(error4.keyword).to.include(ErrorMsg.AFTER_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error4.path).to.be.eql('date');
					expect(error4.data).to.be.instanceof(Date);
				});
			});

			describe('by date string', () => {
				it('without exclusiveMin', () => {
					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29'
					}])).to.be.null;

					// skip for different timezone
					// expect(ejv({
					// 	date : new Date(2018, 11, 30)
					// }, [{
					// 	key : 'date',
					// 	type : 'date',
					// 	min : '2018-12-30'
					// }])).to.be.null;

					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-31'
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.AFTER_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					// with time
					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29T14:59:59.999Z'
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29T15:00:00.000Z'
					}])).to.be.null;

					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29T15:00:00.001Z'
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.AFTER_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);
				});

				it('exclusiveMin === false', () => {
					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29',
						exclusiveMin : false
					}])).to.be.null;

					// skip for different timezone
					// expect(ejv({
					// 	date : new Date(2018, 11, 30)
					// }, [{
					// 	key : 'date',
					// 	type : 'date',
					// 	min : '2018-12-30',
					// 	exclusiveMin : false
					// }])).to.be.null;

					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-31',
						exclusiveMin : false
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.AFTER_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					// with time
					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29T14:59:59.999Z',
						exclusiveMin : false
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29T15:00:00.000Z',
						exclusiveMin : false
					}])).to.be.null;

					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29T15:00:00.001Z',
						exclusiveMin : false
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.AFTER_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);
				});

				it('exclusiveMin === true', () => {
					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29',
						exclusiveMin : true
					}])).to.be.null;

					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-30',
						exclusiveMin : true
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.AFTER_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-31',
						exclusiveMin : true
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.AFTER_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);

					// with time
					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-29T14:59:59.999Z',
						exclusiveMin : true
					}])).to.be.null;

					const error3 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-30T15:00:00.000Z',
						exclusiveMin : true
					}]);

					expect(error3).to.be.instanceof(EjvError);
					expect(error3.keyword).to.include(ErrorMsg.AFTER_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error3.path).to.be.eql('date');
					expect(error3.data).to.be.instanceof(Date);

					const error4 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						min : '2018-12-30T15:00:00.001Z',
						exclusiveMin : true
					}]);

					expect(error4).to.be.instanceof(EjvError);
					expect(error4.keyword).to.include(ErrorMsg.AFTER_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error4.path).to.be.eql('date');
					expect(error4.data).to.be.instanceof(Date);
				});
			});
		});

		describe('max & exclusiveMax', () => {
			describe('check parameter', () => {
				it('max === null', () => {
					expect(() => ejv({
						date : new Date
					}, [{
						key : 'date',
						type : 'date',
						max : null
					}])).to.throw(ErrorMsg.MAX_DATE_SHOULD_BE_DATE_OR_STRING);
				});

				it('exclusiveMax === null', () => {
					expect(() => ejv({
						date : new Date
					}, [{
						key : 'date',
						type : 'date',
						max : new Date,
						exclusiveMax : null
					}])).to.throw(ErrorMsg.EXCLUSIVE_MAX_SHOULD_BE_BOOLEAN);
				});
			});

			describe('by date', () => {
				it('without exclusiveMax', () => {
					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 29)
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.BEFORE_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30)
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 31)
					}])).to.be.null;

					// with time
					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, -1)
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.BEFORE_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, 1)
					}])).to.be.null;
				});

				it('exclusiveMax === false', () => {
					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 29),
						exclusiveMax : false
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.BEFORE_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30),
						exclusiveMax : false
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 31),
						exclusiveMax : false
					}])).to.be.null;

					// with time
					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, -1),
						exclusiveMax : false
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.BEFORE_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, 0),
						exclusiveMax : false
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, 1),
						exclusiveMax : false
					}])).to.be.null;
				});

				it('exclusiveMax === true', () => {
					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 29),
						exclusiveMax : true
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.BEFORE_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30),
						exclusiveMax : true
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.BEFORE_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 31),
						exclusiveMax : true
					}])).to.be.null;

					// with time
					const error3 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, -1),
						exclusiveMax : true
					}]);

					expect(error3).to.be.instanceof(EjvError);
					expect(error3.keyword).to.include(ErrorMsg.BEFORE_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error3.path).to.be.eql('date');
					expect(error3.data).to.be.instanceof(Date);

					const error4 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, 0),
						exclusiveMax : true
					}]);

					expect(error4).to.be.instanceof(EjvError);
					expect(error4.keyword).to.include(ErrorMsg.BEFORE_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error4.path).to.be.eql('date');
					expect(error4.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : new Date(2018, 11, 30,
							0, 0, 0, 1),
						exclusiveMax : true
					}])).to.be.null;
				});
			});

			describe('by date string', () => {
				it('without exclusiveMax', () => {
					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29'
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.BEFORE_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-30'
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-31'
					}])).to.be.null;

					// with time
					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T14:59:59.999Z'
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.BEFORE_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T15:00:00.000Z'
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T15:00:00.001Z'
					}])).to.be.null;
				});

				it('exclusiveMax === false', () => {
					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-28T15:00:00.000Z',
						exclusiveMax : false
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.BEFORE_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T15:00:00.000Z',
						exclusiveMax : false
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-30T15:00:00.000Z',
						exclusiveMax : false
					}])).to.be.null;

					// with time
					const error2 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T14:59:59.999Z',
						exclusiveMax : false
					}]);

					expect(error2).to.be.instanceof(EjvError);
					expect(error2.keyword).to.include(ErrorMsg.BEFORE_OR_SAME_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error2.path).to.be.eql('date');
					expect(error2.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T15:00:00.000Z',
						exclusiveMax : false
					}])).to.be.null;

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T15:00:00.001Z',
						exclusiveMax : false
					}])).to.be.null;
				});

				it('exclusiveMax === true', () => {
					const error1 : EjvError = ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29',
						exclusiveMax : true
					}]);

					expect(error1).to.be.instanceof(EjvError);
					expect(error1.keyword).to.include(ErrorMsg.BEFORE_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error1.path).to.be.eql('date');
					expect(error1.data).to.be.instanceof(Date);

					// skip for different timezone
					// const error2 : EjvError = ejv({
					// 	date : new Date(2018, 11, 30)
					// }, [{
					// 	key : 'date',
					// 	type : 'date',
					// 	max : '2018-12-30',
					// 	exclusiveMax : true
					// }]);
					//
					// expect(error2).to.be.instanceof(EjvError);
					// expect(error2.keyword).to.include(ErrorMsg.BEFORE_DATE
					// 	.replace(ErrorMsgCursorA, ''));
					// expect(error2.path).to.be.eql('date');
					// expect(error2.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-31',
						exclusiveMax : true
					}])).to.be.null;

					// with time
					const error3 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T14:59:59.999Z',
						exclusiveMax : true
					}]);

					expect(error3).to.be.instanceof(EjvError);
					expect(error3.keyword).to.include(ErrorMsg.BEFORE_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error3.path).to.be.eql('date');
					expect(error3.data).to.be.instanceof(Date);

					const error4 : EjvError = ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T15:00:00.000Z',
						exclusiveMax : true
					}]);

					expect(error4).to.be.instanceof(EjvError);
					expect(error4.keyword).to.include(ErrorMsg.BEFORE_DATE
						.replace(ErrorMsgCursorA, ''));
					expect(error4.path).to.be.eql('date');
					expect(error4.data).to.be.instanceof(Date);

					expect(ejv({
						date : new Date(2018, 11, 30,
							0, 0, 0, 0)
					}, [{
						key : 'date',
						type : 'date',
						max : '2018-12-29T15:00:00.001Z',
						exclusiveMax : true
					}])).to.be.null;
				});
			});
		});
	});

	describe('regexp', () => {
		describe('type', () => {
			describe('mismatch', () => {
				typeTester.filter(obj => obj.type !== 'regexp')
					.forEach((obj) => {
						it(obj.type, () => {
							const error : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'regexp'
							}]);

							expect(error).to.be.instanceof(EjvError);

							expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'regexp')
							);
							expect(error.path).to.be.eql('a');
							expect(error.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = 'ejv';
					const typeArr : string[] = ['boolean', 'regexp'];

					const error : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(typeArr)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql(value);
				});
			});

			describe('match', () => {
				it('optional', () => {
					expect(ejv({
						a : undefined
					}, [{
						key : 'a',
						type : 'regexp',
						optional : true
					}])).to.be.null;
				});

				it('single type', () => {
					expect(ejv({
						a : /./
					}, [{
						key : 'a',
						type : 'regexp'
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : /./
					}, [{
						key : 'a',
						type : ['regexp', 'number']
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : /./
					}, [{
						key : 'a',
						type : ['number', 'regexp']
					}])).to.be.null;
				});
			});
		});
	});

	describe('array', () => {
		describe('type', () => {
			describe('mismatch', () => {
				typeTester.filter(obj => obj.type !== 'array')
					.forEach((obj) => {
						it(obj.type, () => {
							const error : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'array'
							}]);

							expect(error).to.be.instanceof(EjvError);

							expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'array')
							);
							expect(error.path).to.be.eql('a');
							expect(error.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = 'ejv';
					const typeArr : string[] = ['boolean', 'array'];

					const error : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, JSON.stringify(typeArr)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.eql(value);
				});
			});

			describe('match', () => {
				it('optional', () => {
					expect(ejv({
						a : undefined
					}, [{
						key : 'a',
						type : 'array',
						optional : true
					}])).to.be.null;
				});

				it('single type', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array'
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : ['array', 'number']
					}])).to.be.null;
				});

				it('multiple types', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : ['number', 'array']
					}])).to.be.null;
				});
			});
		});

		describe('minLength', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						minLength : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						minLength : null
					}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
				});

				it('float number', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						minLength : 1.5
					}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
				});

				it('string', () => {
					expect(() => ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						minLength : '1'
					}])).to.throw(ErrorMsg.MIN_LENGTH_SHOULD_BE_INTEGER);
				});
			});

			it('fail', () => {
				const error : EjvError = ejv({
					a : [1, 2, 3]
				}, [{
					key : 'a',
					type : 'array',
					minLength : 4
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.MIN_LENGTH
					.replace(ErrorMsgCursorA, '4'));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.ordered.members([1, 2, 3]);
			});

			it('ok', () => {
				expect(ejv({
					a : [1, 2, 3]
				}, [{
					key : 'a',
					type : 'array',
					minLength : 2
				}])).to.be.null;

				expect(ejv({
					a : [1, 2, 3]
				}, [{
					key : 'a',
					type : 'array',
					minLength : 3
				}])).to.be.null;
			});
		});

		describe('maxLength', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						maxLength : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						maxLength : null
					}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
				});

				it('float number', () => {
					expect(() => ejv({
						a : 'a'
					}, [{
						key : 'a',
						type : 'string',
						maxLength : 1.5
					}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
				});

				it('string', () => {
					expect(() => ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						maxLength : '1'
					}])).to.throw(ErrorMsg.MAX_LENGTH_SHOULD_BE_INTEGER);
				});
			});

			it('fail', () => {
				const error : EjvError = ejv({
					a : [1, 2, 3]
				}, [{
					key : 'a',
					type : 'array',
					maxLength : 2
				}]);

				expect(error).to.be.instanceof(EjvError);
				expect(error.keyword).to.be.eql(ErrorMsg.MAX_LENGTH
					.replace(ErrorMsgCursorA, '2'));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.ordered.members([1, 2, 3]);
			});

			it('ok', () => {
				expect(ejv({
					a : [1, 2, 3]
				}, [{
					key : 'a',
					type : 'array',
					maxLength : 3
				}])).to.be.null;

				expect(ejv({
					a : [1, 2, 3]
				}, [{
					key : 'a',
					type : 'array',
					maxLength : 4
				}])).to.be.null;
			});
		});

		describe('unique', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						unique : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						unique : null
					}])).to.throw(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN);
				});

				it('not boolean', () => {
					expect(() => ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						unique : 'hello'
					}])).to.throw(ErrorMsg.UNIQUE_SHOULD_BE_BOOLEAN);
				});
			});

			it('fail', () => {
				const error : EjvError = ejv({
					a : [1, 2, 2]
				}, [{
					key : 'a',
					type : 'array',
					unique : true
				}]);

				expect(error).to.be.instanceof(EjvError);

				expect(error.keyword).to.be.eql(ErrorMsg.UNIQUE_ITEMS);
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.ordered.members([1, 2, 2]);
			});

			it('ok', () => {
				expect(ejv({
					a : [1, 2, 3]
				}, [{
					key : 'a',
					type : 'array',
					unique : true
				}])).to.be.null;
			});
		});

		describe('items', () => {
			describe('check parameter', () => {
				it('undefined is ok', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : undefined
					}])).to.be.null;
				});

				it('null', () => {
					expect(() => ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : null
					}])).to.throw(ErrorMsg.INVALID_ITEMS_SCHEME
						.replace(ErrorMsgCursorA, 'null'));
				});
			});

			describe('single data type', () => {
				describe('check parameter', () => {
					it('invalid data type', () => {
						expect(() => ejv({
							a : [1, 2, 3]
						}, [{
							key : 'a',
							type : 'array',
							items : 'invalidDataType'
						}])).to.throw(); // error message by partial scheme
					});
				});

				it('fail', () => {
					const error : EjvError = ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : 'string'
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.ITEMS_TYPE
						.replace(ErrorMsgCursorA, 'string'));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.ordered.members([1, 2, 3]);
				});

				it('ok', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : 'number'
					}])).to.be.null;
				});
			});

			describe('multiple data type', () => {
				describe('check parameter', () => {
					it('invalid data type', () => {
						expect(() => ejv({
							a : [1, 2, 3]
						}, [{
							key : 'a',
							type : 'array',
							items : ['number', 'invalidDataType']
						}])).to.throw(); // error message by partial scheme
					});
				});

				it('fail', () => {
					const enumArr : string[] = ['boolean', 'string'];

					const error : EjvError = ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : enumArr
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.ITEMS_TYPE
						.replace(ErrorMsgCursorA, JSON.stringify(enumArr)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.ordered.members([1, 2, 3]);
				});

				it('ok', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : ['string', 'number']
					}])).to.be.null;

					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : ['number', 'string']
					}])).to.be.null;
				});
			});

			describe('single scheme', () => {
				describe('check parameter', () => {
					it('invalid data type', () => {
						const scheme : object = {
							type : 'invalidDataType'
						};

						expect(() => ejv({
							a : [1, 2, 3]
						}, [{
							key : 'a',
							type : 'array',
							items : scheme
						}])).to.throw(); // error message by partial scheme
					});
				});

				it('fail', () => {
					const itemScheme : Scheme = {
						type : 'number' as DataType,
						min : 2
					};

					const error : EjvError = ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : itemScheme
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.ITEMS_SCHEME
						.replace(ErrorMsgCursorA, JSON.stringify(itemScheme)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.ordered.members([1, 2, 3]);
				});

				it('ok', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : {
							type : 'number',
							min : 1,
							max : 3
						}
					}])).to.be.null;
				});
			});

			describe('multiple schemes', () => {
				describe('check parameter', () => {
					it('invalid data type', () => {
						const scheme : object = {
							type : 'invalidDataType'
						};

						expect(() => ejv({
							a : [1, 2, 3]
						}, [{
							key : 'a',
							type : 'array',
							items : [scheme]
						}])).to.throw(); // error message by partial scheme
					});
				});

				it('fail', () => {
					const itemSchemes : Scheme[] = [{
						type : 'number' as DataType,
						min : 2
					}];

					const error : EjvError = ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : itemSchemes
					}]);

					expect(error).to.be.instanceof(EjvError);

					expect(error.keyword).to.be.eql(ErrorMsg.ITEMS_SCHEMES
						.replace(ErrorMsgCursorA, JSON.stringify(itemSchemes)));
					expect(error.path).to.be.eql('a');
					expect(error.data).to.be.ordered.members([1, 2, 3]);
				});

				it('ok', () => {
					expect(ejv({
						a : [1, 2, 3]
					}, [{
						key : 'a',
						type : 'array',
						items : [{
							type : 'number',
							min : 1,
							max : 3
						}]
					}])).to.be.null;

					// multiple schemes
					expect(ejv({
						a : [1]
					}, [{
						key : 'a',
						type : 'array',
						items : [{
							type : 'number',
							min : 1
						}, {
							type : 'string'
						}]
					}])).to.be.null;
				});
			});
		});
	});
});
