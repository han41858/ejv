import { describe, it } from 'mocha';
import { expect } from 'chai';

import { Scheme } from '../src/interfaces';
import { toEffectiveFlatScheme } from '../src/util';


describe('toEffectiveFlatScheme()', () => {
	describe('min', () => {
		describe('normal', () => {
			it('exclusiveMin === undefined', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', scheme.min);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('exclusiveMin === true', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0,
					exclusiveMin: true
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', scheme.min);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).to.have.property('exclusiveMin', true);
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('exclusiveMin === false', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0,
					exclusiveMin: false
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', scheme.min);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).to.have.property('exclusiveMin', false);
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});
		});

		describe('not - min', () => {
			it('exclusiveMin === undefined', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						min: 0
					}
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min');
				expect(flatScheme).to.have.property('max', 0);
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).to.have.property('exclusiveMax', true);
			});

			it('exclusiveMin === true', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						min: 0
					},
					exclusiveMin: true
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min');
				expect(flatScheme).to.have.property('max', 0);
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).to.have.property('exclusiveMax', true);
			});

			it('exclusiveMin === false', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						min: 0
					},
					exclusiveMin: false
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min');
				expect(flatScheme).to.have.property('max', 0);
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).to.have.property('exclusiveMax', true);
			});
		});

		describe('not - exclusiveMin', () => {
			it('exclusiveMin === true', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0,
					not: {
						exclusiveMin: true
					}
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', 0);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).to.have.property('exclusiveMin', false);
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('exclusiveMin === false', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0,
					not: {
						exclusiveMin: false
					}
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', 0);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).to.have.property('exclusiveMin', true);
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});
		});

		describe('not - both', () => {
			it('exclusiveMin === true', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						min: 0,
						exclusiveMin: true
					}
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min');
				expect(flatScheme).to.have.property('max', 0);
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).to.have.property('exclusiveMax', false);
			});

			it('exclusiveMin === false', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						min: 0,
						exclusiveMin: false
					}
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min');
				expect(flatScheme).to.have.property('max', 0);
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).to.have.property('exclusiveMax', true);
			});
		});
	});
});
