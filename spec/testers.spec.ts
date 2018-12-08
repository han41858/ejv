import { expect } from 'chai';

import { definedTester } from '../src/tester';


describe('testers', function () {
	// name of spec, value
	// result is in each describe()
	const commonTestTable : [string, any][] = [
		['null', null],
		['undefined', undefined],
		['boolean - true', true],
		['number - 8', 8],
		['string - \'hello\'', 'hello'],
		['array - [1, 2, 3]', [1, 2, 3]],
		['object', { a : 1 }]
	];

	describe('definedTester()', () => {
		const resultTable : boolean[] = commonTestTable.map(() => true);
		resultTable[1] = false; // undefined case

		commonTestTable.forEach((obj, i) => {
			it(obj[0], () => {
				expect(definedTester(obj[1])).to.be.eql(resultTable[i]);
			});
		});
	});
});