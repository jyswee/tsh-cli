#!/usr/bin/env node
/**
 * Build script — obfuscates src/ into dist/ with strong protection.
 * Pattern: bgz-cli/scripts/build.js (javascript-obfuscator)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// All source files to obfuscate
const files = [
  'main.js',
  'api.js',
  'config.js',
  'format.js',
  'commands/auth.js',
  'commands/signup.js',
  'commands/send.js',
  'commands/devices.js',
  'commands/topics.js',
  'commands/templates.js',
  'commands/segments.js',
  'commands/campaigns.js',
  'commands/stats.js',
  'commands/channels.js',
];

// Ensure dist directories exist
const distDir = path.join(__dirname, '..', 'dist');
const distCmds = path.join(distDir, 'commands');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
if (!fs.existsSync(distCmds)) fs.mkdirSync(distCmds, { recursive: true });

const flags = [
  '--compact true',
  '--control-flow-flattening true',
  '--control-flow-flattening-threshold 0.75',
  '--dead-code-injection true',
  '--dead-code-injection-threshold 0.4',
  '--string-array true',
  '--string-array-encoding rc4',
  '--string-array-threshold 1',
  '--string-array-rotate true',
  '--string-array-shuffle true',
  '--string-array-wrappers-count 2',
  '--string-array-wrappers-type function',
  '--rename-globals true',
  '--rename-properties false',
  '--self-defending false',
  '--identifier-names-generator hexadecimal',
  '--numbers-to-expressions true',
  '--simplify true',
  '--split-strings true',
  '--split-strings-chunk-length 5',
  '--transform-object-keys true',
  '--unicode-escape-sequence true',
  '--target node',
].join(' ');

console.log('Building tsh CLI...');
for (const file of files) {
  const src = path.join(__dirname, '..', 'src', file);
  const out = path.join(distDir, file);
  console.log(`  Obfuscating ${file}...`);
  execSync(`javascript-obfuscator ${src} --output ${out} ${flags}`, { stdio: 'inherit' });
}

console.log('Build complete.');
