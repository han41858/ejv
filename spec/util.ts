import { describe, it } from 'mocha';
import { expect } from 'chai';

import { MinMaxScheme, Scheme } from '../src/interfaces';
import { toEffectiveFlatScheme } from '../src/util';


describe.only('toEffectiveFlatScheme()', () => {
	describe('number', () => {
		function check (result: Scheme[], _resultSet: Scheme): void {
			expect(result).to.be.instanceOf(Array);
			expect(result).to.be.lengthOf(1);

			const targetScheme: Scheme = result[0];
			expect(targetScheme).to.have.property('type', 'number');

			const resultSet: MinMaxScheme<number> = _resultSet as MinMaxScheme<number>;
			const checkKeys: (keyof MinMaxScheme<number>)[] = ['min', 'exclusiveMin', 'max', 'exclusiveMax'];

			checkKeys.forEach((key: keyof MinMaxScheme<number>): void => {
				if (resultSet[key] !== undefined) {
					expect(targetScheme).to.have.property(key, resultSet[key]);
				}
				else {
					expect(targetScheme).to.not.have.property(key);
				}
			});
		}

		describe('single object', () => {
			describe('normal', () => {
				describe('min', () => {
					it('exclusiveMin === undefined', () => {
						const scheme: Scheme = {
							type: 'number',
							min: 0
						};

						check(toEffectiveFlatScheme(scheme), {
							min: 0
						});
					});

					it('exclusiveMin === true', () => {
						const scheme: Scheme = {
							type: 'number',
							min: 0,
							exclusiveMin: true
						};

						check(toEffectiveFlatScheme(scheme), {
							min: 0,
							exclusiveMin: true
						});
					});

					it('exclusiveMin === false', () => {
						const scheme: Scheme = {
							type: 'number',
							min: 0,
							exclusiveMin: false // default value
						};

						check(toEffectiveFlatScheme(scheme), {
							min: 0
						});
					});
				});

				describe('max', () => {
					it('exclusiveMax === undefined', () => {
						const scheme: Scheme = {
							type: 'number',
							max: 0
						};

						check(toEffectiveFlatScheme(scheme), {
							max: 0
						});
					});

					it('exclusiveMax === true', () => {
						const scheme: Scheme = {
							type: 'number',
							max: 0,
							exclusiveMax: true
						};

						check(toEffectiveFlatScheme(scheme), {
							max: 0,
							exclusiveMax: true
						});
					});

					it('exclusiveMax === false', () => {
						const scheme: Scheme = {
							type: 'number',
							max: 0,
							exclusiveMax: false // default value
						};

						check(toEffectiveFlatScheme(scheme), {
							max: 0
						});
					});
				});

				describe('min & max', () => {
					it('min & max only', () => {
						const scheme: Scheme = {
							type: 'number',
							min: 0,
							max: 10
						};

						check(toEffectiveFlatScheme(scheme), {
							min: 0,
							max: 10
						});
					});

					it('min & max + exclusiveMin', () => {
						const scheme: Scheme = {
							type: 'number',
							min: 0,
							exclusiveMin: true,
							max: 10
						};

						check(toEffectiveFlatScheme(scheme), {
							min: 0,
							exclusiveMin: true,
							max: 10
						});
					});

					it('min & max + exclusiveMax', () => {
						const scheme: Scheme = {
							type: 'number',
							min: 0,
							max: 10,
							exclusiveMax: true
						};

						check(toEffectiveFlatScheme(scheme), {
							min: 0,
							max: 10,
							exclusiveMax: true
						});
					});

					it('min & max + exclusiveMin & exclusiveMax', () => {
						const scheme: Scheme = {
							type: 'number',
							min: 0,
							exclusiveMin: true,
							max: 10,
							exclusiveMax: true
						};

						check(toEffectiveFlatScheme(scheme), {
							min: 0,
							exclusiveMin: true,
							max: 10,
							exclusiveMax: true
						});
					});
				});
			});

			describe('with not', () => {
				describe('min', () => {
					describe('not - min', () => {
						it('exclusiveMin, exclusiveMax === undefined', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0
									// means,
									// max: 0
									// exclusiveMax: true
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0,
								exclusiveMax: true
							});
						});

						it('exclusiveMin === true', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0
								},
								exclusiveMin: true
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0,
								exclusiveMax: true
							});
						});

						it('exclusiveMin === false', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0
								},
								exclusiveMin: false
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0,
								exclusiveMax: true
							});
						});

						it('exclusiveMax === true', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0
								},
								exclusiveMax: true
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0,
								exclusiveMax: true
							});
						});

						it('exclusiveMax === false', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0
								},
								exclusiveMax: false
							};

							expect(() => toEffectiveFlatScheme(scheme)).to.throws();
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

							check(toEffectiveFlatScheme(scheme), {
								min: 0
							});
						});

						it('exclusiveMin === false', () => {
							const scheme: Scheme = {
								type: 'number',
								min: 0,
								not: {
									exclusiveMin: false
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 0,
								exclusiveMin: true
							});
						});
					});

					describe('not - min & exclusiveMin', () => {
						it('exclusiveMin === true', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0,
									exclusiveMin: true
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0
							});
						});

						it('exclusiveMin === false', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0,
									exclusiveMin: false
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0,
								exclusiveMax: true
							});
						});
					});
				});

				describe('max', () => {
					describe('not - max', () => {
						it('exclusiveMin, exclusiveMax === undefined', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 0
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 0,
								exclusiveMin: true
							});
						});

						it('exclusiveMin === true', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 0
								},
								exclusiveMin: true
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 0,
								exclusiveMin: true
							});
						});

						it('exclusiveMin === false', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 0
								},
								exclusiveMin: false
							};

							expect(() => toEffectiveFlatScheme(scheme)).to.throws();
						});

						it('exclusiveMax === true', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 0
								},
								exclusiveMax: true
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 0,
								exclusiveMin: true
							});
						});

						it('exclusiveMax === false', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 0
								},
								exclusiveMax: false
							};

							expect(() => toEffectiveFlatScheme(scheme)).to.throws();
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

							check(toEffectiveFlatScheme(scheme), {
								max: 0
							});
						});

						it('exclusiveMax === false', () => {
							const scheme: Scheme = {
								type: 'number',
								max: 0,
								not: {
									exclusiveMax: false
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0,
								exclusiveMax: true
							});
						});
					});

					describe('not - max & exclusiveMax', () => {
						it('exclusiveMax === true', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 0,
									exclusiveMax: true
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 0
							});
						});

						it('exclusiveMax === false', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 0,
									exclusiveMax: false
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 0,
								exclusiveMin: true
							});
						});
					});
				});

				describe('min & max', () => {
					describe('not - min', () => {
						it('min < max', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0 // effective max value
									// means,
									// max: 0
									// exclusiveMax: true
								},
								max: 10
								// exclusiveMax: false
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0,
								exclusiveMax: true
							});
						});

						it('min > max', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 10
									// means,
									// max: 10
									// exclusiveMax: true
								},
								max: 0 // effective max value
								// exclusiveMax: false
							};

							check(toEffectiveFlatScheme(scheme), {
								max: 0
							});
						});
					});

					describe('not - max', () => {
						it('min < max', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 10 // effective min value
									// means,
									// min : 10
									// exclusiveMin: true
								},
								min: 0
								// exclusiveMin: false
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 10,
								exclusiveMin: true
							});
						});

						it('min > max', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									max: 0
									// means,
									// min: 0
									// exclusiveMin: true
								},
								min: 10 // effective min value
								// exclusiveMin: false
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 10
							});
						});
					});

					describe('not - min & max', () => {
						it('ok', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									// 0 ~ 10
									min: 0,
									max: 10
								}
							};

							// result: ~0 or 10~
							const result: Scheme[] = toEffectiveFlatScheme(scheme);
							expect(result).to.be.instanceOf(Array);
							expect(result).to.be.lengthOf(2);

							const minTarget: Scheme | undefined = result.find((one: Scheme): boolean => {
								return 'min' in one
									&& one.min !== undefined;
							});

							if (!minTarget) {
								throw new Error('spec failed');
							}

							expect(minTarget).to.have.property('min', 10);
							expect(minTarget).to.have.property('exclusiveMin', true);

							const maxTarget: Scheme | undefined = result.find((one: Scheme): boolean => {
								return 'max' in one
									&& one.max !== undefined;
							});

							if (!maxTarget) {
								throw new Error('spec failed');
							}

							expect(maxTarget).to.have.property('max', 0);
							expect(maxTarget).to.have.property('exclusiveMax', true);
						});
					});

					describe('not - min & exclusiveMin & max', () => {
						it('ok', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0,
									exclusiveMin: true,
									max: 10
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 0,
								max: 10,
								exclusiveMax: true
							});
						});

						it('error', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0,
									exclusiveMin: true,
									max: 10
								},
								exclusiveMax: false
							};

							expect(() => toEffectiveFlatScheme(scheme)).to.throws();
						});
					});

					describe('not - min & max & exclusiveMax', () => {
						it('ok', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0,
									max: 10,
									exclusiveMax: true
								}
							};

							check(toEffectiveFlatScheme(scheme), {
								min: 0,
								max: 10
							});
						});

						it('error', () => {
							const scheme: Scheme = {
								type: 'number',
								not: {
									min: 0,
									exclusiveMin: true,
									max: 10
								},
								exclusiveMax: false
							};

							expect(() => toEffectiveFlatScheme(scheme)).to.throws();
						});
					});

					// describe('not - min & exclusiveMin & max & exclusiveMax', () => {
					// });
				});
			});
		});

		describe('with array', () => {
			describe('normal', () => {
				describe('min', () => {
					it('normal order', () => {
						const scheme: Scheme[] = [
							{ type: 'number', min: 0 },
							{ type: 'number', min: 1 },
							{ type: 'number', min: 2 } // effective min value
						];

						check(toEffectiveFlatScheme(scheme), {
							min: 2
						});
					});

					it('reverse order', () => {
						const scheme: Scheme[] = [
							{ type: 'number', min: 2 }, // effective min value
							{ type: 'number', min: 1 },
							{ type: 'number', min: 0 }
						];

						check(toEffectiveFlatScheme(scheme), {
							min: 2
						});
					});
				});

				describe('max', () => {
					it('normal order', () => {
						const scheme: Scheme[] = [
							{ type: 'number', max: 0 }, // effective max value
							{ type: 'number', max: 1 },
							{ type: 'number', max: 2 }
						];

						check(toEffectiveFlatScheme(scheme), {
							max: 0
						});
					});

					it('reverse order', () => {
						const scheme: Scheme[] = [
							{ type: 'number', max: 2 },
							{ type: 'number', max: 1 },
							{ type: 'number', max: 0 } // effective max value
						];

						check(toEffectiveFlatScheme(scheme), {
							max: 0
						});
					});
				});

				it('min & max', () => {
					const scheme: Scheme[] = [
						{ type: 'number', min: 0 },
						{ type: 'number', max: 1 }
					];

					check(toEffectiveFlatScheme(scheme), {
						min: 0,
						max: 1
					});
				});
			});

			// TODO: with not
		});
	});

	// TODO: date

	// TODO: with others : [string, number]
});
