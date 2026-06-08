'use strict';

const { getFlag, hasFlag } = require('../config');
const fmt = require('../format');

async function list(client, args, jsonMode) {
  const result = await client.devices();
  if (jsonMode) { fmt.json(result); return; }

  const items = result.data || result;
  if (!Array.isArray(items) || !items.length) {
    fmt.info('No devices found');
    return;
  }

  fmt.heading('Devices');
  fmt.table(items.map(d => ({
    id: d.id,
    platform: d.platform || '-',
    status: fmt.statusBadge(d.status || 'inactive'),
    tags: Array.isArray(d.tags) ? d.tags.join(', ') : (d.tags || '-'),
  })));
}

async function run(client, args, jsonMode) {
  const sub = args.find(a => !a.startsWith('-'));

  if (!sub) {
    fmt.err('Usage: tsh devices <register|update|remove|ID>');
    process.exit(1);
  }

  if (sub === 'register') {
    const platform = getFlag(args, 'platform') || getFlag(args, 'p');
    const token = getFlag(args, 'token') || getFlag(args, 't');
    const tagsRaw = getFlag(args, 'tags');
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : undefined;

    if (!platform || !token) {
      fmt.err('Usage: tsh devices register --platform <web|ios|android> --token <push-token> [--tags "a,b"]');
      process.exit(1);
    }

    const payload = { platform, token };
    if (tags) payload.tags = tags;

    const result = await client.registerDevice(payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok('Device registered');
    const data = result.data || result;
    if (data.id) fmt.info(`  ID: ${data.id}`);
    return;
  }

  if (sub === 'update') {
    const id = args.find(a => !a.startsWith('-') && a !== 'update');
    if (!id) { fmt.err('Usage: tsh devices update <id> --tags "a,b"'); process.exit(1); }

    const tagsRaw = getFlag(args, 'tags');
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : undefined;
    const payload = {};
    if (tags) payload.tags = tags;

    const result = await client.updateDevice(id, payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Device ${id} updated`);
    return;
  }

  if (sub === 'remove') {
    const id = args.find(a => !a.startsWith('-') && a !== 'remove');
    if (!id) { fmt.err('Usage: tsh devices remove <id>'); process.exit(1); }

    const result = await client.removeDevice(id);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Device ${id} removed`);
    return;
  }

  // Default: treat sub as device ID
  const result = await client.device(sub);
  if (jsonMode) { fmt.json(result); return; }

  const data = result.data || result;
  fmt.heading('Device Detail');
  fmt.keyValue({
    'ID': data.id || sub,
    'Platform': data.platform || '-',
    'Status': data.status || '-',
    'Token': data.token || '-',
    'Tags': Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || '-'),
  });
}

module.exports = { list, run };
