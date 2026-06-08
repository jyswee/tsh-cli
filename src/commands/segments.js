'use strict';

const { getFlag, hasFlag } = require('../config');
const fmt = require('../format');

async function list(client, args, jsonMode) {
  const result = await client.segments();
  if (jsonMode) { fmt.json(result); return; }

  const items = result.data || result;
  if (!Array.isArray(items) || !items.length) {
    fmt.info('No segments found');
    return;
  }

  fmt.heading('Segments');
  fmt.table(items.map(s => ({
    id: s.id,
    name: s.name || '-',
    deviceCount: String(s.deviceCount || 0),
  })));
}

async function run(client, args, jsonMode) {
  const sub = args.find(a => !a.startsWith('-'));

  if (!sub) {
    fmt.err('Usage: tsh segments <create|update|delete|ID>');
    process.exit(1);
  }

  if (sub === 'create') {
    const name = args.find(a => !a.startsWith('-') && a !== 'create');
    if (!name) { fmt.err('Usage: tsh segments create "name" [--platform web|ios|android] [--active ">7d"]'); process.exit(1); }

    const platform = getFlag(args, 'platform') || getFlag(args, 'p');
    const active = getFlag(args, 'active') || getFlag(args, 'a');
    const payload = { name };
    if (platform) payload.platform = platform;
    if (active) payload.active = active;

    const result = await client.createSegment(payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok('Segment created');
    const data = result.data || result;
    if (data.id) fmt.info(`  ID: ${data.id}`);
    return;
  }

  if (sub === 'update') {
    const id = args.find(a => !a.startsWith('-') && a !== 'update');
    if (!id) { fmt.err('Usage: tsh segments update <id> [--platform web|ios|android] [--active ">7d"]'); process.exit(1); }

    const platform = getFlag(args, 'platform') || getFlag(args, 'p');
    const active = getFlag(args, 'active') || getFlag(args, 'a');
    const payload = {};
    if (platform) payload.platform = platform;
    if (active) payload.active = active;

    const result = await client.updateSegment(id, payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Segment ${id} updated`);
    return;
  }

  if (sub === 'delete') {
    const id = args.find(a => !a.startsWith('-') && a !== 'delete');
    if (!id) { fmt.err('Usage: tsh segments delete <id>'); process.exit(1); }

    const result = await client.deleteSegment(id);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Segment ${id} deleted`);
    return;
  }

  // Default: treat sub as segment ID
  const result = await client.segment(sub);
  if (jsonMode) { fmt.json(result); return; }

  const data = result.data || result;
  fmt.heading('Segment Detail');
  fmt.keyValue({
    'ID': data.id || sub,
    'Name': data.name || '-',
    'Platform': data.platform || '-',
    'Active': data.active || '-',
    'Device Count': String(data.deviceCount || 0),
  });
}

module.exports = { list, run };
