/**
 * Smoke-test: PostCSS (Tailwind) → react-native-css compile, same path Metro uses on native.
 */
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const { compile } = require('react-native-css/compiler');

const projectRoot = path.join(__dirname, '..');
const globalCss = path.join(projectRoot, 'src', 'global.css');
const input = fs.readFileSync(globalCss, 'utf8');

postcss([tailwind()])
  .process(input, { from: globalCss })
  .then((result) => {
    compile(result.css, {
      filename: globalCss,
      projectRoot,
      inlineVariables: false,
    });
    console.log('OK: global.css compiled (%d bytes postcss output)', result.css.length);
  })
  .catch((err) => {
    console.error('FAIL:', err.message);
    process.exit(1);
  });
