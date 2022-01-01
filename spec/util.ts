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
					exclusiveMin: false // default value
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', scheme.min);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).not.to.have.property('exclusiveMin');
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
				expect(flatScheme).not.have.property('exclusiveMin');
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
				expect(flatScheme).not.to.have.property('exclusiveMax');
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

	describe('max', () => {
		describe('normal', () => {
			it('exclusiveMax === undefined', () => {
				const scheme: Scheme = {
					type: 'number',
					max: 0
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min');
				expect(flatScheme).to.have.property('max');
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('exclusiveMax === true', () => {
				const scheme: Scheme = {
					type: 'number',
					max: 0,
					exclusiveMax: true
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min', scheme.min);
				expect(flatScheme).to.have.property('max');
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).to.have.property('exclusiveMax', true);
			});

			it('exclusiveMax === false', () => {
				const scheme: Scheme = {
					type: 'number',
					max: 0,
					exclusiveMax: false // default value
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min', scheme.min);
				expect(flatScheme).to.have.property('max');
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});
		});

		describe('not - max', () => {
			it('exclusiveMax === undefined', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						max: 0
					}
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', 0);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).to.have.property('exclusiveMin', true);
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('exclusiveMax === true', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						max: 0
					},
					exclusiveMax: true
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', 0);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).to.have.property('exclusiveMin', true);
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('exclusiveMax === false', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						max: 0
					},
					exclusiveMax: false
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', 0);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).to.have.property('exclusiveMin', true);
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});
		});

		describe('not - exclusiveMax', () => {
			it('exclusiveMin === true', () => {
				const scheme: Scheme = {
					type: 'number',
					max: 0,
					not: {
						exclusiveMax: true
					}
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).not.to.have.property('min');
				expect(flatScheme).to.have.property('max', 0);
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('exclusiveMax === false', () => {
				const scheme: Scheme = {
					type: 'number',
					max: 0,
					not: {
						exclusiveMax: false
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

		describe('not - both', () => {
			it('exclusiveMax === true', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						max: 0,
						exclusiveMax: true
					}
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', 0);
				expect(flatScheme).not.to.have.property('max');
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('exclusiveMax === false', () => {
				const scheme: Scheme = {
					type: 'number',
					not: {
						max: 0,
						exclusiveMax: false
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
	});

	describe('min & max', () => {
		describe('normal', () => {
			it('min & max only', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0,
					max: 10
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', scheme.min);
				expect(flatScheme).to.have.property('max', scheme.max);
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('min & max + exclusiveMin', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0,
					exclusiveMin: true,
					max: 10
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', scheme.min);
				expect(flatScheme).to.have.property('max', scheme.max);
				expect(flatScheme).to.have.property('exclusiveMin', true);
				expect(flatScheme).not.to.have.property('exclusiveMax');
			});

			it('min & max + exclusiveMax', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0,
					max: 10,
					exclusiveMax: true
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', scheme.min);
				expect(flatScheme).to.have.property('max', scheme.max);
				expect(flatScheme).not.to.have.property('exclusiveMin');
				expect(flatScheme).to.have.property('exclusiveMax', true);
			});

			it('min & max + exclusiveMin & exclusiveMax', () => {
				const scheme: Scheme = {
					type: 'number',
					min: 0,
					exclusiveMin: true,
					max: 10,
					exclusiveMax: true
				};

				const flatScheme: Scheme = toEffectiveFlatScheme(scheme);

				expect(flatScheme).to.have.property('type', scheme.type);
				expect(flatScheme).to.have.property('min', scheme.min);
				expect(flatScheme).to.have.property('max', scheme.max);
				expect(flatScheme).to.have.property('exclusiveMin', true);
				expect(flatScheme).to.have.property('exclusiveMax', true);
			});
		});
	});
});
