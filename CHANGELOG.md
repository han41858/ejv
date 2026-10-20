# Change Log

# Unreleased (3.0.0)

- breaking change : `Scheme` types are checked by `type` (TypeScript only, no runtime change)
	- with a single `type`, only the rules of the type are allowed (ex. `minLength` for `type: 'number'` is a compile error)
	- `type`, `format` accept the names of `DATA_TYPE`, `NUMBER_FORMAT`, `STRING_FORMAT` only (string literal or enum value)
	- the value of `validate` has the type of the scheme (ex. `number` for `type: 'number'`)
	- several types (ex. `['number', 'string']`) allow the rules of all types
	- `type` is required. Schemes without `type`, strings and arrays are not `Scheme` anymore (they were allowed by the type, and failed at runtime)
	- `parent` is removed from the public `Scheme` type. It is an internal reference to the upper scheme. Runtime behavior is not changed
	- migration : declare scheme variables with `Scheme[]` type (or `satisfies Scheme[]`). Without it, `type: 'number'` is widened to `string`. Use `DataTypeName`, `NumberFormatName`, `StringFormatName` for the variables of type names and formats
- improvement
	- `MultiTypeScheme`, `DataTypeName`, `NumberFormatName`, `StringFormatName` exported
- internal
	- type tests (`spec/types.spec.ts`) and `yarn typecheck` in CI

# 2.2.1

- improvement
	- recursive schemes (ex. tree, `items` of a scheme refers itself) are supported
- bug fix
	- schemes with circular references in `items` don't overflow the stack (`clone()` keeps circular references)
	- circular `parent` returns `SCHEMES_HAS_CIRCULAR_PARENT` instead of overflowing the stack
	- `parent: null` is treated as no parent instead of throwing `TypeError`
	- instance of a class as `items` scheme keeps its prototype methods (ex. `validate()`)
	- `date`, `date-time` formats : ISO 8601 week date `W53` is allowed only in the year which has 53 weeks (ex. `2020-W53` is valid, `2018-W53` is not)

# 2.2.0

- improvement
	- `allowUnknownProperty` added : rejects properties not declared in `properties`. `'object'` option, and `ejv()` option for the top level data. `UNKNOWN_PROPERTY` error
	- `validate` added : custom validation function for all schemes, `(value, data) => string | null`. `CUSTOM` error
	- string formats added : `url`, `ip`, `ipv4`, `ipv6`
		- `url` : `http://` or `https://` URL that can be parsed by `new URL()` as written
		- `ipv4`, `ipv6` : optional port (IPv6 with port should be in brackets, ex. `[::1]:8080`)
	- `BufferScheme`, `BufferLike`, `AllDataType` exported
	- performance : `unique` is O(n), format testers and options are not created or deep copied for every value
- bug fix : `ejv()` returns `EjvError` instead of throwing, or works correctly
	- schemes are not mutated by `ejv()` anymore (reusing a scheme could overflow the stack)
	- date `min`, `max` which `Date` can not parse (ex. `'2020-W01'`) returns `INVALID_SCHEMES`
	- invalid regular expression string in `pattern` (ex. `'('`) returns `INVALID_SCHEMES`
	- `items` with values that are not schemes (ex. `[1, 2]`) and `null` in schemes, `properties`, `items` return `INVALID_SCHEMES`
	- bigint and circular reference in invalid scheme values are shown in the messages (ex. `1n`, `[Circular]`)
	- type mismatch message uses the type inherited through multiple `parent` levels (was `'the value should be a undefined'`)
- caution : stricter validation. values and schemes which passed before can fail
	- `date`, `date-time` formats check the day exists in the month (ex. `'2019-02-29'`, `'2018-04-31'` fail)
	- `email` format rejects leading and trailing dots in the local part (ex. `'.abc@domain.com'`)
	- `Infinity` is not an `integer` / `index`
	- falsy types (ex. `type: ''`, `type: null`) return `SCHEMES_HAS_INVALID_TYPE`
	- empty or falsy lists are scheme errors : `type: []`, `items: []`, `format: []`, `format: ['', 'email']`
	- arrays, `Date`, `RegExp` and buffers are not accepted as schemes in schemes, `properties`, `items`
	- `customErrorMsg` is applied to data errors only (was also applied to scheme errors from nested schemes)
	- `ERROR_MESSAGE` changed : `NO_OBJECT_ARRAY_SCHEME`, `PROPERTIES_SHOULD_BE_ARRAY_OF_OBJECT` (`array of object` -> `array of scheme object`)
