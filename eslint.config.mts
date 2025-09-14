import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import pluginImport from 'eslint-plugin-import';
import { configs as tsConfigs } from 'typescript-eslint';

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
	tsConfigs.recommendedTypeChecked,
	tsConfigs.strictTypeChecked,
	tsConfigs.stylisticTypeChecked,
	globalIgnores(['dist/'], 'Ignore build directory.'),
	globalIgnores(['src/migrations'], 'Ignore migration directory.'),
	{
		extends: [pluginImport.flatConfigs.recommended, pluginImport.flatConfigs.typescript],
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
			/* eslint-disable @typescript-eslint/naming-convention */
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
						':': 'before',
						'?': 'before'
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
			'@typescript-eslint/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: false }],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					fixStyle: 'separate-type-imports',
					prefer: 'type-imports'
				}],
			'@typescript-eslint/member-ordering': ['warn', {
				default: {
					order: 'alphabetically'
				}
			}],
			'@typescript-eslint/naming-convention': [
				'warn',
				{
					format: ['camelCase', 'snake_case'],
					leadingUnderscore: 'allow',
					selector: 'default'
				},
				{
					format: ['PascalCase'],
					selector: 'typeLike'
				}
			],
			'@typescript-eslint/no-empty-function': 'warn',
			'@typescript-eslint/no-unnecessary-condition': ['warn', { allowConstantLoopConditions: 'only-allowed-literals' }],
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			curly: ['warn', 'all'],
			eqeqeq: ['error', 'always'],
			'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
			'import/enforce-node-protocol-usage': ['error', 'always'],
			'import/order': ['warn', {
				alphabetize: {
					order: 'asc'
				},
				groups: ['type', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
				named: true
			}],
			'sort-keys': 'warn',
			'sort-vars': 'warn'
			/* eslint-enable @typescript-eslint/naming-convention */
		},
		settings: {
			/* eslint-disable @typescript-eslint/naming-convention */
			'import/resolver': {
				node: true,
				typescript: true
			}
			/* eslint-enable @typescript-eslint/naming-convention */
		}
	}
);
