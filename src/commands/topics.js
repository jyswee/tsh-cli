'use strict';

const { getFlag, hasFlag } = require('../config');
const fmt = require('../format');

async function list(client, args, jsonMode) {
  const result = await client.topics();
  if (jsonMode) { fmt.json(result); return; }

  const items = result.data || result;
  if (!Array.isArray(items) || !items.length) {
    fmt.info('No topics found');
    return;
  }

  fmt.heading('Topics');
  fmt.table(items.map(t => ({
    id: t.id,
    name: t.name || '-',
    subscribers: String(t.subscribers || t.subscriberCount || 0),
  })));
}

async function run(client, args, jsonMode) {
  const sub = args.find(a => !a.startsWith('-'));

  if (!sub) {
    fmt.err('Usage: tsh topics <create|subscribe|unsubscribe|delete|topicId>');
    process.exit(1);
  }

  if (sub === 'create') {
    const name = args.find(a => !a.startsWith('-') && a !== 'create');
    if (!name) { fmt.err('Usage: tsh topics create "name" [--desc "description"]'); process.exit(1); }

    const desc = getFlag(args, 'desc') || getFlag(args, 'd');
    const payload = { name };
    if (desc) payload.description = desc;

    const result = await client.createTopic(payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok('Topic created');
    const data = result.data || result;
    if (data.id) fmt.info(`  ID: ${data.id}`);
    return;
  }

  if (sub === 'subscribe') {
    const topicId = args.find(a => !a.startsWith('-') && a !== 'subscribe');
    if (!topicId) { fmt.err('Usage: tsh topics subscribe <topicId> --devices "id1,id2"'); process.exit(1); }

    const devicesRaw = getFlag(args, 'devices') || getFlag(args, 'd');
    const devices = devicesRaw ? devicesRaw.split(',').map(d => d.trim()) : [];

    const result = await client.subscribeTopic(topicId, { devices });
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Subscribed to topic ${topicId}`);
    return;
  }

  if (sub === 'unsubscribe') {
    const topicId = args.find(a => !a.startsWith('-') && a !== 'unsubscribe');
    if (!topicId) { fmt.err('Usage: tsh topics unsubscribe <topicId> --devices "id1,id2"'); process.exit(1); }

    const devicesRaw = getFlag(args, 'devices') || getFlag(args, 'd');
    const devices = devicesRaw ? devicesRaw.split(',').map(d => d.trim()) : [];

    const result = await client.unsubscribeTopic(topicId, { devices });
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Unsubscribed from topic ${topicId}`);
    return;
  }

  if (sub === 'delete') {
    const topicId = args.find(a => !a.startsWith('-') && a !== 'delete');
    if (!topicId) { fmt.err('Usage: tsh topics delete <topicId>'); process.exit(1); }

    const result = await client.deleteTopic(topicId);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Topic ${topicId} deleted`);
    return;
  }

  // Default: treat sub as topic ID
  const result = await client.topic(sub);
  if (jsonMode) { fmt.json(result); return; }

  const data = result.data || result;
  fmt.heading('Topic Detail');
  fmt.keyValue({
    'ID': data.id || sub,
    'Name': data.name || '-',
    'Description': data.description || '-',
    'Subscribers': String(data.subscribers || data.subscriberCount || 0),
  });
}

module.exports = { list, run };
