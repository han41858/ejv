import { describe, it } from 'mocha';
import { expect } from 'chai';

import { clone, safeStringify } from '../src/util';


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

	describe('clone()', () => {
		it('deep copy', () => {
			const original = { a: 1, b: { c: [1, { d: 2 }] }, date: new Date(0) };
			const copied = clone(original);

			expect(copied).to.be.deep.equal(original);
			expect(copied).to.not.equal(original);
			expect(copied.b).to.not.equal(original.b);
			expect(copied.b.c).to.not.equal(original.b.c);
			expect(copied.date).to.not.equal(original.date);
		});

		it('sanitize', () => {
			expect(clone({ a: 1, b: undefined, c: null }, true)).to.be.deep.equal({ a: 1 });
			expect(clone({ a: 1, b: undefined, c: null })).to.be.deep.equal({ a: 1, b: undefined, c: null });
		});

		it('circular reference is kept', () => {
			const original: { a: number, self?: unknown, list?: unknown[] } = { a: 1 };
			original.self = original;
			original.list = [original];

			const copied = clone(original);

			expect(copied).to.not.equal(original);
			expect(copied.self).to.equal(copied);
			expect((copied.list as unknown[])[0]).to.equal(copied);
		});

		it('shared reference is kept', () => {
			const shared = { x: 1 };
			const copied = clone({ first: shared, second: shared });

			expect(copied.first).to.not.equal(shared);
			expect(copied.first).to.equal(copied.second);
		});

		it('prototype is kept', () => {
			class NumberSchemeClass {
				type: string = 'number';

				validate (value: unknown): string | null {
					return value === 1 ? null : 'should be 1';
				}
			}

			const copied = clone(new NumberSchemeClass());

			expect(copied).to.be.instanceof(NumberSchemeClass);
			expect(copied.validate(1)).to.be.null;
		});

		it('built-in objects are shared', () => {
			const buffer = new Uint8Array(2);
			const map = new Map();

			const copied = clone({ buffer, map });

			expect(copied.buffer).to.equal(buffer);
			expect(copied.map).to.equal(map);
		});
	});
});
