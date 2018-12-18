import { expect } from 'chai';

import { ejv } from '../src/ejv';
import { ErrorMsg, ErrorMsgCursorA } from '../src/constants';
import { EjvError } from '../src/interfaces';

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
				}, null)).to.throw(ErrorMsg.NO_ARRAY_SCHEME);
			});

			it('empty scheme array', () => {
				expect(() => ejv({
					a : 'hello'
				}, [])).to.throw(ErrorMsg.EMPTY_ROOT_SCHEME);
			});
		});
	});

	describe('number', () => {
		describe('type', () => {
			describe('mismatch', () => {
				typeTester.filter(obj => obj.type !== 'number')
					.forEach((obj) => {
						it(obj.type, () => {
							const result : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'number'
							}]);

							expect(result).to.be.instanceof(EjvError);

							expect(result.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'number')
							);
							expect(result.path).to.be.eql('a');
							expect(result.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = 123;
					const typeArr : string[] = ['boolean', 'string'];

					const result : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(result).to.be.instanceof(EjvError);

					expect(result.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, `[${typeArr.join(', ')}]`));
					expect(result.path).to.be.eql('a');
					expect(result.data).to.be.eql(value);
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
			it('fail', () => {
				const enumArr : number[] = [9, 11];

				const result : EjvError = ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					enum : enumArr
				}]);

				expect(result).to.be.instanceof(EjvError);
				expect(result.keyword).to.be.eql(ErrorMsg.ONE_OF
					.replace(ErrorMsgCursorA, `[${enumArr.join(', ')}]`)
				);
				expect(result.path).to.be.eql('a');
				expect(result.data).to.be.eql(10);
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
			it('without exclusiveMin', () => {
				const result1 : EjvError = ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					min : 10
				}]);

				expect(result1).to.be.instanceof(EjvError);
				expect(result1.keyword).to.be.eql(
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
				const result1 : EjvError = ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : true
				}]);

				expect(result1).to.be.instanceof(EjvError);
				expect(result1.keyword).to.be.eql(
					ErrorMsg.GREATER_THAN
						.replace(ErrorMsgCursorA, '10')
				);

				const result2 : EjvError = ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : true
				}]);

				expect(result2).to.be.instanceof(EjvError);
				expect(result2.keyword).to.be.eql(
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
				const result1 : EjvError = ejv({
					a : 9
				}, [{
					key : 'a',
					type : 'number',
					min : 10,
					exclusiveMin : false
				}]);

				expect(result1).to.be.instanceof(EjvError);
				expect(result1.keyword).to.be.eql(
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
			it('without exclusiveMax', () => {
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

				const result1 : EjvError = ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					max : 10
				}]);

				expect(result1).to.be.instanceof(EjvError);
				expect(result1.keyword).to.be.eql(
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

				const result1 : EjvError = ejv({
					a : 10
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : true
				}]);

				expect(result1).to.be.instanceof(EjvError);
				expect(result1.keyword).to.be.eql(
					ErrorMsg.SMALLER_THAN
						.replace(ErrorMsgCursorA, '10')
				);

				const result2 : EjvError = ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : true
				}]);

				expect(result2).to.be.instanceof(EjvError);
				expect(result2.keyword).to.be.eql(
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

				const result1 : EjvError = ejv({
					a : 11
				}, [{
					key : 'a',
					type : 'number',
					max : 10,
					exclusiveMax : false
				}]);

				expect(result1).to.be.instanceof(EjvError);
				expect(result1.keyword).to.be.eql(
					ErrorMsg.SMALLER_THAN_OR_EQUAL
						.replace(ErrorMsgCursorA, '10')
				);
			});
		});

		describe('format', () => {
			describe('integer', () => {
				it('undefined', () => {
					expect(ejv({
						a : 123.5
					}, [{
						key : 'a',
						type : 'number'
					}])).to.be.null;
				});

				describe('single format', () => {
					it('fail', () => {
						const result : EjvError = ejv({
							a : 123.5
						}, [{
							key : 'a',
							type : 'number',
							format : 'integer'
						}]);

						expect(result).to.be.instanceof(EjvError);
						expect(result.keyword).to.be.eql(ErrorMsg.FORMAT
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
						const result : EjvError = ejv({
							a : 123.5
						}, [{
							key : 'a',
							type : 'number',
							format : ['integer']
						}]);

						expect(result).to.be.instanceof(EjvError);
						expect(result.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, '[integer]')
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
				it('undefined', () => {
					expect(ejv({
						a : 1.5
					}, [{
						key : 'a',
						type : 'number'
					}])).to.be.null;
				});

				describe('single format', () => {
					it('fail', () => {
						const result1 : EjvError = ejv({
							a : 1.5
						}, [{
							key : 'a',
							type : 'number',
							format : 'index'
						}]);

						expect(result1).to.be.instanceof(EjvError);
						expect(result1.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, 'index')
						);

						const result2 : EjvError = ejv({
							a : -1
						}, [{
							key : 'a',
							type : 'number',
							format : 'index'
						}]);

						expect(result2).to.be.instanceof(EjvError);
						expect(result2.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, 'index')
						);

						const result3 : EjvError = ejv({
							a : -1.6
						}, [{
							key : 'a',
							type : 'number',
							format : 'index'
						}]);

						expect(result3).to.be.instanceof(EjvError);
						expect(result3.keyword).to.be.eql(ErrorMsg.FORMAT
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
						const result1 : EjvError = ejv({
							a : 1.5
						}, [{
							key : 'a',
							type : 'number',
							format : ['index']
						}]);

						expect(result1).to.be.instanceof(EjvError);
						expect(result1.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, '[index]')
						);

						const result2 : EjvError = ejv({
							a : -1
						}, [{
							key : 'a',
							type : 'number',
							format : ['index']
						}]);

						expect(result2).to.be.instanceof(EjvError);
						expect(result2.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, '[index]')
						);

						const result3 : EjvError = ejv({
							a : -1.6
						}, [{
							key : 'a',
							type : 'number',
							format : ['index']
						}]);

						expect(result3).to.be.instanceof(EjvError);
						expect(result3.keyword).to.be.eql(ErrorMsg.FORMAT
							.replace(ErrorMsgCursorA, '[index]')
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
							const result : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'string'
							}]);

							expect(result).to.be.instanceof(EjvError);

							expect(result.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'string')
							);
							expect(result.path).to.be.eql('a');
							expect(result.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = 'ejv';
					const typeArr : string[] = ['boolean', 'number'];

					const result : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(result).to.be.instanceof(EjvError);

					expect(result.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, `[${typeArr.join(', ')}]`));
					expect(result.path).to.be.eql('a');
					expect(result.data).to.be.eql(value);
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
			it('fail', () => {
				const enumArr : string[] = ['b', 'c'];

				const result : EjvError = ejv({
					a : 'a'
				}, [{
					key : 'a',
					type : 'string',
					enum : enumArr
				}]);

				expect(result).to.be.instanceof(EjvError);
				expect(result.keyword).to.be.eql(ErrorMsg.ONE_OF
					.replace(ErrorMsgCursorA, `[${enumArr.join(', ')}]`)
				);
				expect(result.path).to.be.eql('a');
				expect(result.data).to.be.eql('a');
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
			it('fail', () => {
				const result : EjvError = ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					minLength : 4
				}]);

				expect(result).to.be.instanceof(EjvError);
				expect(result.keyword).to.be.eql(ErrorMsg.MIN_LENGTH
					.replace(ErrorMsgCursorA, '4'));
				expect(result.path).to.be.eql('a');
				expect(result.data).to.be.eql('ejv');
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
			it('fail', () => {
				const result : EjvError = ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					maxLength : 2
				}]);

				expect(result).to.be.instanceof(EjvError);
				expect(result.keyword).to.be.eql(ErrorMsg.MAX_LENGTH
					.replace(ErrorMsgCursorA, '2'));
				expect(result.path).to.be.eql('a');
				expect(result.data).to.be.eql('ejv');
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

		describe('pattern', () => {
			it('email', () => {
				const result : EjvError = ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					format : 'email'
				}]);

				expect(result).to.be.instanceof(EjvError);

				expect(result.keyword).to.be.eql(ErrorMsg.FORMAT
					.replace(ErrorMsgCursorA, 'email')
				);
				expect(result.path).to.be.eql('a');
				expect(result.data).to.be.eql('ejv');

				expect(ejv({
					a : 'ejv@ejv.com'
				}, [{
					key : 'a',
					type : 'string',
					format : 'email'
				}])).to.be.null;
			});

			it('date', () => {
				const result : EjvError = ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					format : 'date'
				}]);

				expect(result).to.be.instanceof(EjvError);

				expect(result.keyword).to.be.eql(ErrorMsg.FORMAT
					.replace(ErrorMsgCursorA, 'date')
				);
				expect(result.path).to.be.eql('a');
				expect(result.data).to.be.eql('ejv');

				expect(ejv({
					a : '2018-12-19'
				}, [{
					key : 'a',
					type : 'string',
					format : 'date'
				}])).to.be.null;
			});

			it('time', () => {
				const result : EjvError = ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					format : 'time'
				}]);

				expect(result).to.be.instanceof(EjvError);

				expect(result.keyword).to.be.eql(ErrorMsg.FORMAT
					.replace(ErrorMsgCursorA, 'time')
				);
				expect(result.path).to.be.eql('a');
				expect(result.data).to.be.eql('ejv');

				expect(ejv({
					a : '00:27:35.123'
				}, [{
					key : 'a',
					type : 'string',
					format : 'time'
				}])).to.be.null;
			});

			it('date-time', () => {
				const result : EjvError = ejv({
					a : 'ejv'
				}, [{
					key : 'a',
					type : 'string',
					format : 'date-time'
				}]);

				expect(result).to.be.instanceof(EjvError);

				expect(result.keyword).to.be.eql(ErrorMsg.FORMAT
					.replace(ErrorMsgCursorA, 'date-time')
				);
				expect(result.path).to.be.eql('a');
				expect(result.data).to.be.eql('ejv');

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
							const result : EjvError = ejv({
								a : obj.value
							}, [{
								key : 'a',
								type : 'object'
							}]);

							expect(result).to.be.instanceof(EjvError);

							expect(result.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH
								.replace(ErrorMsgCursorA, 'object')
							);
							expect(result.path).to.be.eql('a');
							expect(result.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = {};
					const typeArr : string[] = ['boolean', 'number'];

					const result : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : typeArr
					}]);

					expect(result).to.be.instanceof(EjvError);

					expect(result.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH_ONE_OF
						.replace(ErrorMsgCursorA, `[${typeArr.join(', ')}]`));
					expect(result.path).to.be.eql('a');
					expect(result.data).to.be.eql(value);
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
	});
});
