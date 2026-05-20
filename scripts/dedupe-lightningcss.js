/**
 * react-native-css resolves lightningcss from @expo/metro-config first.
 * Nested copies >1.30.1 break Android bundling (lightningcss deserialize regression).
 * Bun overrides do not always dedupe this nested install — remove it so resolution uses root 1.30.1.
 */
const fs = require('fs');
const path = require('path');

const PINNED = '1.30.1';
const nestedDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'metro-config',
  'node_modules',
  'lightningcss'
);
const pkgPath = path.join(nestedDir, 'package.json');

if (!fs.existsSync(pkgPath)) {
  process.exit(0);
}

let version;
try {
  version = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
} catch {
  process.exit(0);
}

if (version === PINNED) {
  process.exit(0);
}

fs.rmSync(nestedDir, { recursive: true, force: true });
console.warn(
  `[postinstall] Removed nested lightningcss@${version} under @expo/metro-config (use root ${PINNED} for NativeWind)`
);
