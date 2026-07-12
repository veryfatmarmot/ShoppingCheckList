const eslint = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const reactHooks = require('eslint-plugin-react-hooks');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/',
      'apps/mobile/android/',
      'apps/mobile/dist/',
      'apps/mobile/.expo/',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
  },
  {
    files: ['apps/mobile/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  prettier,
);
