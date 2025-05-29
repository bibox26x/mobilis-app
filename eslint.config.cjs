const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['**/dist/*', '**/node_modules/*', '.eslintrc.{js,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: require('@babel/eslint-parser'),
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        fetch: 'readonly',
        require: 'readonly',
        module: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        process: 'readonly',
        __DEV__: 'readonly',
        global: 'readonly',
        Promise: 'readonly',
      },
    },
    plugins: {
      'react': require('eslint-plugin-react'),
      'react-native': require('eslint-plugin-react-native')
    },
    rules: {
      'react-native/no-raw-text': [
        'error',
        {
          skip: ['Button', 'Pressable']
        }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'max-len': 'off',
      'semi': 'off',
      'comma-dangle': 'off',
      'quotes': 'off',
      'object-curly-spacing': 'off',
      'arrow-parens': 'off',
      'react/jsx-curly-spacing': 'off',
      'react/jsx-indent': 'off',
      'indent': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      'no-multiple-empty-lines': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
