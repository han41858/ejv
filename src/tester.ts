export const definedTester : Function = (value : any,) : boolean => {
	return value !== undefined;
};

export const booleanTester : Function = (value : any) : boolean => {
	return typeof value === 'boolean';
};

export const numberTester : Function = (value : any) : boolean => {
	return typeof value === 'number';
};

export const integerTester : Function = (value : any) : boolean => {
	return numberTester(value)
		&& +value.toFixed(0) === value;
};

export const indexTester : Function = (value : any) : boolean => {
	return integerTester(value)
		&& value >= 0;
};

export const stringTester : Function = (value : any) : boolean => {
	return typeof value === 'string';
};

export const emailTester : Function = (value : any) : boolean => {
	return stringTester(value)
		// RFC 5322, 3.4.1. spec
		&& /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
};

export const urlTester : Function = (value : any) : boolean => {
	return stringTester(value)
		&& /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
};

export const ipv4Tester : Function = (value : any) : boolean => {
	return stringTester(value)
		&& /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);

};