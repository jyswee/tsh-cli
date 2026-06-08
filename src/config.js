'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const GLOBAL_DIR = path.join(os.homedir(), '.tsh');
const GLOBAL_CONFIG = path.join(GLOBAL_DIR, 'config.json');
const LOCAL_DIR = '.tsh';
const LOCAL_CONFIG = path.join(LOCAL_DIR, 'config.json');
const DEFAULT_BASE_URL = 'https://tygash.com';

function getFlag(args, name) {
  const flags = [`--${name}`, `-${name[0]}`];
  for (let i = 0; i < args.length; i++) {
    if (flags.includes(args[i]) && args[i + 1]) return args[i + 1];
  }
  return null;
}

function hasFlag(args, name) {
  return args.includes(`--${name}`) || args.includes(`-${name[0]}`);
}

function loadFileConfig(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function loadConfig(args) {
  const keyFlag = getFlag(args, 'key') || getFlag(args, 'k');
  const baseFlag = getFlag(args, 'base-url');

  const globalFile = loadFileConfig(GLOBAL_CONFIG);
  const localFile = loadFileConfig(LOCAL_CONFIG);

  const apiKey = keyFlag
    || process.env.TSH_API_KEY
    || process.env.TYGASH_API_KEY
    || localFile.apiKey
    || globalFile.apiKey
    || null;

  const baseUrl = baseFlag
    || process.env.TSH_BASE_URL
    || process.env.TYGASH_BASE_URL
    || localFile.baseUrl
    || globalFile.baseUrl
    || DEFAULT_BASE_URL;

  let source = 'none';
  if (keyFlag) source = 'flag';
  else if (process.env.TSH_API_KEY || process.env.TYGASH_API_KEY) source = 'env';
  else if (localFile.apiKey) source = `local (${LOCAL_CONFIG})`;
  else if (globalFile.apiKey) source = `global (${GLOBAL_CONFIG})`;

  return { apiKey, baseUrl, source };
}

function saveConfig(data, scope) {
  const dir = scope === 'local' ? LOCAL_DIR : GLOBAL_DIR;
  const file = scope === 'local' ? LOCAL_CONFIG : GLOBAL_CONFIG;

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const existing = loadFileConfig(file);
  const merged = { ...existing, ...data };
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + '\n');
  return file;
}

function clearConfig(scope) {
  const file = scope === 'local' ? LOCAL_CONFIG : GLOBAL_CONFIG;
  try {
    fs.unlinkSync(file);
    return true;
  } catch {
    return false;
  }
}

module.exports = { loadConfig, saveConfig, clearConfig, getFlag, hasFlag, DEFAULT_BASE_URL };
