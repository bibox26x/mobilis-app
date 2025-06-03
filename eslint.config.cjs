const js = require('@eslint/js');
const tseslint = require('@typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');
const expoConfig = require('@expo/config-plugins');


module.exports = expoConfig.withPlugins(
  [
    // Base configurations
    js.configs.recommended,
    ...tseslint.configs.recommended,
    
    // React and React Native specific
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: {
        'react': reactPlugin,
        'react-hooks': reactHooks,
        'react-native': reactNative
      },
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: require('@typescript-eslint/parser'),
        parserOptions: {
          ecmaFeatures: { jsx: true },
          project: './tsconfig.json',
        },
        globals: {
          ...require('globals').browser,
          __DEV__: 'readonly',
        },
      },
      rules: {
        // React
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/display-name': 'off',
        
        // React Hooks
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        
        // React Native
        'react-native/no-unused-styles': 'error',
        'react-native/no-inline-styles': 'warn',
        'react-native/no-color-literals': 'off',
        'react-native/no-raw-text': 'off',
        
        // TypeScript
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          }
        ],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        
        // General
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'warn',
        'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      // Ignore patterns
      ignores: [
        'node_modules',
        'expo-env.d.ts',
        '.expo',
        'dist',
        'build',
        '*.config.js',
        '**/__mocks__/*',
        '**/__tests__/*',
        '**/assets/**',
        '**/android/**',
        '**/ios/**',
        '**/web-build/**'
      ],
    }
  ],
  {
    expo: true,
    // Adjust based on your Expo SDK version
    expoVersion: '~49.0.0', // Update this to your Expo SDK version
    reactVersion: '18.2.0', // Match your React Native version
  }
);