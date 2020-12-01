![npm](https://img.shields.io/npm/v/ejv?logo=npm)

# ejv - Easy JSON Validator

ejv는 JSON 객체를 검사할 때 사용하는 라이브러리입니다. 복잡한 JSON 객체를 간단한 문법으로 검사해 보세요.

> ejv 는 TypeScript로 작성되었으며 JavaScript 코드로 컴파일되어 배포됩니다. 따라서 TypeScript 문법으로 사용할 수도 있고 JavaScript 문법으로 사용할 수도 있습니다.

## 설치방법

```bash
npm install ejv
```

## `ejv(data : object, schemes : Scheme[])`

ejv 라이브러리는 단 하나의 함수만 제공합니다.
모든 검사는 이 함수를 사용합니다.

`ejv()` 함수는 단순하게 사용할 수 있는 순수 동기 함수입니다.
이 함수는 Promise 나 Observable 에도 불편함없이 사용할 수 있습니다.
이 함수는 검사하는 JSON 객체를 변경하지 않습니다.

### 심볼 로드

- TypeScript, JavaScript (ES6 부터)

```typescript
import { ejv, EjvError } from 'ejv';
```

- JavaScript (ES6 이전)

```javascript
var _ejv = require('ejv');
var ejv = _ejv.ejv;
```

### 사용방법

- TypeScript

```typescript
const error : null | EjvError = ejv({
	a : 10
}, [{
	key : 'a',
	type : 'number'
}]);

if (!error) {
	console.log('검사 성공');
} else {
	console.log('검사 실패');
}
```

- JavaScript

```javascript
var error = ejv({
	a : 10
}, [{
	key : 'a',
	type : 'number'
}]);

if (!error) {
	console.log('검사 성공');
} else {
	console.log('검사 실패');
}
```

## `Scheme`

`ejv()` 함수로 JSON 객체를 검사하려면 이 함수의 두 번째 인자로 *검사 규칙*을 전달해야 합니다.

이 때 검사 규칙은 배열 형태로 정의합니다.
ejv는 배열에 있는 검사 규칙을 순서대로 확인하기 때문에 검사항목의 우선순위를 지정할 수 있으며, 함수의 실행 결과는 항상 같습니다.

### 필수 항목

#### `key` : `string`

검사할 프로퍼티의 이름을 지정합니다.
JSON 객체에 있는 `a` 프로퍼티를 검사하려면 `key : 'a'`라고 지정합니다.

> 이 프로퍼티는 `array` 타입에 `items` 옵션을 사용할 때 생략할 수 있습니다.

#### `type` : [`DataType`](#DataType) | `DataType[]`

프로퍼티의 형식을 지정합니다.
타입이 하나만 지정되면 해당 타입인지 검사합니다.
그리고 배열로 지정되면 배열에 있는 항목 중 하나에 해당되는지 검사합니다.

### 옵션 항목

#### 공통

- `optional : boolean`

`true`로 설정하면 `undefined` 값을 허용합니다.
이 옵션은 모든 검사규칙에 사용할 수 있습니다.

```typescript
ejv({
	// 빈 객체
}, [{
	key : 'a',
	optional : true // 프로퍼티가 선언되지 않아도 에러가 발생하지 않습니다.
}]);
```

- `nullable : boolean`

`true`로 설정하면 `null` 값을 허용합니다.
이 옵션은 모든 검사규칙에 사용할 수 있습니다.

```typescript
ejv({
	a : null
}, [{
	key : 'a',
	nullable : true
}]);
```

- `enum : number[] | string[]`

배열로 전달되는 값만 허용합니다.
이 옵션은 `type : number`과 `type : string` 검사규칙에 사용할 수 있습니다.

```typescript
ejv({
	a : 1,
	b : 'hello'
}, [{
	key : 'a',
	type : 'number',
	enum : [1, 2, 3] // 1, 2, 3 값을 허용합니다.
}, {
	key : 'b',
	type : 'string',
	enum : ['hello', 'ejv'] // 'hello'나 'ejv' 값을 허용합니다.
}]);
```

- `enumReverse : number[] | string[]`

배열로 전달되는 값을 허용하지 않습니다. 이 옵션의 결과는 `enum` 옵션의 결과와 반대입니다.
이 옵션은 `type : number`과 `type : string` 검사규칙에 사용할 수 있습니다.

```typescript
ejv({
	a : 1,
	b : 'hello'
}, [{
	key : 'a',
	type : 'number',
	enumReverse : [1, 2, 3] // 1, 2, 3 값을 허용하지 않습니다.
}, {
	key : 'b',
	type : 'string',
	enumReverse : ['hello', 'ejv'] // 'hello'나 'ejv' 값을 허용하지 않습니다.
}]);
```

#### `'number'` 타입 옵션

- `min : number`

최소값을 검사합니다.
이 값보다 작은 숫자이면 에러가 발생합니다.

- `exclusiveMin : boolean`

`true`로 지정하면 최소 한계값과 같은 값을 허용하지 않습니다.
이 옵션을 생략하거나 `false`로 지정하면 최소 한계값과 같은 값을 허용합니다.
이 옵션은 `min` 옵션이 사용되었을 때만 유효합니다.

```typescript
ejv({
	num1 : 10,
	num2 : 10
}, [{
	key : 'num1',
	type : 'number',
	min : 10 // 성공
}, {
	key : 'num2',
	type : 'number',
	min : 10,
	exclusiveMin : true // 실패
}]);
```

- `max : number`

최대값을 검사합니다.
이 값보다 큰 숫자이면 에러가 발생합니다.

- `exclusiveMax : boolean`

`true`로 지정하면 최대 한계값과 같은 값을 허용하지 않습니다.
이 옵션을 생략하거나 `false`로 지정하면 최대 한계값과 같은 값을 허용합니다.
이 옵션은 `max` 옵션이 사용되었을 때만 유효합니다.

```typescript
ejv({
	num1 : 10,
	num2 : 10
}, [{
	key : 'num1',
	type : 'number',
	max : 10 // 성공
}, {
	key : 'num2',
	type : 'number',
	max : 10,
	exclusiveMax : true // 실패
}]);
```

- `format : NumberFormat | NumberFormat[]`

숫자의 형식을 검사합니다.
배열로 지정된 경우에는 주어진 형식 중 하나에 해당되면 검사를 통과합니다.
사용할 수 있는 값은 다음과 같습니다.

포맷|예
---|---
`'integer'`|정수만 허용합니다. ex) -1, 0, 1, ...
`'index'`|인덱스만 허용합니다. `format : 'integer', min : 0`을 설정한 것과 같습니다. ex) 0, 1, 2, ...

