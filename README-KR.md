# ejv
 
Easy JSON Validator

ejv는 JSON 객체를 검사할 때 사용하는 라이브러리입니다.
복잡한 JSON 객체를 간단한 문법으로 검사해 보세요.

> ejv 는 TypeScript로 작성되었으며 JavaScript 코드로 컴파일되어 배포됩니다. 따라서 TypeScript 문법으로 사용할 수도 있고 JavaScript 문법으로 사용할 수도 있습니다.

## `ejv(data : object, schemes : Scheme[])`

ejv 라이브러리는 단 하나의 함수만 제공합니다. 모든 검사는 이 함수를 사용합니다.

사용방법)
```typescript
import { ejv, EjvError } from 'ejv';

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

## `Scheme`

`ejv()` 함수로 JSON 객체를 검사하려면 이 함수의 두 번째 인자로 검사 규칙을 전달해야 합니다.

이 때 검사 규칙은 배열 형태로 정의합니다. ejv는 배열에 있는 검사 규칙을 순서대로 확인하기 때문에 검사항목의 우선순위를 지정할 수 있습니다.

### 필수 항목

#### `key` : `string`

검사할 프로퍼티의 이름을 지정합니다. JSON 객체에 있는 `a` 프로퍼티를 검사하려면 `key : 'a'`라고 지정합니다.

> 이 프로퍼티는 `array` 타입에 `items` 옵션을 사용할 때 생략할 수 있습니다.


#### `type` : [`DataType`](#DataType) | `DataType[]`

프로퍼티의 형식을 지정합니다. 타입이 하나만 지정되면 해당 타입인지 검사합니다. 그리고 배열로 지정되면 배열에 있는 항목 중 하나에 해당되는지 검사합니다.



### 옵션 항목

#### 공통

- `optional : boolean`

`true`로 설정하면 `undefined` 값을 허용합니다.

```typescript
ejv({
  // 빈 객체
}, [{
  key : 'a',
  optional : true // 프로퍼티가 선언되지 않아도 에러가 발생하지 않습니다.
}])
```

- `enum : number[] | string[]`

배열로 전달되는 값만 허용합니다.

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
}])
```

#### `'number'` 타입 옵션

- `min : number`

최소값을 검사합니다. 이 값보다 작은 숫자이면 에러가 발생합니다.

- `exclusiveMin : boolean`

`true`로 지정하면 최소 한계값과 같은 값을 허용하지 않습니다. `false`로 지정하면 최소 한계값과 같은 값을 허용합니다. 이 옵션은 `min` 옵션이 사용되었을 때만 유효합니다.

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
}])
```

- `max : number`

최대값을 검사합니다. 이 값보다 큰 숫자이면 에러가 발생합니다.

- `exclusiveMax : boolean`

`true`로 지정하면 최대 한계값과 같은 값을 허용하지 않습니다. `false`로 지정하면 최대 한계값과 같은 값을 허용합니다. 이 옵션은 `max` 옵션이 사용되었을 때만 유효합니다.

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
}])
```

- `format : NumberFormat | NumberFormat[]`

숫자의 형식을 검사합니다. 배열로 지정된 경우에는 주어진 형식 중 하나에 해당되면 검사를 통과합니다. 사용할 수 있는 값은 다음과 같습니다.
               
타입|예
---|---
`'integer'`|정수만 허용합니다. ex) -1, 0, 1, ...
`'index'`|인덱스만 허용합니다. `format : 'integer', min : 0`을 설정한 것과 같습니다. ex) 0, 1, 2, ...

#### `'string'` 타입 옵션

- `format : StringFormat | StringFormat[]`

문자열의 형식을 검사합니다. 배열로 지정된 경우에는 주어진 형식 중 하나에 해당되면 검사를 통과합니다. 사용할 수 있는 값은 다음과 같습니다.
               
