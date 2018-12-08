import { expect } from 'chai';

import { EjvError } from '../src/interfaces';

import { definedTester } from '../src/tester';


describe('testers', function () {
	describe('definedTester()', () => {
		it('null', () => {
			expect(definedTester(null)).to.be.null;
		});

		it('undefined', () => {
			expect(definedTester(undefined)).to.be.instanceof(EjvError);
		});

		it('boolean - true', () => {
			expect(definedTester(true)).to.be.null;
		});

		it('boolean - false', () => {
			expect(definedTester(false)).to.be.null;
		});
	});
});