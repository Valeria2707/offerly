const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const createEslintConfig = require('../../eslint.config.factory');

module.exports = createEslintConfig(tseslint, parser);
