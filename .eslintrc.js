module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: [
      'filenames',
      'import',
      '@typescript-eslint/eslint-plugin'
    ],
    env: {
      es6: true,
      mocha: true,
      // Node is used in JAZ packages for HTTP API tests
      node: true,
    },
    rules: {
      'indent': 'off',
      'semi': 'off',
      'no-prototype-builtins': 'off',
      // Default no-shadow rule is not compatible with TypeScript sources
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // This rule has too much false positives and it will disabled per default on next
      // typescript-eslint release. See https://github.com/eslint/eslint/issues/11899 for
      // more details
      'require-atomic-updates': 'off',
      'import/extensions': ['error', 'never'],
      'brace-style': 'off',
    },
    overrides: [
      {
        files: ["*.ts"],
        rules: {
          "@typescript-eslint/explicit-function-return-type": ['error', {
            allowExpressions: true
          }],
          '@typescript-eslint/explicit-module-boundary-types': ['error']
        }
      }
    ]
  };
  