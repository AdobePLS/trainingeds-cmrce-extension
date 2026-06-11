/**
 * Ensures generated app-management actions are treated as ESM during webpack bundling.
 * @adobe/aio-commerce-lib-app emits import/export syntax; App Builder's webpack
 * defaults to CommonJS for .js files when the project uses "type": "commonjs".
 */
const fs = require('fs');
const path = require('path');

const ESM_PACKAGE = { type: 'module' };

const targets = [
  'src/commerce-extensibility-1/.generated/actions/app-management/package.json',
  'src/commerce-configuration-1/.generated/actions/app-management/package.json',
];

for (const target of targets) {
  const filePath = path.join(__dirname, '..', target);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(ESM_PACKAGE, null, 2)}\n`);
}
