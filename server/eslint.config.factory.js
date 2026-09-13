module.exports = function createEslintConfig(tseslint, parser) {
  return [
    {
      files: ['src/**/*.ts', 'test/**/*.ts'],
      languageOptions: {
        parser,
        parserOptions: {
          project: './tsconfig.json',
          tsconfigRootDir: process.cwd()
        }
      },
      plugins: { '@typescript-eslint': tseslint },
      rules: {
        ...tseslint.configs.recommended.rules,
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'error'
      }
    }
  ];
};
