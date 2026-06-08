'use strict';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  orange: '\x1b[38;5;208m',
};

function ok(msg) { console.log(`${C.green}\u2713${C.reset} ${msg}`); }
function err(msg) { console.error(`${C.red}\u2717${C.reset} ${msg}`); }
function warn(msg) { console.log(`${C.yellow}!${C.reset} ${msg}`); }
function info(msg) { console.log(`${C.dim}${msg}${C.reset}`); }

function pad(str, len) {
  str = String(str);
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

function heading(text) {
  console.log(`\n${C.bold}${text}${C.reset}`);
}

function table(rows, headers) {
  if (!rows.length) { info('  (none)'); return; }
  const cols = headers || Object.keys(rows[0]);
  const widths = cols.map(c => Math.max(c.length, ...rows.map(r => String(r[c] || '').length)));

  console.log('  ' + cols.map((c, i) => `${C.dim}${pad(c.toUpperCase(), widths[i])}${C.reset}`).join('  '));
  rows.forEach(r => {
    console.log('  ' + cols.map((c, i) => pad(String(r[c] || '-'), widths[i])).join('  '));
  });
}

function json(data) { console.log(JSON.stringify(data, null, 2)); }

function keyValue(obj) {
  Object.entries(obj).forEach(([k, v]) => {
    console.log(`  ${C.dim}${pad(k, 16)}${C.reset} ${v}`);
  });
}

function statusBadge(status) {
  const colors = {
    sent: C.green, delivered: C.green, opened: C.cyan,
    clicked: C.blue, failed: C.red, queued: C.yellow,
    active: C.green, inactive: C.gray, scheduled: C.yellow,
  };
  const color = colors[status] || C.gray;
  return `${color}${status}${C.reset}`;
}

function channelBadge(ch) {
  const colors = { web: C.blue, ios: C.white, android: C.green };
  return `${colors[ch] || C.gray}${ch}${C.reset}`;
}

module.exports = { C, ok, err, warn, info, pad, heading, table, json, keyValue, statusBadge, channelBadge };
