import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';


export default [
	{
		files: [
			'**/*.{ts,js,mjs}'
		]
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,

	{
		plugins: {
			'chai-friendly': pluginChaiFriendly
		},
		rules: {
			'indent': ['warn', 'tab',
				{
					'ignoreComments': true,
					'SwitchCase': 1,
					'ignoredNodes': [
						'CallExpression *',
						'ExpressionStatement *'
					]
				}
			],
			// chai expect
			'@typescript-eslint/no-unused-expressions': 'off', // disable original rule
			'chai-friendly/no-unused-expressions': 'error',

			'linebreak-style': ['warn', 'windows'],
			'arrow-parens': 'warn',
			'quotes': ['warn', 'single'],
			'semi': ['warn', 'always'],
			'@typescript-eslint/no-shadow': 'error',
			'no-trailing-spaces': 'warn',
			'key-spacing': [
				'warn',
				{
					'beforeColon': false,
					'afterColon': true
				}
			],
			'@typescript-eslint/explicit-function-return-type': 'warn'
		}
	}
];
