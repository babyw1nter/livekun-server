module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    'eslint-config-prettier',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  ignorePatterns: ['dist/*', 'config/*', 'data/*'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-undef': 'off',
    'no-unref': 'off',
    'no-var-requires': 'off',
    'no-unused-vars': 'off',
    'require-atomic-updates': 'off',
    'no-async-promise-executor': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  }
}
