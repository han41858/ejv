import { expect } from 'chai';

import { ejv } from '../src/ejv';
import { ErrorMsg } from '../src/constants';
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

							expect(result.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH);
							expect(result.path).to.be.eql('a');
							expect(result.data).to.be.eql(obj.value);
						});
					});

				it('multiple types', () => {
					const value = 123;

					const result : EjvError = ejv({
						a : value
					}, [{
						key : 'a',
						type : ['boolean', 'string']
					}]);

					expect(result).to.be.instanceof(EjvError);

					expect(result.keyword).to.be.eql(ErrorMsg.TYPE_MISMATCH);
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
	});
});