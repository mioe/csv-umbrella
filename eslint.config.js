import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
	js.configs.recommended,
	...pluginVue.configs['flat/recommended'],

	{
		rules: {
			'comma-dangle': ['error', 'always-multiline'],
			'no-return-await': 'off',
			'no-undef': 'off',
			'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
			'quote-props': ['error', 'as-needed'],
			'space-before-function-paren': ['error', 'never'],
			indent: ['error', 'tab'],
			quotes: ['error', 'single'],
			semi: ['error', 'never'],
		},
	},
]
