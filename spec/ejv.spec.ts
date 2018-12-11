import { expect } from 'chai';

import { ejv } from '../src/ejv';
import { ErrorMsg, ErrorMsgCursor } from '../src/constants';

describe('ejv', () => {
	describe('error', () => {
		describe('data', () => {
			it('no data', () => {
				expect(ejv).to.throw(Error, ErrorMsg.NO_DATA);
			});

			it('null data', () => {
				expect(() => ejv(null)).to.throw(Error, ErrorMsg.NO_JSON_DATA);
			});
		});

		describe('scheme', () => {
			it('no scheme', () => {
				expect(() => ejv({
					a : 'hello'
				})).to.throw(ErrorMsg.NO_SCHEME);
			});

			it('null scheme', () => {
				expect(() => ejv({
					a : 'hello'
				}, null)).to.throw(ErrorMsg.NO_JSON_SCHEME);
			});

			it('no root properties', () => {
				expect(() => ejv({
					a : 'hello'
				}, {})).to.throw(ErrorMsg.NO_ROOT_PROPERTIES);
			});
		});
	});

	describe('operators', () => {
		describe('properties & type', () => {
			describe('error', () => {
				it('no scheme', () => {
					expect(() => ejv({
						a : 'hello'
					}, {
						properties : {
							a : undefined
						}
					})).to.throw(ErrorMsg.NO_SCHEME_FOR.replace(ErrorMsgCursor, 'a'));
				});

				it('null scheme', () => {
					expect(() => ejv({
						a : 'hello'
					}, {
						properties : {
							a : null
						}
					})).to.throw(ErrorMsg.NO_SCHEME_FOR.replace(ErrorMsgCursor, 'a'));
				});

				it('no type', () => {
					expect(() => ejv({
						a : 'hello'
					}, {
						properties : {
							a : {}
						}
					})).to.throw(ErrorMsg.NO_TYPE_FOR.replace(ErrorMsgCursor, 'a'));
				});

				it('invalid type enum', () => {
					expect(() => ejv({
						a : 'hello'
					}, {
						properties : {
							a : {
								type : 'invalid type'
							}
						}
					})).to.throw(ErrorMsg.INVALID_TYPE_FOR.replace(ErrorMsgCursor, 'a'));
				});
			});

			describe('normal', () => {
				describe('error', () => {
					it('no field', () => {
						const result = ejv({
							b : 'hello'
						}, {
							properties : {
								a : {
									type : 'string'
								}
							}
						});

						expect(result).to.be.ok;
						expect(result).to.have.property('keyword', ErrorMsg.REQUIRED);
						expect(result).to.have.property('path', 'a');
					});

					it('null', () => {
						const result = ejv({
							a : null
						}, {
							properties : {
								a : {
									type : 'string'
								}
							}
						});

						expect(result).to.be.ok;
						expect(result).to.have.property('keyword', ErrorMsg.DIFFERENT_TYPE);
						expect(result).to.have.property('path', 'a');
					});

					it('different type', () => {
						const result = ejv({
							a : 135
						}, {
							properties : {
								a : {
									type : 'string'
								}
							}
						});

						expect(result).to.be.ok;
						expect(result).to.have.property('keyword', ErrorMsg.DIFFERENT_TYPE);
						expect(result).to.have.property('path', 'a');
					});
				});

				it('ok', () => {
					expect(ejv({
						a : 'hello'
					}, {
						properties : {
							a : {
								type : 'string'
							}
						}
					})).to.be.null;
				});
			});

			describe('normal - multiple types', () => {
				it('no type', () => {
					expect(() => ejv({
						a : 'hello'
					}, {
						properties : {
							a : {}
						}
					})).to.throw(ErrorMsg.NO_TYPE_FOR.replace(ErrorMsgCursor, 'a'));
				});

				it('empty types', () => {
					expect(() => ejv({
						a : 'hello'
					}, {
						properties : {
							a : {
								type : []
							}
						}
					})).to.throw(ErrorMsg.NO_TYPE_FOR.replace(ErrorMsgCursor, 'a'));
				});

				it('invalid type enum', () => {
					expect(() => ejv({
						a : 'hello'
					}, {
						properties : {
							a : {
								type : ['string', 'invalid_type']
							}
						}
					})).to.throw(ErrorMsg.INVALID_TYPE_FOR.replace(ErrorMsgCursor, 'a'));
				});

				it('ok', () => {
					expect(ejv({
						a : 'hello'
					}, {
						properties : {
							a : {
								type : ['string']
							}
						}
					})).to.be.null;
				});

				it('ok - with others', () => {
					expect(ejv({
						a : 'hello'
					}, {
						properties : {
							a : {
								type : ['string', 'number']
							}
						}
					})).to.be.null;
				});

				it('ok - with others', () => {
					expect(ejv({
						a : 'hello'
					}, {
						properties : {
							a : {
								type : ['boolean', 'string', 'number']
							}
						}
					})).to.be.null;
				});
			});

			describe('short syntax - single type', () => {
				it('ok', () => {
					expect(ejv({
						a : 'hello'
					}, {
						properties : {
							a : 'string'
						}
					})).to.be.null;
				});
			});

			describe('short syntax - multiple types', () => {
				it('ok', () => {
					expect(ejv({
						a : 'hello'
					}, {
						properties : {
							a : ['string']
						}
					})).to.be.null;
				});

				it('ok - with others', () => {
					expect(ejv({
						a : 'hello'
					}, {
						properties : {
							a : ['string', 'number']
						}
					})).to.be.null;
				});

				it('ok - with others', () => {
					expect(ejv({
						a : 'hello'
					}, {
						properties : {
							a : ['number', 'string']
						}
					})).to.be.null;
				});
			});
		});
	});
});