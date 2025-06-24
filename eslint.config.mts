import eslint from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	globalIgnores(['dist/'], 'Ignore build directory.'),
	globalIgnores(['src/migrations'], 'Ignore migration directory.'),
	{
		files: ['src/**/*', 'ts-node/**/*', 'eslint.config.mts', 'webpack.config.mts'],
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['ts-node/*', 'eslint.config.mts', 'webpack.config.mts']
				},
				tsconfigRootDir: import.meta.dirname
			}
		},
		plugins: {
			'@stylistic': stylistic
		},
		rules: {
			curly: ['warn', 'all'],
			eqeqeq: ['error', 'always'],
			'@typescript-eslint/consistent-type-exports': [
				'error',
				{
					fixMixedExportsWithInlineTypeSpecifier: false
				}
			],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					fixStyle: 'separate-type-imports',
					prefer: 'type-imports'
				}],
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'@stylistic/arrow-parens': ['warn', 'as-needed'],
			'@stylistic/comma-dangle': ['warn', 'never'],
			'@stylistic/indent': [
				'warn',
				'tab',
				{
					SwitchCase: 1,
					ignoredNodes: [
						'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
					]
				}
			],
			'@stylistic/no-extra-parens': 'warn',
			'@stylistic/no-trailing-spaces': 'warn',
			'@stylistic/object-curly-spacing': ['warn', 'always'],
			'@stylistic/quotes': [
				'warn',
				'single',
				{
					allowTemplateLiterals: 'avoidEscape',
					avoidEscape: true
				}
			],
			'@stylistic/semi': ['warn', 'always']
		}
	}
);
