import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { EjvError, Scheme } from '../src/interfaces';
import { ERROR_MESSAGE, ERROR_TYPE } from '../src/constants';
import { indexTester, integerTester, uniqueItemsTester } from '../src/tester';


describe('regression', () => {
	describe('schemes are not mutated', () => {
		it('object scheme has no parent after validation', () => {
			const schemes: Scheme[] = [{
				key: 'o',
				type: 'object',
				properties: [{ key: 'x', type: 'number' }]
			}];

			expect(ejv({ o: { x: 1 } }, schemes)).to.be.null;

			expect(schemes[0]).to.not.have.property('parent');
			expect(() => JSON.stringify(schemes)).to.not.throw();
		});

		it('array scheme has no parent after validation', () => {
			const schemes: Scheme[] = [{
				key: 'arr',
				type: 'array',
				items: 'number'
			}];

			expect(ejv({ arr: [1, 2] }, schemes)).to.be.null;

			expect(schemes[0]).to.not.have.property('parent');
		});

		it('used object scheme can be reused as array items', () => {
			const addressScheme: Scheme = {
				key: 'address',
				type: 'object',
				properties: [{ key: 'city', type: 'string' }]
			};

			expect(ejv({ address: { city: 'Seoul' } }, [addressScheme])).to.be.null;

			expect(ejv({ list: [{ city: 'Busan' }] }, [{
				key: 'list',
				type: 'array',
				items: addressScheme
			}])).to.be.null;

			const error: EjvError | null = ejv({ list: [{ city: 1 }] }, [{
				key: 'list',
				type: 'array',
				items: addressScheme
			}]);

			expect(error).to.be.instanceof(EjvError);
			expect(error?.type).to.be.eql(ERROR_TYPE.TYPE_MISMATCH);
			expect(error?.path).to.be.eql('list/0/city');
		});

		it('same schemes give same results on repeated calls', () => {
			const schemes: Scheme[] = [{
				key: 'o',
				type: 'object',
				properties: [{ key: 'x', type: 'number', min: 0 }]
			}];

			for (let i = 0; i < 3; i++) {
				expect(ejv({ o: { x: 1 } }, schemes)).to.be.null;
				expect(ejv({ o: { x: -1 } }, schemes)?.type).to.be.eql(ERROR_TYPE.BIGGER_THAN_OR_EQUAL);
			}
		});
	});

	describe('date min/max which Date can not parse', () => {
		// ISO 8601 week date passes the format test, but new Date() returns Invalid Date
		it('min', () => {
			let error: EjvError | null = null;

			expect(() => {
				error = ejv({ a: new Date() }, [{ key: 'a', type: 'date', min: '2020-W01' }]);
			}).to.not.throw();

			expect(error).to.be.instanceof(EjvError);
			expect(error!.type).to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
			expect(error!.message).to.be.eql(ERROR_MESSAGE.MIN_DATE_SHOULD_BE_DATE_OR_STRING);
			expect(error!.isSchemeError).to.be.true;
		});

		it('max', () => {
			let error: EjvError | null = null;

			expect(() => {
				error = ejv({ a: new Date() }, [{ key: 'a', type: 'date', max: '2020-W01' }]);
			}).to.not.throw();

			expect(error).to.be.instanceof(EjvError);
			expect(error!.type).to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
			expect(error!.message).to.be.eql(ERROR_MESSAGE.MAX_DATE_SHOULD_BE_DATE_OR_STRING);
			expect(error!.isSchemeError).to.be.true;
		});
	});

	describe('integer', () => {
		it('Infinity is not an integer', () => {
			expect(integerTester(Infinity)).to.be.false;
			expect(integerTester(-Infinity)).to.be.false;
			expect(indexTester(Infinity)).to.be.false;

			expect(ejv({ a: Infinity }, [{ key: 'a', type: 'number', format: 'integer' }])?.type)
				.to.be.eql(ERROR_TYPE.FORMAT);
			expect(ejv({ a: Infinity }, [{ key: 'a', type: 'number', format: 'index' }])?.type)
				.to.be.eql(ERROR_TYPE.FORMAT);
		});

		it('Infinity is not a valid length', () => {
			expect(ejv({ a: 'abc' }, [{ key: 'a', type: 'string', maxLength: Infinity }])?.type)
				.to.be.eql(ERROR_TYPE.INVALID_SCHEMES);
		});
	});

	describe('unique items', () => {
		it('NaN', () => {
			expect(uniqueItemsTester([NaN])).to.be.true;
			expect(uniqueItemsTester([NaN, NaN])).to.be.false;
		});

		it('objects are compared by reference', () => {
			const obj = { a: 1 };

			expect(uniqueItemsTester([{ a: 1 }, { a: 1 }])).to.be.true;
			expect(uniqueItemsTester([obj, obj])).to.be.false;
		});

		it('large array', function () {
			this.timeout(1000);

			const arr: number[] = Array.from({ length: 100000 }, (_: unknown, i: number): number => i);

			expect(ejv({ a: arr }, [{ key: 'a', type: 'array', unique: true }])).to.be.null;
		});
	});
});
