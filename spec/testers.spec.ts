import { expect } from 'chai';

import { testRunner } from './test-runner';

import { booleanTester, definedTester, indexTester, integerTester, numberTester, stringTester } from '../src/tester';


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

	describe('booleanTester()', () => {
		it('common test', () => {
			expect(testRunner(
				booleanTester,
				false,
				false,
				true,
				false,
				false,
				false,
				false
			)).to.be.true;
		});

		it('additional test', () => {
			expect(booleanTester(true)).to.be.true;
			expect(booleanTester(false)).to.be.true;

			expect(booleanTester('true')).to.be.false;
			expect(booleanTester('false')).to.be.false;

			expect(booleanTester(1)).to.be.false;
			expect(booleanTester(0)).to.be.false;
		});
	});

	describe('numberTester()', () => {
		it('common test', () => {
			expect(testRunner(
				numberTester,
				false,
				false,
				false,
				true,
				false,
				false,
				false
			)).to.be.true;
		});

		it('additional test', () => {
			expect(numberTester(true)).to.be.false;
			expect(numberTester(null)).to.be.false;

			expect(numberTester(-10.6)).to.be.true;
			expect(numberTester(-1)).to.be.true;
			expect(numberTester(0)).to.be.true;
			expect(numberTester(5)).to.be.true;
			expect(numberTester(5.5)).to.be.true;

			expect(numberTester('8')).to.be.false;
			expect(numberTester('8.5')).to.be.false;
		});
	});

	describe('integerTester()', () => {
		it('common test', () => {
			expect(testRunner(
				integerTester,
				false,
				false,
				false,
				true,
				false,
				false,
				false
			)).to.be.true;
		});

		it('additional test', () => {
			expect(integerTester(-10.6)).to.be.false;
			expect(integerTester(-1)).to.be.true;
			expect(integerTester(0)).to.be.true;
			expect(integerTester(5)).to.be.true;
			expect(integerTester(5.5)).to.be.false;

			expect(integerTester('8')).to.be.false;
			expect(integerTester('8.5')).to.be.false;
		});
	});

	describe('indexTester()', () => {
		it('common test', () => {
			expect(testRunner(
				indexTester,
				false,
				false,
				false,
				true,
				false,
				false,
				false
			)).to.be.true;
		});

		it('additional test', () => {
			expect(indexTester(-10.6)).to.be.false;
			expect(indexTester(-1)).to.be.false;
			expect(indexTester(0)).to.be.true;
			expect(indexTester(5)).to.be.true;
			expect(indexTester(5.5)).to.be.false;

			expect(indexTester('8')).to.be.false;
			expect(indexTester('8.5')).to.be.false;
		});
	});

	describe('stringTester()', () => {
		it('common test', () => {
			expect(testRunner(
				stringTester,
				false,
				false,
				false,
				false,
				true,
				false,
				false
			)).to.be.true;
		});

		it('additional test', () => {
			expect(stringTester('')).to.be.true;
			expect(stringTester(' ')).to.be.true;
			expect(stringTester('hello')).to.be.true;
		});
	});
});