module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    es2021: true
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  rules: {
    'no-undef': 'off',
    'no-unref': 'off',
    'no-var-requires': 'off',
    'no-unused-vars': 'off',
    'require-atomic-updates': 'off',
    'no-async-promise-executor': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  }
}
