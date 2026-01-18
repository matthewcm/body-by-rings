// Next.js ESLint configuration
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    ignores: ['dist/*', 'out/*', 'app-old/**', '.next/**', 'node_modules/**'],
  },
]);
