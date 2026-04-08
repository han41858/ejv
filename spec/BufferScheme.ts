import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError } from '../src/interfaces';
import { ERROR_MESSAGE, ERROR_TYPE } from '../src/constants';
import { createErrorMsg } from '../src/util';
import { checkSchemeError, TypeTester, TYPE_TESTER_ARR } from './common-test-util';

describe('BufferScheme', () => {
	describe('type', () => {
		describe('mismatch', () => {
			TYPE_TESTER_ARR
				.filter((obj: TypeTester): boolean => obj.type !== 'buffer')
				.forEach((obj: TypeTester): void => {
					it(obj.type, () => {
						const testObj = {
							a: obj.value
						};

						const error: EjvError | null = ejv(testObj, [{
							key: 'a',
							type: 'buffer'
						}]);

						expect(error).to.be.instanceof(EjvError);

						if (!error) {
							throw new Error('spec failed');
						}

						expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
						expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH, {
							placeholders: ['buffer']
						}));
						expect(error.path).to.be.eql('a');
						expect(error.data).to.be.eql(testObj);
						expect(error.errorData).to.be.eql(obj.value);
					});
				});

			it('multiple types', () => {
				const value = 'ejv';
				const typeArr: string[] = ['boolean', 'buffer'];

				const testObj = {
					a: value
				};

				const error: EjvError | null = ejv(testObj, [{
					key: 'a',
					type: typeArr
				}]);

				expect(error).to.be.instanceof(EjvError);

				if (!error) {
					throw new Error('spec failed');
				}

				expect(error.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH_ONE_OF);
				expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.TYPE_MISMATCH_ONE_OF, {
					placeholders: [JSON.stringify(typeArr)]
				}));
				expect(error.path).to.be.eql('a');
				expect(error.data).to.be.eql(testObj);
				expect(error.errorData).to.be.eql(value);
			});
		});

		describe('match', () => {
			it('optional', () => {
				expect(ejv({
					a: undefined
				}, [{
					key: 'a',
					type: 'buffer',
					optional: true
				}])).to.be.null;
			});

			it('single type', () => {
				expect(ejv({
					a: new Uint8Array(4)
				}, [{
					key: 'a',
					type: 'buffer'
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: new Uint8Array(4)
				}, [{
					key: 'a',
					type: ['buffer', 'number']
				}])).to.be.null;
			});

			it('multiple types', () => {
				expect(ejv({
					a: new Uint8Array(4)
				}, [{
					key: 'a',
					type: ['number', 'buffer']
				}])).to.be.null;
			});
		});
	});

	describe('byteLength', () => {
		describe('check parameter', () => {
			const data = {
				a: new Uint8Array(3)
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'buffer',
					byteLength: undefined
				}])).to.be.null;
			});

			it('null', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						// @ts-expect-error: null
						byteLength: null
					},

					message: createErrorMsg(ERROR_MESSAGE.BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});

			it('float number', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						byteLength: 1.5
					},

					message: createErrorMsg(ERROR_MESSAGE.BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});

			it('string', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						// @ts-expect-error: type mismatch
						byteLength: '1'
					},

					message: createErrorMsg(ERROR_MESSAGE.BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});
		});

		it('fail', () => {
			const value = new Uint8Array(3);
			const testData = {
				a: value
			};

			const error: EjvError | null = ejv(testData, [{
				key: 'a',
				type: 'buffer',
				byteLength: 2
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ERROR_TYPE.BYTE_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.BYTE_LENGTH, {
				placeholders: [2]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(testData);
		});

		it('ok', () => {
			expect(ejv({
				a: new Uint8Array(3)
			}, [{
				key: 'a',
				type: 'buffer',
				byteLength: 3
			}])).to.be.null;
		});
	});

	describe('minByteLength', () => {
		describe('check parameter', () => {
			const data = {
				a: new Uint8Array(4)
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'buffer',
					minByteLength: undefined
				}])).to.be.null;
			});

			it('null', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						// @ts-expect-error: null
						minByteLength: null
					},

					message: createErrorMsg(ERROR_MESSAGE.MIN_BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});

			it('float number', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						minByteLength: 1.5
					},

					message: createErrorMsg(ERROR_MESSAGE.MIN_BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});

			it('string', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						// @ts-expect-error: type mismatch
						minByteLength: '1'
					},

					message: createErrorMsg(ERROR_MESSAGE.MIN_BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});
		});

		it('fail', () => {
			const value = new Uint8Array(3);
			const testData = {
				a: value
			};

			const error: EjvError | null = ejv(testData, [{
				key: 'a',
				type: 'buffer',
				minByteLength: 4
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ERROR_TYPE.MIN_BYTE_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.MIN_BYTE_LENGTH, {
				placeholders: [4]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(testData);
		});

		it('ok', () => {
			expect(ejv({
				a: new Uint8Array(3)
			}, [{
				key: 'a',
				type: 'buffer',
				minByteLength: 2
			}])).to.be.null;

			expect(ejv({
				a: new Uint8Array(3)
			}, [{
				key: 'a',
				type: 'buffer',
				minByteLength: 3
			}])).to.be.null;
		});
	});

	describe('maxByteLength', () => {
		describe('check parameter', () => {
			const data = {
				a: new Uint8Array(3)
			};

			it('undefined is ok', () => {
				expect(ejv(data, [{
					key: 'a',
					type: 'buffer',
					maxByteLength: undefined
				}])).to.be.null;
			});

			it('null', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						// @ts-expect-error: null
						maxByteLength: null
					},

					message: createErrorMsg(ERROR_MESSAGE.MAX_BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});

			it('float number', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						maxByteLength: 1.5
					},

					message: createErrorMsg(ERROR_MESSAGE.MAX_BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});

			it('string', () => {
				checkSchemeError({
					data: data,
					errorScheme: {
						key: 'a',
						type: 'buffer',
						// @ts-expect-error: type mismatch
						maxByteLength: '1'
					},

					message: createErrorMsg(ERROR_MESSAGE.MAX_BYTE_LENGTH_SHOULD_BE_INTEGER)
				});
			});
		});

		it('fail', () => {
			const value = new Uint8Array(3);
			const testData = {
				a: value
			};

			const error: EjvError | null = ejv(testData, [{
				key: 'a',
				type: 'buffer',
				maxByteLength: 2
			}]);

			expect(error).to.be.instanceof(EjvError);

			if (!error) {
				throw new Error('spec failed');
			}

			expect(error.type).to.be.eql(ERROR_TYPE.MAX_BYTE_LENGTH);
			expect(error.message).to.be.eql(createErrorMsg(ERROR_MESSAGE.MAX_BYTE_LENGTH, {
				placeholders: [2]
			}));
			expect(error.path).to.be.eql('a');
			expect(error.data).to.be.deep.equal(testData);
		});

		it('ok', () => {
			expect(ejv({
				a: new Uint8Array(3)
			}, [{
				key: 'a',
				type: 'buffer',
				maxByteLength: 3
			}])).to.be.null;

			expect(ejv({
				a: new Uint8Array(3)
			}, [{
				key: 'a',
				type: 'buffer',
				maxByteLength: 4
			}])).to.be.null;
		});
	});
});
