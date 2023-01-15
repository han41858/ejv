import { AnyObject, MinMaxScheme, Scheme } from './interfaces';
import { ErrorMsg, ErrorMsgCursorNot } from './constants';


enum CloneDataType {
	Boolean = 'boolean',
	Number = 'number',
	Function = 'function',
	String = 'string',
	Buffer = 'buffer',
	Object = 'object',
	Array = 'array',
	Date = 'date',
	RegExp = 'regexp'
}

export const isArray = <T> (value: unknown): value is T[] => {
	return value !== undefined
		&& value !== null
		&& Array.isArray(value);
};


// sanitize removes undefined & null fields from object. default false
export const clone = <T> (obj: T, sanitize?: boolean): T => {
	let result !: T;

	if (obj) {
		let type: CloneDataType = typeof obj as CloneDataType;

		if (type === CloneDataType.Object) {
			const objAsObject: AnyObject = obj as unknown as AnyObject;

			if (isArray(objAsObject)) {
				type = CloneDataType.Array;
			}
			else if (objAsObject instanceof Date) {
				type = CloneDataType.Date;
			}
			else if (objAsObject instanceof RegExp) {
				type = CloneDataType.RegExp;
			}
			else if (objAsObject.byteLength
				&& typeof objAsObject.byteLength === 'function') {
				type = CloneDataType.Buffer;
			}
		}

		switch (type) {
			case CloneDataType.Date: {
				const objAsDate: Date = obj as unknown as Date;
				result = new Date(objAsDate) as unknown as T;
				break;
			}

			case  CloneDataType.Array: {
				const objAsArray: unknown[] = obj as unknown as unknown[];
				result = objAsArray.map((one: unknown): unknown => {
					return clone(one);
				}) as unknown as T;
				break;
			}

			case CloneDataType.Object: {
				// sanitize default false
				result = {} as unknown as T;

				const entries: [string, unknown][] = Object.entries(obj)
					.filter(([, value]): boolean => {
						return sanitize
							? value !== undefined && value !== null
							: true;
					});


				for (const [key, value] of entries) {
					// call recursively
					(result as unknown as AnyObject)[key] = clone(value, sanitize);
				}
				break;
			}

			default:
				// simple copy
				result = obj;
		}
	}
	else {
		result = obj; // do not copy null & undefined
	}

	return result;
};

export const createErrorMsg = (errorMsg: ErrorMsg, param?: {
	reverse?: boolean // default false
	placeholders?: (string | number)[]
}): string => {
	let result: string = errorMsg;

	if (param?.placeholders) {
		param.placeholders.forEach((strToReplace: string | number, i: number): void => {
			result = result.replace(
				`<<${ i + 1 }>>`,
				typeof strToReplace === 'string'
					? strToReplace
					: '' + strToReplace
			);
		});
	}

	result = result.replace(ErrorMsgCursorNot, param?.reverse ? 'not ' : '');

	return result;
};

export const xor = (a: boolean, b: boolean): boolean => {
	return a ? !b : b;
};

export const getBothKeys = (a: Scheme, b: Scheme): string[] => {
	const aKeys: string[] = Object.keys(a);
	const bKeys: string[] = Object.keys(b);

	return [...aKeys, ...bKeys].reduce((acc: string[], key: string): string[] => {
		if (!acc.includes(key) && aKeys.includes(key) && bKeys.includes(key)) {
			acc.push(key);
		}

		return acc;
	}, []);
};


const extractCandidates = <T extends MinMaxScheme<unknown>> (schemes: T[], reverse: boolean = false): T[] => {
	return schemes.reduce((acc: T[], one: T): T[] => {
		if (one.not !== undefined) {
			const notScheme: T | T[] = one.not as T | T[];

			const notFlatSchemes: T[] = extractCandidates(
				isArray(notScheme)
					? notScheme
					: [notScheme]
				, !reverse);

			acc.push(...notFlatSchemes);

			delete one.not;
		}


		const oneSanitized: T = {} as T;

		Object.keys(one).forEach((_key: string): void => {
			const key: keyof T = _key as keyof T;

			if (one[key] !== undefined) {
				switch (key) {
					case 'min':
						if (!reverse) {
							oneSanitized.min = one.min;
						}
						else {
							oneSanitized.max = one.min;
							oneSanitized.exclusiveMax = xor(!!one.exclusiveMin, reverse);
						}
						break;

					case 'exclusiveMin':
						oneSanitized.exclusiveMin = xor(!!one.exclusiveMin, reverse);
						break;

					case 'max':
						if (!reverse) {
							oneSanitized.max = one.max;
						}
						else {
							oneSanitized.min = one.max;
							oneSanitized.exclusiveMin = xor(!!one.exclusiveMax, reverse);
						}
						break;

					case 'exclusiveMax':
						oneSanitized.exclusiveMax = xor(!!one.exclusiveMax, reverse);
						break;

					default:
						oneSanitized[key] = one[key];
				}
			}
		});

		acc.push(oneSanitized);

		return acc;
	}, []);
};


// for NumberScheme, DateScheme
// assume same type schemes
export const toEffectiveFlatScheme = <T extends MinMaxScheme<unknown>> (scheme: T | T[]): T[] => {
	console.warn('toEffectiveFlatScheme()', scheme);

	const flatSchemeCandidates: T[] = extractCandidates(
		isArray(scheme)
			? scheme
			: [scheme]
	);

	console.log('candidates');
	console.table(flatSchemeCandidates);


	// accumulate to one scheme
	const flatScheme: T = flatSchemeCandidates.reduce((acc: T, one: T): T => {
		console.log({ acc, one });

		Object.keys(one).forEach((_key: string): void => {
			const key: keyof T = _key as keyof T;
			console.log({ key, value: one[key] });

			if (one[key] !== undefined) {
				switch (key) {
					case 'min':
						if (acc[key] === undefined
							|| acc[key] < one[key]) {
							acc[key] = one[key];

							// delete previous value
							delete acc.exclusiveMin;

							// set new value
							console.log('exMin set by min');

							acc.exclusiveMin = one.exclusiveMin;
						}
						break;

					case 'exclusiveMin':
						if (one.min === undefined) {
							console.log('exMin set by self');
							acc.exclusiveMin = one.exclusiveMin;
						}
						break;

					case 'max':
						if (acc[key] === undefined
							|| acc[key] > one[key]) {
							acc[key] = one[key];

							console.log('set max');

							// delete previous value
							delete acc.exclusiveMax;

							// set new value
							console.log('exMax set by max');
							acc.exclusiveMax = one.exclusiveMax;
						}
						break;

					case 'exclusiveMax':
						if (one.max === undefined) {
							console.log('exMax set by self');
							acc.exclusiveMax = one.exclusiveMax;
						}
						break;

					case 'type':
						acc.type = one.type;
						break;
				}
			}
		});

		return acc;
	}, {} as T);

	// delete redundancies
	if (
		!flatScheme.exclusiveMin // undefined / default false
		|| flatScheme.min === undefined // no min
	) {
		console.log('delete exMin', [!flatScheme.exclusiveMin, flatScheme.min === undefined]);
		delete flatScheme.exclusiveMin;
	}

	if (
		!flatScheme.exclusiveMax // undefined / default false
		|| flatScheme.max === undefined // no max
	) {
		delete flatScheme.exclusiveMax;
	}

	console.log('final flatScheme:');
	console.table([flatScheme]);

	// TODO
	// return flatScheme;
	return [];
};
