// @ts-check

import eslint from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  globalIgnores(['dist/'], 'Ignore build directory.'),
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
      '@stylistic': stylistic
    },
    rules: {
      indent: ['warn', 2],
      quotes: ['warn', 'single', { avoidEscape: true }],
      '@stylistic/object-curly-spacing': ['warn', 'always']
    }
  }
);
