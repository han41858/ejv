import { AnyObject } from './interfaces';
import { ErrorMsg } from './constants';


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


export const sift = <T> (arr: T[]): T[] => {
	return arr.reduce((acc: T[], cur: T) => {
		if (cur !== null && cur !== undefined && !acc.includes(cur)) {
			acc.push(cur);
		}

		return acc;
	}, []);
};


export const createErrorMsg = (errorMsg: ErrorMsg, param?: {
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

	return result;
};
