import { DataType } from './constants';

type TypeTester = (value : any) => boolean;

export const definedTester : TypeTester = (value : any) : boolean => {
	return value !== undefined;
};

export const booleanTester : TypeTester = (value : any) : boolean => {
	return typeof value === 'boolean';
};

export const numberTester : TypeTester = (value : any) : boolean => {
	return typeof value === 'number';
};

export const integerTester : TypeTester = (value : any) : boolean => {
	return numberTester(value)
		&& +value.toFixed(0) === value;
};

export const indexTester : TypeTester = (value : any) : boolean => {
	return integerTester(value)
		&& value >= 0;
};

export const stringTester : TypeTester = (value : any) : boolean => {
	return typeof value === 'string';
};

export const emailTester : TypeTester = (value : any) : boolean => {
	return stringTester(value)
		// RFC 5322, 3.4.1. spec
		&& /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
};

// with port
export const urlTester : TypeTester = (value : any) : boolean => {
	return stringTester(value)
		&& /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
};

// TODO: with port
export const ipv4Tester : TypeTester = (value : any) : boolean => {
	return stringTester(value)
		&& /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
};

export const ipv6Tester : TypeTester = (value : any) : boolean => {
	return stringTester(value)
		&& /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$;/.test(value);
};

export const ipTester : TypeTester = (value : any) : boolean => {
	return ipv4Tester(value) || ipv6Tester(value);
};

export const objectTester : TypeTester = (value : any) : boolean => {
	return typeof value === 'object';
};

export const dateTester : TypeTester = (value : any) : boolean => {
	return objectTester(value)
		&& value !== null
		&& value.getFullYear !== undefined;
};

export const arrayTester : TypeTester = (value : any) : boolean => {
	return objectTester(value)
		&& value !== null
		&& value.length !== undefined
		&& value.push !== undefined;
};

export const typeTester : Function = (type : DataType, value : any) : boolean => {
	let result : boolean = false;

	switch (type) {
		case DataType.BOOLEAN:
			result = booleanTester(value);
			break;

		case DataType.NUMBER:
			result = numberTester(value);
			break;

		case DataType.STRING:
			result = stringTester(value);
			break;

		default:
			throw new Error(`not defined type [${type}]`); // TODO: dev
	}

	return result;
};

export const typeArrayTester : Function = (types : DataType[], value : any) : boolean => {
	return types.some((type : DataType) => {
		return typeTester(type, value);
	});
};