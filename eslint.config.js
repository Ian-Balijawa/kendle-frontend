import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      'unused-imports': unusedImports,
    },
    rules: {
      // 🚀 Auto-remove unused imports & vars
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off', // disable noise
      '@typescript-eslint/no-non-null-assertion': 'off', // disable noise
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/no-unescaped-entities': 'off', // disable noise

      // General JS
      'no-console': 'off', // keep logs allowed
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'coverage/**',
      '.vite/**',
    ],
  },
];
