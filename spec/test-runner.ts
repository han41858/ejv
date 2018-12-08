// to test common type easily
export const testRunner = (testFnc : Function,
                           nullResult : boolean,
                           undefindResult : boolean,
                           booleanResult : boolean,
                           numberResult : boolean,
                           stringResult : boolean,
                           arrayResult : boolean,
                           objectResult : boolean) : boolean => {
	return testFnc(null) === nullResult
		&& testFnc(undefined) === undefindResult
		&& testFnc(true) === booleanResult
		&& testFnc(8) === numberResult
		&& testFnc('hello') === stringResult
		&& testFnc([1, 2, 3]) === arrayResult
		&& testFnc({ a : 1 }) === objectResult;
};
