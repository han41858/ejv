import { AnyObject } from './interfaces';
import { ERROR_MESSAGE } from './constants';


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

export function isArray<T> (value: unknown): value is T[] {
	return value !== undefined
		&& value !== null
		&& Array.isArray(value);
}


// built-in objects which can not be copied by own properties. they are shared, not copied
function isNotCopiable (value: object): boolean {
	return ArrayBuffer.isView(value)
		|| value instanceof ArrayBuffer
		|| value instanceof Map
		|| value instanceof Set
		|| value instanceof WeakMap
		|| value instanceof WeakSet
		|| value instanceof Promise;
}

// sanitize removes undefined & null fields from object. default false
// circular references are kept in the copy, prototypes of objects are kept (ex. instances of user classes)
export function clone<T> (obj: T, sanitize?: boolean): T {
	return cloneWithMemo(obj, sanitize, new WeakMap());
}

function cloneWithMemo<T> (obj: T, sanitize: boolean | undefined, memo: WeakMap<object, unknown>): T {
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
			else if (isNotCopiable(objAsObject)) {
				type = CloneDataType.Buffer; // simple copy
			}
		}

		if ((type === CloneDataType.Array || type === CloneDataType.Object) && memo.has(obj as unknown as object)) {
			return memo.get(obj as unknown as object) as T; // circular or shared reference
		}

		switch (type) {
			case CloneDataType.Date: {
				const objAsDate: Date = obj as unknown as Date;
				result = new Date(objAsDate) as unknown as T;
				break;
			}

			case  CloneDataType.Array: {
				const objAsArray: unknown[] = obj as unknown as unknown[];
				const resultArray: unknown[] = new Array(objAsArray.length);

				memo.set(objAsArray, resultArray);

				objAsArray.forEach((one: unknown, i: number): void => {
					resultArray[i] = cloneWithMemo(one, undefined, memo);
				});

				result = resultArray as unknown as T;
				break;
			}

			case CloneDataType.Object: {
				// sanitize default false
				const resultObject: AnyObject = Object.create(Object.getPrototypeOf(obj));

				memo.set(obj as unknown as object, resultObject);

				const entries: [string, unknown][] = Object.entries(obj as unknown as AnyObject)
					.filter(([, value]): boolean => {
						return sanitize
							? value !== undefined && value !== null
							: true;
					});


				for (const [key, value] of entries) {
					// call recursively
					resultObject[key] = cloneWithMemo(value, sanitize, memo);
				}

				result = resultObject as unknown as T;
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
}


export function sift<T> (arr: T[]): T[] {
	return arr.reduce((acc: T[], cur: T) => {
		if (cur !== null && cur !== undefined && !acc.includes(cur)) {
			acc.push(cur);
		}

		return acc;
	}, []);
}


export function createErrorMsg (errorMsg: ERROR_MESSAGE, param?: {
	placeholders?: (string | number)[]
}): string {
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
}


// JSON.stringify() for error messages, never throws.
// same result with JSON.stringify() for JSON values. bigint is shown as '1n', circular reference as '[Circular]'
export function safeStringify (value: unknown): string {
	if (typeof value === 'bigint') {
		return value + 'n';
	}

	// objects on the path from the root to the current value. shared references which are not circular are kept
	const ancestors: unknown[] = [];

	try {
		return String(JSON.stringify(value, function (this: unknown, _key: string, child: unknown): unknown {
			if (typeof child === 'bigint') {
				return child + 'n';
			}

			if (typeof child !== 'object' || child === null) {
				return child;
			}

			while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
				ancestors.pop();
			}

			if (ancestors.includes(child)) {
				return '[Circular]';
			}

			ancestors.push(child);

			return child;
		}));
	}
	catch (e: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
		// ex. toJSON() throws
		return '[unserializable]';
	}
}
