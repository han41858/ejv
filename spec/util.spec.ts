import { describe, it } from 'mocha';
import { expect } from 'chai';

import { safeStringify } from '../src/util';


describe('util', () => {
	describe('safeStringify()', () => {
		it('same with JSON.stringify() for JSON values', () => {
			const shared = { x: 1 };

			const values: unknown[] = [
				null, true, 0, -1.5, '', 'ejv', [], [1, 'a', null], {}, { a: 1, b: [1, 2] },
				{ first: shared, second: shared }, // shared reference, not circular
				[shared, shared],
				new Date(0),
				{ toJSON: (): string => 'custom' }
			];

			values.forEach((value: unknown): void => {
				expect(safeStringify(value)).to.be.eql(String(JSON.stringify(value)));
			});
		});

		it('undefined and function', () => {
			expect(safeStringify(undefined)).to.be.eql('undefined');
			expect(safeStringify((): void => undefined)).to.be.eql('undefined');
		});

		it('bigint', () => {
			expect(safeStringify(1n)).to.be.eql('1n');
			expect(safeStringify({ a: 1n })).to.be.eql('{"a":"1n"}');
		});

		it('circular reference', () => {
			const circular: { a: number, self?: unknown } = { a: 1 };
			circular.self = circular;

			expect(safeStringify(circular)).to.be.eql('{"a":1,"self":"[Circular]"}');

			const circularArray: unknown[] = [1];
			circularArray.push(circularArray);

			expect(safeStringify(circularArray)).to.be.eql('[1,"[Circular]"]');
		});

		it('never throws', () => {
			const throwing = {
				toJSON: (): never => {
					throw new Error('toJSON');
				}
			};

			expect(safeStringify(throwing)).to.be.eql('[unserializable]');
		});
	});
});
