![npm](https://img.shields.io/npm/v/ejv?logo=npm)

# ejv - Easy JSON Validator

[한국어](https://github.com/han41858/ejv/blob/master/README-KR.md)

ejv is JSON validation library. Check your JSON object with simple syntax.

> ejv is written by TypeScript, and published by JavaScript. So you can use this library in TypeScript code and JavaScript code also.

## Install

```bash
npm install ejv
```

## `ejv(data : object, schemes : Scheme[])`

ejv provides only one function.
All validation use this function.

`ejv()` is pure sync function.
So you can use this function with Promise or Observable easily.
This function does not change original JSON object.

### Load symbol

- TypeScript, JavaScript (after ES6)

```typescript
import { ejv, EjvError } from 'ejv';
```

- JavaScript (before ES6)

```javascript
var _ejv = require('ejv');
var ejv = _ejv.ejv;
```

### Usage

- TypeScript

```typescript
const error : null | EjvError = ejv({
 a : 10
}, [{
 key : 'a',
 type : 'number'
}]);

if (!error) {
 console.log('success');
} else {
 console.log('failed');
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
 console.log('success');
} else {
 console.log('failed');
}
```

## `Scheme`

`ejv()` needs *validation rules*.
So, you should pass schemes to second parameter.

Validation rules declared by array of object.
ejv use this rule in order of array, you can check orderly, and result is always same.

### Mandatory keys

#### `key` : `string`

Specify the property to check.
For example, if you want to check 'a' property in JSON object, set `key :  a`

> This property is omitted to check `array` with `items` option.

#### `type` : [`DataType`](#DataType) | `DataType[]`

Specify the type of property to check.
If only one type is specified, Checksfor that type.
And if specified as an array, checks if it corresponds to one of the items in the array.

### Optional keys

#### Common

- `optional : boolean`

If you set it to `true`, ejv will allow the `undefined` value.
This option is available for all validation rules.

```typescript
ejv({
 // empty object
}, [{
 key : 'a',
 optional : true // Error does not occur without proffering declared.
}]);
```

- `nullable : boolean`

If you set it to `true`, ejv will allow the `null` value.
This option is available for all validation rules.

```typescript
ejv({
 a : null
}, [{
 key : 'a',
 nullable : true
}]);
```

- `enum : number[] | string[]`

Allows only the values that are delivered in an array.
This option is available for the rules of validation: `type: number` and `type: string`.

```typescript
ejv({
 a : 1,
 b : 'hello'
}, [{
 key : 'a',
 type : 'number',
 enum : [1, 2, 3] // allow 1, 2, 3
}, {
 key : 'b',
 type : 'string',
 enum : ['hello', 'ejv'] // allow 'hello', 'ejv'
}]);
```

- `enumReverse : number[] | string[]`

Not allows the values that are delivered in an array. This result is reverse of the option `enum`.
This option is available for the rules of validation: `type: number` and `type: string`.

```typescript
ejv({
 a : 1,
 b : 'hello'
}, [{
 key : 'a',
 type : 'number',
 enumReverse : [1, 2, 3] // not allow 1, 2, 3
}, {
 key : 'b',
 type : 'string',
 enumReverse : ['hello', 'ejv'] // not allow 'hello', 'ejv'
}]);
```

#### `'number'` options

- `min : number`

Checks ths minimum value.
Error occurs if the value is smaller than this value.

- `exclusiveMin : boolean`

If you specify `true`, ejv will not allow the same value as the minimum limit.
If you omit this option or specify it as `false`, ejv will allow the same value as the minimum limit.
This option is used only when the `min` option is used.

```typescript
ejv({
 num1 : 10,
 num2 : 10
}, [{
 key : 'num1',
 type : 'number',
 min : 10 // success
}, {
 key : 'num2',
 type : 'number',
 min : 10,
 exclusiveMin : true // failed
}]);
```

- `max : number`

Checks the maximum value.
Error occurs if the number is greater than this value.

- `exclusiveMax : boolean`

If you specify `true`, ejv will not allow the same value as the maximum limit.
If you omit this option or specify it as `false`, ejv will allow the same value as the maximum limit.
This option is used only when the `min` option is used.

```typescript
ejv({
 num1 : 10,
 num2 : 10
}, [{
 key : 'num1',
 type : 'number',
 max : 10 // success
}, {
 key : 'num2',
 type : 'number',
 max : 10,
 exclusiveMax : true // failed
}]);
```

- `format : NumberFormat | NumberFormat[]`

Checks the format of the number.
If specified as an array, ejv allow the value if it corresponds to one of the given formats.
The available formats are as follows.

format|example
---|---
`'integer'`|Allows only integer. ex) -1, 0, 1, ...
`'index'`|Allows only index. This format is same rule with `format : 'integer', min : 0`. ex) 0, 1, 2, ...

#### `'string'` options

- `format : StringFormat | StringFormat[]`

Checks the format of string. If specified as an array, ejv will allow the value if it corresponds to one of the given
formats. The available formats are as follows.

