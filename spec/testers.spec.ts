import { expect } from 'chai';

import { testRunner } from './test-runner';

import { definedTester } from '../src/tester';


describe('testers', function () {
	describe('definedTester()', () => {
		it('common test', () => {
			expect(testRunner(
				definedTester,
				true,
				false,
				true,
				true,
				true,
				true,
				true
			)).to.be.true;
		});
	});
});