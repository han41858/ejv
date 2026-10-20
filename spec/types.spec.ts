import { describe, it } from 'mocha';
import { expect } from 'chai';

import { ejv } from '../src/ejv';

import { Scheme } from '../src/interfaces';
import { DATA_TYPE, NUMBER_FORMAT, STRING_FORMAT } from '../src/constants';


// compile time checks of Scheme types. `yarn typecheck` fails if an expected error does not occur.
// the schemes are also validated at runtime to make sure the valid ones work.
describe('Scheme types', () => {
	it('valid schemes', () => {
		const schemes: Scheme[] = [
			{ key: 'bool', type: 'boolean' },
			{ key: 'num', type: 'number', min: 0, max: 10, exclusiveMax: true, enum: [1, 2], format: 'integer' },
			{ key: 'num2', type: DATA_TYPE.NUMBER, format: [NUMBER_FORMAT.INTEGER, 'index'] },
			{ key: 'str', type: 'string', minLength: 1, maxLength: 10, pattern: /^[a-z]+$/, enum: ['abc'] },
			{ key: 'str2', type: DATA_TYPE.STRING, format: [STRING_FORMAT.EMAIL, 'url'] },
			{ key: 'obj', type: 'object', allowUnknownProperty: false, properties: [{ key: 'a', type: 'number' }] },
			{ key: 'date', type: 'date', min: '2020-01-01', max: new Date('2030-01-01T00:00:00Z') },
			{ key: 're', type: 'regexp' },
			{ key: 'arr', type: 'array', minLength: 1, unique: true, items: 'number' },
			{ key: 'arr2', type: 'array', items: [{ type: 'number', min: 0 }, { type: 'string', minLength: 1 }] },
			{ key: 'buf', type: 'buffer', maxByteLength: 10 },

			// several types : rules of the types are allowed
			{ key: 'multi', type: ['number', 'string'], min: 0, minLength: 1 },

			// type inherited from the parent
			{ key: 'inherited', parent: { type: 'number', min: 0 }, max: 10 },

			// value of validate() has the type of the scheme
			{ key: 'custom', type: 'number', validate: (value: number): string | null => value.toFixed() === '1' ? null : 'not 1' }
		];

		expect(ejv({
			bool: true,
			num: 1,
			num2: 0,
			str: 'abc',
			str2: 'ejv@ejv.com',
			obj: { a: 1 },
			date: new Date('2025-01-01T00:00:00Z'),
			re: /ejv/,
			arr: [1, 2],
			arr2: [1, 'a'],
			buf: new Uint8Array(3),
			multi: 'a',
			inherited: 5,
			custom: 1
		}, schemes)).to.be.null;
	});

	it('rules of other types are compile errors', () => {
		const schemes: Scheme[] = [
			// @ts-expect-error string rule for number
			{ key: 'a', type: 'number', minLength: 3 },
			// @ts-expect-error number rule for string
			{ key: 'a', type: 'string', min: 3 },
			// @ts-expect-error array rule for string
			{ key: 'a', type: 'string', items: 'number' },
			// @ts-expect-error object rule for array
			{ key: 'a', type: 'array', properties: [] },
			// @ts-expect-error string rule for boolean
			{ key: 'a', type: 'boolean', pattern: 'abc' },
			// @ts-expect-error buffer rule for date
			{ key: 'a', type: 'date', byteLength: 1 }
		];

		expect(schemes).to.have.lengthOf(6);
	});

	it('invalid values are compile errors', () => {
		const schemes: Scheme[] = [
			// @ts-expect-error unknown type name
			{ key: 'a', type: 'nubmer' },
			// @ts-expect-error string enum for number
			{ key: 'a', type: 'number', enum: ['x'] },
			// @ts-expect-error string format for number
			{ key: 'a', type: 'number', format: 'email' },
			// @ts-expect-error unknown string format
			{ key: 'a', type: 'string', format: 'emial' },
			// @ts-expect-error number limit for date
			{ key: 'a', type: 'date', min: 1 },
			// @ts-expect-error unknown type name in array
			{ key: 'a', type: ['number', 'strng'] },
			// @ts-expect-error validate() of a string scheme receives a string
			{ key: 'a', type: 'string', validate: (value: number): string | null => value > 0 ? null : 'error' }
		];

		expect(schemes).to.have.lengthOf(7);
	});

	it('nested schemes are checked', () => {
		const schemes: Scheme[] = [{
			key: 'obj',
			type: 'object',
			properties: [
				// @ts-expect-error string rule for number in properties
				{ key: 'a', type: 'number', minLength: 1 }
			]
		}, {
			key: 'arr',
			type: 'array',
			// @ts-expect-error number rule for string in items
			items: { type: 'string', min: 1 }
		}];

		expect(schemes).to.have.lengthOf(2);
	});

	it('schemes declared without type annotation', () => {
		// type of the literal is widened to string
		const widened = [{ key: 'a', type: 'number' }];

		// @ts-expect-error should be declared as Scheme[]
		expect(ejv({ a: 1 }, widened)).to.be.null;

		const annotated: Scheme[] = [{ key: 'a', type: 'number' }];
		const satisfied = [{ key: 'a', type: 'number' }] satisfies Scheme[];

		expect(ejv({ a: 1 }, annotated)).to.be.null;
		expect(ejv({ a: 1 }, satisfied)).to.be.null;
	});
});
