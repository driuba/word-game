// @ts-check

import eslint from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin-ts';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  globalIgnores(['dist/'], 'Ignore build directory.'),
  globalIgnores(['src/migrations'], 'Ignore migration directory.'),
  {
    files: ['src/**/*', 'eslint.config.mjs'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs']
        },
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      '@stylistic/ts': stylistic
    },
    rules: {
      indent: [
        'warn',
        2,
        {
          'ignoredNodes': [
            'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
          ]
        }
      ],
      quotes: ['warn', 'single', { avoidEscape: true }],
      '@stylistic/ts/object-curly-spacing': ['error', 'always'],
      '@stylistic/ts/semi': ['warn', 'always']
    }
  }
);
