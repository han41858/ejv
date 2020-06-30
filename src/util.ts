export const clone = (obj : any) : any => {
	let result : any = null;

	if (!!obj) {
		let type : string = typeof obj;

		if (type === 'object') {
			if (obj.push !== undefined && typeof obj.push === 'function') {
				type = 'array';
			} else if (obj.getFullYear !== undefined && typeof obj.getFullYear === 'function') {
				type = 'date';
			} else if (obj.byteLength !== undefined) {
				type = 'buffer';
			} else if (obj.exec !== undefined && obj.test !== undefined) {
				type = 'regexp';
			}
		}

		switch (type) {
			case 'boolean':
			case 'number':
			case 'function':
			case 'string':
			case 'buffer':
				// ok with simple copy
				result = obj;
				break;

			case 'regexp':
				result = new RegExp(obj);
				break;

			case 'date':
				result = new Date(obj);
				break;

			case 'array':
				result = [...obj.map((one : any) => {
					return clone(one);
				})];
				break;

			case 'object':
				// sanitize default false
				result = {};

				Object.keys(obj)
					.forEach(key => {
						// recursively call
						result[key] = clone(obj[key]);
					});
				break;
		}
	} else {
		result = obj; // do not copy null & undefined
	}

	return result;
};