format|example
---|---
`'email'`|Allows only email. This is based on [RFC 5322 3.4.1](https://tools.ietf.org/html/rfc5322#section-3.4.1). ex) `'email@domain.com'`
`'date'`|Allows only date string format. This is based on [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). ex) `'2018-12-29'`
`'time'`|Allows only time string format. This is based on [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). ex) `'21:07:35'`
`'date-time'`|Allows only date-time string format. This is based on [RFC 3339](https://www.ietf.org/rfc/rfc3339.txt) and [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). ex) `'2018-12-29T21:07:35Z'`

- `length : number`

Checks the length of string.

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

Checks the minimum length of string.

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

Checks the maximum length of string.

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

Checks the pattern of string.
If specified as a string, the string is converted to a regular expression and checked, and if specified as a regular expression, it checks whether it passes the regular expression.
If the value of this option is specified as an array, pass the check if one of the rule passes.

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

#### `'object'` options

- `allowNoProperty : boolean`

Checks if object has at least one property.
If you specify `false`, ejv will not allow the empty object.
If you omit this option or specify it as `true`, ejv will allow the empty object has no property.

```typescript
ejv({
 obj : {}
}, [{
 key : 'obj',
 type : 'object',
 allowNoProperty : false // failed
}]);
```

- `properties : Scheme[]`

Specify the details of the object.
The object specified for the validation is recursively processed by ejv().

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

#### `'date'` options

- `min : Date | string`

Checks the minimum value of the date.
Error occurs when the date is earlier than this value.
The minimum value can be used for `Date` object or text representing a date.

- `exclusiveMin : boolean`

If you specify `true`, ejv will not allow the same date as the minimum limit.
If you omit this option or specify it as `false`, ejv will allow the same date as the minimum limit.
This option is used only when the `min` option is used.

```typescript
ejv({
 date1 : new Date(2019, 11, 30)
}, [{
 key : 'date1',
 type : 'date',
 min : new Date(2019, 11, 30) // success
}, {
 key : 'date1',
 type : 'date',
 min : new Date(2019, 11, 30),
 exclusiveMin : true // failed
}, {
 key : 'date1',
 type : 'date',
 min : '2019-12-30T00:00:00Z' // success
}, {
 key : 'date1',
 type : 'date',
 min : '2019-12-30T00:00:00Z',
 exclusiveMin : true // failed
}]);
```

- `max : Date | string`

Checks the maximum value of the date.
Error occurs when the date is after than this value.
The maximum value can be used for `Date` object or text representing a date.

- `exclusiveMax : boolean`

If you specify `true`, ejv will not allow the same date as the maximum limit.
If you omit this option or specify it as `false`, ejv will allow the same date as the maximum limit.
This option is used only when the `max` option is used.

```typescript
ejv({
 date1 : new Date(2019, 11, 30)
}, [{
 key : 'date1',
 type : 'date',
 max : new Date(2019, 11, 30) // success
}, {
 key : 'date1',
 type : 'date',
 max : new Date(2019, 11, 30),
 exclusiveMax : true // failed
}, {
 key : 'date1',
 type : 'date',
 max : '2019-12-30T00:00:00Z' // success
}, {
 key : 'date1',
 type : 'date',
 max : '2019-12-30T00:00:00Z',
 exclusiveMax : true // failed
}]);
```

#### `'array'` options

- `length : number`

Checks the length of the array.

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

Checks the minimum length of the array.

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

Checks the maximum length of the array.

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

Checks if all items in the array are different.
If you specify `true`, ejv will not allow the array to duplicate values.
If you omit this option or specify it as `false`, ejv will allow to duplicate the values of the array.

- `items : Scheme[]`

Specify the rules to inspect items in the array.
The Scheme specified at this time is the same format as the Scheme used in the `ejv()``, but omits the `key`.
Schemes specified as arrays are recursively processed by `ejv()`, and processed in the order specified in the array.

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

Specify the type of property to inspect. The values available are as follows.

type|example
---|---
`'boolean'`|`true`, `false`
`'number'`|`0`, `1`, `1.5`, ...
`'string'`|`'ejv'`, `'hello'`, ...
`'object'`|`{}`, `{ key : 123 }`, ...
`'date'`|`new Date`
`'regexp'`|`new RegExp(/./)`, `/./`, ...
`'array'`|`[]`, `[1, 2, 3]`, ...

## `EjvError`

If the JSON object passes the validation rule, it returns the `null` object, but if it does not pass the inspection rule, it returns the instance of the `EjvError` type.
The `EjvError` object is an object that represents the error that occurred at this time.

> You do not always need to use `EjvError` type.
However, if you use TypeScript, you can use it to refer to the property of an error object.

- `type : ErrorType`

Represents the type of the error that occurred.

- `keyword : string`

Describes the contents of the error that occurred.

- `path : string`

Points to the location of the data where the error occurred.

- `data : any`

Means the data that passed to `ejv()`.

- `errorData : any`

Means the data that the error occurred.

usage)

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

## Options

When using a `ejv()` function, you can specify options as a third parameter.

- `customErrorMsg: object`

You can override error message corresponding with `EjvError.type` to another content.

This option is used in the type of `object`. You can use `ErrorType` as a key when overriding error message.

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