- internal
	- `_ejv()` split into per-type validators (no behavior change)
- build
	- ESM type declarations added (`build/esm/*.d.ts`), CJS types stay at `build/index.d.ts`
	- published files limited with `files` field
	- CI added (GitHub Actions, Node 20, 22, 24)
- docs
	- `json` format, `allowUnknownProperty`, `validate` documented
	- `customErrorMsg` example fixed (`ERROR_TYPE`, options position)
	- `EjvError` properties fixed (`message`, `errorScheme`, `isSchemeError`, `isDataError`)

# 2.1.7

- bug fix
	- build error fixed (`rootDir` of `tsconfig.json`, scripts are built into `build/scripts`)
	- 2.1.5 changes restored (`buffer` type) - they were missing in 2.1.6

# 2.1.6

- dependencies version up
	- `typescript@6.0.3`
	- `eslint@10.6.0`
	- `mocha@11.7.6`
- caution : published without the 2.1.5 changes (`buffer` type is not available). Fixed in 2.1.7

# 2.1.5

- improvement
	- `buffer` data type added : `byteLength`, `minByteLength`, `maxByteLength`
	- arrow functions changed to pure functions
	- `ArrayScheme` length specs added, spec code optimized
- dependencies version up
	- `typescript@5.9.3`
	- `eslint@10.0.0`
	- `mocha@11.7.5`

# 2.1.4

- bug fix
	- `package.json` with module type for `build/cjs`, `build/esm` is created by script

# 2.1.3

- bug fix
	- `package.json` - `exports` - `types` field added
- README badges added
- dependencies version up
	- `typescript@5.8.3`
	- `eslint@9.30.1`
	- `mocha@11.7.1`

# 2.1.2

- improvement
	- `STRING_FORMAT.JSON` added
- eslint linebreak setting changed

# 2.1.1

- improvement
	- `notEnum` added
	- README indent optimized
- dependencies version up
	- `typescript@5.6.2`
	- `eslint@9.12.0`

# ~~2.1.0~~

- publish failed

# 2.0.5

- bug fix
	- `min`, `max` error fix

# ~~2.0.4~~

- publish failed

# 2.0.3

- spec error fix

# 2.0.2

- improvement
	- `ejv()` does not throw error, just return `EjvError` object
	- `EjvError` - `isSchemeError`, `isDataError` properties added
	- `ErrorType`, `ErrorMsg` - `ONE_OF` renamed to `ONE_VALUE_OF`
	- esm build added
		- types : `build`
		- esm : `build/esm`
		- commonjs : `build/cjs`
- dependency packages version up
	- `typescript@5.3.3`

# 1.1.11

- improvement
	- `eslint` added
	- `Scheme` interface subdivided with each type
		- new schemes: `BooleanScheme`, `NumberScheme`, `StringScheme`, `ObjectScheme`, `DateScheme`, `RegExpScheme`, `ArrayScheme`
		- specs subdivided
	- `not` rule added, but finally removed
	- `eslint` rule more added

- bug fix
- dependency packages version up
	- `mocha@9.1.3`
	- `typescript@4.3.5`

# 1.1.10

- bug fix
	- `numberTester()` covers `NaN`

- dependency packages version up
	- `mocha@8.2.1`
	- `typescript@4.1.3`

# 1.1.9

- improvement
	- testers return type optimized
	- `length` rule added
- bug fix
	- `tester.iso8601DateTester()` - `YYYYDDDD` format modified for leap year
	- `dateTester()` became stricter
	- `arrayTester()` use native function

# 1.1.8

- improvement
	- `CHANGELOG.md` file added
	- TypeScript `strict` flag set

- dependency packages version up
	- `mocha@8.0.1`
	- `typescript@3.9.5`

# 1.1.7

- improvement
	- array error message format

- bug fix
	- array temp key error fixed

- dependency packages version up
	- `mocha@7.1.0`
	- `typeScript@3.8.3`

# 1.1.6

- improvement
	- `data` represent entire data passed to `ejv()`
	- `errorData` added to `EjvError`
	- `Function` declaration removed

- bug fix
	- timezone error fixed

# 1.1.5

- improvement
	- `null`, `undefined` flow optimized

- bug fix
	- `null` parsing error fixed

# 1.1.4

- improvement
	- array item `nullable` logic added

# 1.1.3

- improvement
	- array error path format

# 1.1.2

- bug fix
	- ITEMS_SCHEMES bug fixed

# 1.1.1

- improvement
	- `ErrorType.ITEMS_SCHEME` deprecated
