'use strict';

const { saveConfig, clearConfig, hasFlag, getFlag } = require('../config');
const fmt = require('../format');

async function login(args) {
  let key = getFlag(args, 'key') || getFlag(args, 'k');
  const local = hasFlag(args, 'local');
  const scope = local ? 'local' : 'global';

  if (!key) {
    const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    key = await new Promise(resolve => {
      rl.question('API key: ', answer => { rl.close(); resolve(answer.trim()); });
    });
  }

  if (!key) { fmt.err('No key provided'); process.exit(1); }

  const file = saveConfig({ apiKey: key }, scope);
  fmt.ok(`API key saved to ${file} (${scope})`);
}

function logout(args) {
  const local = hasFlag(args, 'local');
  const scope = local ? 'local' : 'global';
  const cleared = clearConfig(scope);
  if (cleared) fmt.ok(`Config cleared (${scope})`);
  else fmt.info(`No ${scope} config to clear`);
}

function config(jsonMode, cfg) {
  if (jsonMode) { fmt.json(cfg); return; }
  fmt.heading('Active Config');
  fmt.keyValue({
    'API Key': cfg.apiKey ? cfg.apiKey.substring(0, 20) + '...' : '(none)',
    'Base URL': cfg.baseUrl,
    'Source': cfg.source,
  });
}

async function me(client, jsonMode) {
  const data = await client.limits();
  if (jsonMode) { fmt.json(data); return; }
  fmt.heading('Tenant Info');
  if (data.plan) fmt.keyValue({ Plan: data.plan });
  if (data.limits) {
    fmt.keyValue({
      'Pushes/day': String(data.limits.pushesPerDay),
      'Channels': String(data.limits.channels),
      'Batch size': String(data.limits.batchSize),
      'History': data.limits.historyDays + ' days',
    });
  }
  if (data.plans) {
    fmt.heading('Available Plans');
    fmt.table(data.plans.map(p => ({
      id: p.id, price: p.price === 0 ? 'Free' : `$${p.price}/mo`,
      pushes: String(p.pushesPerDay), channels: String(p.channels),
    })));
  }
}

module.exports = { login, logout, config, me };
