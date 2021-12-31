import { AnyObject, DateScheme, NumberScheme, Scheme } from './interfaces';
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

// sanitize removes undefined & null fields from object. default false
export const clone = <T> (obj: T, sanitize?: boolean): T => {
	let result !: T;

	if (obj) {
		let type: CloneDataType = typeof obj as CloneDataType;

		if (type === CloneDataType.Object) {
			const objAsObject: AnyObject = obj as unknown as AnyObject;

			if (Array.isArray(objAsObject)) {
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


const toEffectiveFlatSchemeOnce = <T extends NumberScheme | DateScheme> (scheme: T, reverse: boolean = false): T => {
	const flatScheme: T = {} as T;

	const schemeKeys: (keyof T)[] = Object.keys(scheme) as (keyof T)[];

	for (const key of schemeKeys) {
		switch (key) {
			case 'min':
				if (!reverse) {
					flatScheme.min = scheme.min;

					if (scheme.exclusiveMin !== undefined) {
						flatScheme.exclusiveMin = scheme.exclusiveMin;
					}
				}
				else {
					flatScheme.max = scheme.min;
					flatScheme.exclusiveMax = xor(!!scheme.exclusiveMin, reverse);
				}
				break;

			case 'exclusiveMin':
				flatScheme.exclusiveMin = xor(!!scheme.exclusiveMin, reverse);
				break;

			case 'not': {
				// const notScheme: T | T[] | undefined = scheme.not; // TODO: array
				const notScheme: T = scheme.not as T;

				const notFlatScheme: T = toEffectiveFlatSchemeOnce(notScheme, !reverse);
				const notFlatSchemeKeys: (keyof T)[] = Object.keys(notFlatScheme) as (keyof T)[];

				for (const notFlatKey of notFlatSchemeKeys) {
					if (flatScheme[notFlatKey] === undefined) {
						// not overwrite
						flatScheme[notFlatKey] = notFlatScheme[notFlatKey];
					}
				}

				delete flatScheme.not;

				break;
			}

			default:
				flatScheme[key] = scheme[key];
		}
	}

	return flatScheme;
};

// for NumberScheme, DateScheme
export const toEffectiveFlatScheme = <T extends NumberScheme | DateScheme> (scheme: T): T => {
	const flatScheme: T = toEffectiveFlatSchemeOnce(scheme);

	// delete redundancies
	if (flatScheme.exclusiveMin !== undefined && flatScheme.min === undefined) {
		delete flatScheme.exclusiveMin;
	}

	if (flatScheme.exclusiveMax !== undefined && flatScheme.max === undefined) {
		delete flatScheme.exclusiveMax;
	}

	return flatScheme;
};
