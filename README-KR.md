# ejv
 
Easy JSON Validator

ejv는 JSON 객체를 검사할 때 사용하는 라이브러리입니다.
복잡한 JSON 객체를 간단한 문법으로 검사해 보세요.

> ejv 는 TypeScript로 작성되었으며 JavaScript 코드로 컴파일되어 배포됩니다. 따라서 TypeScript 문법으로 사용할 수도 있고 JavaScript 형태로 사용할 수도 있습니다.

## `ejv()`

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

## `DataType`

## `EjvError`

객체가 검사 규칙을 통과하면 `null` 객체를 반환합니다. 그리고 검사 규칙을 통과하지 못하면 `EjvError` 타입의 인스턴스를 반환합니다.

`EjvError` 객체는 `ejv()` 검사가 실패했을 때 반환되는 객체입니다.
 
`EjvError` 형식을 꼭 사용할 필요는 없습니다. 다만, TypeScript를 사용한다면 이 객체의 프로퍼티를 참조할 때 활용할 수 있습니다.


프로퍼티|타입|설명
---|---|---
`keyword`|`string`|
`path`|`string`|
`data`|`any`|