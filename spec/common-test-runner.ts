// to test common type easily
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

export const typeTester: {
	type: string,
	value: unknown
}[] = [
	{ type: 'boolean', value: true },
	{ type: 'number', value: 123 },
	{ type: 'string', value: 'ejv' },
	{ type: 'object', value: {} },
	{ type: 'date', value: new Date },
	{ type: 'regexp', value: new RegExp('ejv') },
	{ type: 'array', value: [1, 2, 3] }
];
