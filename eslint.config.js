import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// ESLint configuration for static code analysis of the React frontend
// Includes rules for React hooks usage, code quality, and security best practices
export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Code quality rules
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      // Security rules
      'no-script-url': 'error',
    },
  },
];