타입|예
---|---
`'email'`|이메일 형식인지 검사합니다. [RFC 5322 3.4.1](https://tools.ietf.org/html/rfc5322#section-3.4.1) 스펙을 기준으로 합니다. ex) `'email@domain.com'`
`'date'`|날짜 형식인지 검사합니다. [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 스펙을 기준으로 합니다. ex) `'2018-12-29'` 
`'time'`|시간 형식인지 검사합니다. [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 스펙을 기준으로 합니다. ex) `'21:07:35'`
`'date-time'`|날짜-시간 형식인지 검사합니다. [RFC 3339](https://www.ietf.org/rfc/rfc3339.txt) 스펙과 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 스펙을 기준으로 합니다. ex) `'2018-12-29T21:07:35Z'`

- `minLength : number`

문자열의 최소 길이를 검사합니다.

```typescript
ejv({
  str : 'hello'
}, [{
  key : 'str',
  type : 'string',
  minLength : 5
}])
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
}])
````

- `pattern : string | string[] | RegExp | RegExp[]`

문자열의 형식을 검사합니다. 문자열로 지정되면 이 문자열을 정규표현식으로 변환해서 검사하며, 정규표현식으로 지정되면 정규표현식을 통과하는지 검사합니다. 이 옵션의 값이 배열로 지정되면 배열 중 하나를 통과하면 검사를 통과합니다.

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
}])
```

#### `'object'` 타입 옵션

#### `'date'` 타입 옵션

- `min : Date | string`

날짜의 최소값을 검사합니다. 이 값보다 이전 날짜이면 에러가 발생합니다. 최소값은 `Date` 객체나 날짜를 표현하는 문자열을 사용할 수 있습니다.

- `exclusiveMin : boolean`

`true`로 지정하면 날짜의 최소값과 같은 값을 허용하지 않습니다. `false`로 지정하면 날짜의 최소값과 같은 값을 허용합니다. 이 옵션은 `min` 옵션이 사용되었을 때만 유효합니다.

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
  min : '20191230T00:00:00Z' // 성공
}, {
  key : 'date1',
  type : 'date',
  min : '20191230T00:00:00Z',
  exclusiveMin : true // 실패
}])
```

- `max : Date | string`

날짜의 최대값을 검사합니다. 이 값보다 이후 날짜이면 에러가 발생합니다. 최대값은 `Date` 객체나 날짜를 표현하는 문자열을 사용할 수 있습니다.

- `exclusiveMax : boolean`

`true`로 지정하면 날짜의 최대값과 같은 값을 허용하지 않습니다. `false`로 지정하면 날짜의 최대값과 같은 값을 허용합니다. 이 옵션은 `max` 옵션이 사용되었을 때만 유효합니다.

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
  max : '20191230T00:00:00Z' // 성공
}, {
  key : 'date1',
  type : 'date',
  max : '20191230T00:00:00Z',
  exclusiveMa : true // 실패
}])
```

#### `'array'` 타입 옵션


## `DataType`

검사할 프로퍼티의 타입을 지정합니다. 사용할 수 있는 값은 다음과 같습니다.

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

`EjvError` 객체는 `ejv()` 검사가 실패했을 때 반환되는 객체입니다.
 
> `EjvError` 형식을 꼭 사용할 필요는 없습니다. 다만, TypeScript를 사용한다면 이 객체의 프로퍼티를 참조할 때 활용할 수 있습니다.


- `keyword : string`

발생한 에러의 내용을 설명합니다.

- `path : string`

에러가 발생한 데이터 위치를 가리킵니다.
- `data : any`

에러가 발생한 데이터를 표시합니다.

사용방법)
```typescript
import { ejv, EjvError } from 'ejv';

const error : null | EjvError = ejv({
  a : 10
}, [{
  key : 'a',
  type : 'string' 
}]);

console.log(error.keyword); // 'the value should be a string'
console.log(error.path); // 'a'
console.log(error.data); // 10
```