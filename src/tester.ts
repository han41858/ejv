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
	return typeof value === 'number'
		&& +value.toFixed(0) === value;
};

export const indexTester : Function = (value : any) : boolean => {
	return typeof value === 'number'
		&& +value.toFixed(0) === value
		&& value >= 0;
};

export const stringTester : Function = (value : any) : boolean => {
	return typeof value === 'string';
};