#### `'string'` 타입 옵션

- `format : StringFormat | StringFormat[]`

문자열의 형식을 검사합니다. 배열로 지정된 경우에는 주어진 형식 중 하나에 해당되면 검사를 통과합니다. 사용할 수 있는 값은 다음과 같습니다.

포맷|예
---|---
`'email'`|이메일 형식인지 검사합니다. [RFC 5322 3.4.1](https://tools.ietf.org/html/rfc5322#section-3.4.1) 스펙을 기준으로 합니다. ex) `'email@domain.com'`
`'date'`|날짜 형식인지 검사합니다. [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 스펙을 기준으로 합니다. ex) `'2018-12-29'`
`'time'`|시간 형식인지 검사합니다. [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 스펙을 기준으로 합니다. ex) `'21:07:35'`
`'date-time'`|날짜-시간 형식인지 검사합니다. [RFC 3339](https://www.ietf.org/rfc/rfc3339.txt) 스펙과 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 스펙을 기준으로 합니다. ex) `'2018-12-29T21:07:35Z'`

- `length : number`

문자열의 길이를 검사합니다.

```typescript
ejv({
	str : 'hello'
}, [{
	key : 'str',
	type : 'string',
	length : 5
}]);
````

- `minLength : number`

문자열의 최소 길이를 검사합니다.

```typescript
ejv({
	str : 'hello'
}, [{
	key : 'str',
	type : 'string',
	minLength : 5
}]);
````

- `maxLength : string`

문자열의 최대 길이를 검사합니다.

```typescript
ejv({
	str : 'hello'
}, [{
	key : 'str',
	type : 'string',
	maxLength : 5
}]);
````

- `pattern : string | string[] | RegExp | RegExp[]`

문자열의 형식을 검사합니다.
문자열로 지정되면 이 문자열을 정규표현식으로 변환해서 검사하며, 정규표현식으로 지정되면 정규표현식을 통과하는지 검사합니다.
이 옵션의 값이 배열로 지정되면 배열 중 하나를 통과하면 검사를 통과합니다.

```typescript
ejv({
	str : 'abc'
}, [{
	key : 'str',
	type : 'string',
	pattern : 'abc'
}, {
	key : 'str',
	type : 'string',
	pattern : ['abc', 'ac']
}, {
	key : 'str',
	type : 'string',
	pattern : /abc/
}, {
	key : 'str',
	type : 'string',
	pattern : [/abc/, /ac/]
}]);
```

#### `'object'` 타입 옵션

- `allowNoProperty : boolean`

객체에 프로퍼티가 최소한 1개 이상 있는지 검사합니다.
이 옵션에 `false`를 지정하면 프로퍼티가 없는 객체를 허용하지 않습니다.
이 옵션을 생략하거나 `true`로 지정하면 프로퍼티가 없는 객체를 허용합니다.

```typescript
ejv({
	obj : {}
}, [{
	key : 'obj',
	type : 'object',
	allowNoProperty : false // 실패
}]);
```

- `properties : Scheme[]`

객체의 세부 형식을 지정합니다.
검사 대상으로 지정된 객체는 ejv()가 재귀적으로 검사합니다.

```typescript
ejv({
	data : {
		num : 10,
		str : 'ejv'
	}
}, [{
	key : 'data',
	type : 'object',
	properties : [{
		key : 'num',
		type : 'number'
	}, {
		key : 'str',
		type : 'string'
	}]
}]);
```

#### `'date'` 타입 옵션

- `min : Date | string`

날짜의 최소값을 검사합니다.
이 값보다 이전 날짜이면 에러가 발생합니다.
최소값은 `Date` 객체나 날짜를 표현하는 문자열을 사용할 수 있습니다.

- `exclusiveMin : boolean`

`true`로 지정하면 날짜의 최소값과 같은 값을 허용하지 않습니다.
이 옵션을 생략하거나 `false`로 지정하면 날짜의 최소값과 같은 값을 허용합니다.
이 옵션은 `min` 옵션이 사용되었을 때만 유효합니다.

```typescript
ejv({
	date1 : new Date(2019, 11, 30)
}, [{
	key : 'date1',
	type : 'date',
	min : new Date(2019, 11, 30) // 성공
}, {
	key : 'date1',
	type : 'date',
	min : new Date(2019, 11, 30),
	exclusiveMin : true // 실패
}, {
	key : 'date1',
	type : 'date',
	min : '2019-12-30T00:00:00Z' // 성공
}, {
	key : 'date1',
	type : 'date',
	min : '2019-12-30T00:00:00Z',
	exclusiveMin : true // 실패
}]);
```

- `max : Date | string`

날짜의 최대값을 검사합니다.
이 값보다 이후 날짜이면 에러가 발생합니다.
최대값은 `Date` 객체나 날짜를 표현하는 문자열을 사용할 수 있습니다.

- `exclusiveMax : boolean`

`true`로 지정하면 날짜의 최대값과 같은 값을 허용하지 않습니다.
이 옵션을 생략하거나 `false`로 지정하면 날짜의 최대값과 같은 값을 허용합니다.
이 옵션은 `max` 옵션이 사용되었을 때만 유효합니다.

```typescript
ejv({
	date1 : new Date(2019, 11, 30)
}, [{
	key : 'date1',
	type : 'date',
	max : new Date(2019, 11, 30) // 성공
}, {
	key : 'date1',
	type : 'date',
	max : new Date(2019, 11, 30),
	exclusiveMax : true // 실패
}, {
	key : 'date1',
	type : 'date',
	max : '2019-12-30T00:00:00Z' // 성공
}, {
	key : 'date1',
	type : 'date',
	max : '2019-12-30T00:00:00Z',
	exclusiveMax : true // 실패
}]);
```

#### `'array'` 타입 옵션

- `length : number`

배열의 길이를 검사합니다.

```typescript
ejv({
	arr : [1, 2]
}, [{
	key : 'arr',
	type : 'array',
	length : 2
}]);
````

- `minLength : number`

배열의 최소 길이를 검사합니다.

```typescript
ejv({
	arr : [1, 2]
}, [{
	key : 'arr',
	type : 'array',
	minLength : 2
}]);
````

- `maxLength : string`

배열의 최대 길이를 검사합니다.

```typescript
ejv({
	arr : [1, 2, 3]
}, [{
	key : 'arr',
	type : 'array',
	maxLength : 3
}]);
````

- `unique : boolean`

배열의 항목이 모두 다른지 검사합니다.
`true`로 지정하면 배열의 값이 중복되는 것을 허용하지 않습니다.
이 옵션을 생략하거나 `false`로 지정하면 배열의 값이 중복되는 것을 허용합니다.

- `items : Scheme[]`

배열의 항목을 검사할 규칙을 지정합니다.
이 때 지정하는 Scheme은 ejv() 함수에 사용하는 Scheme과 같은 형식이지만 `key`는 생략합니다.
배열로 지정한 규칙은 ejv()가 재귀적으로 검사하며, 배열에 지정된 순서대로 처리됩니다.

```typescript
ejv({
	arr : [1, 2, 3]
}, [{
	key : 'arr',
	type : 'array',
	items : [{
		type : 'number',
		min : 1,
		max : 3
	}]
}])
```

## `DataType`

검사할 프로퍼티의 타입을 지정합니다.
사용할 수 있는 값은 다음과 같습니다.

타입|예
---|---
`'boolean'`|`true`, `false`
`'number'`|`0`, `1`, `1.5`, ...
`'string'`|`'ejv'`, `'hello'`, ...
`'object'`|`{}`, `{ key : 123 }`, ...
`'date'`|`new Date`
`'regexp'`|`new RegExp(/./)`, `/./`, ...
`'array'`|`[]`, `[1, 2, 3]`, ...

## `EjvError`

객체가 검사 규칙을 통과하면 `null` 객체를 반환하지만, 검사 규칙을 통과하지 못하면 `EjvError` 타입의 인스턴스를 반환합니다.
`EjvError` 객체는 이 때 발생한 에러를 표현하는 객체입니다.

> `EjvError` 형식을 꼭 사용할 필요는 없습니다.
하지만 TypeScript를 사용한다면 이 객체의 프로퍼티를 참조할 때 활용할 수 있습니다.

- `type : ErrorKey`

발생한 에러의 타입을 표현합니다.

- `message : string`

발생한 에러의 내용을 설명합니다.

- `path : string`

에러가 발생한 데이터 위치를 가리킵니다.

- `data : any`

`ejv()`로 전달한 데이터 자체를 의미합니다.

- `errorData : any`

에러가 발생한 데이터를 의미합니다.

사용방법)

```typescript
import { ejv, EjvError } from 'ejv';

const error : null | EjvError = ejv({
	a : 10
}, [{
	key : 'a',
	type : 'string'
}]);

console.log(error.type); // 'TYPE_MISMATCH'
console.log(error.message); // 'the value should be a string'
console.log(error.path); // 'a'
console.log(error.data); // { a : 10 }
console.log(error.errorData); // 10
```

## 옵션

`ejv()` 함수를 사용할 때 3번째 인자로 옵션을 지정할 수 있습니다.

- `customErrorMsg: object`

ejv가 제공하는 에러 메시지를 다른 내용으로 변경하려면 `EjvError.type`에 해당하는 키로 에러 메시지를 오버라이드 할 수 있습니다.

이 옵션은 `object` 형태로 사용합니다. 오버라이드하려는 에러에 해당하는 `ErrorType`를 키로 사용해서 원하는 문구를 지정해 보세요.

```typescript
import { ejv, EjvError, ErrorType } from 'ejv';

const error : null | EjvError = ejv({
	a : 10
}, [{
	key : 'a',
	type : 'string'
}, {
	customErrorMsg : {
		[ErrorType.TYPE_MISMATCH] : 'property "a" should be a "string".'
	}
}]);

console.log(error.message); // 'property "a" should be a "string".'
```