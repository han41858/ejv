# Change Log

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
		- new
		  schemes: `BooleanScheme`, `NumberScheme`, `StringScheme`, `ObjectScheme`, `DateScheme`, `RegExpScheme`, `ArrayScheme`
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
