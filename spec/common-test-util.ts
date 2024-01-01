// to test common type easily

import { expect } from 'chai';

import { EjvError, Scheme } from '../src/interfaces';
import { ejv } from '../src/ejv';
import { ErrorType } from '../src/constants';

export const commonTestRunner = (
	testFnc: (args: unknown) => unknown,
	nullResult: boolean,
	undefinedResult: boolean,
	booleanResult: boolean,
	numberResult: boolean,
	stringResult: boolean,
	arrayResult: boolean,
	objectResult: boolean
): boolean => {
	return testFnc(null) === nullResult
		&& testFnc(undefined) === undefinedResult
		&& testFnc(true) === booleanResult
		&& testFnc(8) === numberResult
		&& testFnc('hello') === stringResult
		&& testFnc([1, 2, 3]) === arrayResult
		&& testFnc({ a: 1 }) === objectResult;
};

export interface TypeTester {
	type: string;
	value: unknown;
}

export const typeTesterArr: TypeTester[] = [
	{ type: 'boolean', value: true },
	{ type: 'number', value: 123 },
	{ type: 'string', value: 'ejv' },
	{ type: 'object', value: {} },
	{ type: 'date', value: new Date },
	{ type: 'regexp', value: new RegExp('ejv') },
	{ type: 'array', value: [1, 2, 3] }
];


export const checkSchemeError = (param: {
	data: object,
	errorScheme: Scheme,
	message: string,
}): void => {
	const ejvError: EjvError | null = ejv(param.data, [param.errorScheme]);

	expect(ejvError).to.be.instanceOf(EjvError);
	expect(ejvError).to.have.property('type', ErrorType.INVALID_SCHEMES);
	expect(ejvError).to.have.property('message', param.message);

	expect(ejvError).to.have.property('data', param.data);
	expect(ejvError).to.have.property('path', undefined);

	expect(ejvError).to.have.property('errorScheme', param.errorScheme);
	expect(ejvError).to.have.property('errorData', undefined);

	expect(ejvError).to.have.property('isSchemeError', true);
	expect(ejvError).to.have.property('isDataError', false);
};
