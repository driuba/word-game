import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default defineConfig(
	eslint.configs.recommended,
	// @ts-expect-error after a recent update the types for stylistic plugin and eslint core seem to be misaligned, it still works tho
	stylistic.configs.customize({
		arrowParens: true,
		braceStyle: '1tbs',
		commaDangle: 'never',
		indent: 'tab',
		jsx: false,
		quoteProps: 'as-needed',
		semi: true,
		severity: 'warn'
	}),
	tseslint.configs.recommendedTypeChecked,
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
		rules: {
			curly: ['warn', 'all'],
			eqeqeq: ['error', 'always'],
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
			'@stylistic/object-curly-spacing': ['warn', 'always'],
			'@stylistic/operator-linebreak': [
				'warn',
				'after',
				{
					overrides: {
						'?': 'before',
						':': 'before'
					}
				}
			],
			'@stylistic/quotes': [
				'warn',
				'single',
				{
					allowTemplateLiterals: 'avoidEscape',
					avoidEscape: true
				}
			],
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
			'@typescript-eslint/no-unnecessary-condition': ['warn', { allowConstantLoopConditions: 'only-allowed-literals' }],
			'@typescript-eslint/prefer-nullish-coalescing': 'warn'
		}
	}
);
