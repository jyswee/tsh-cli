'use strict';

const { getFlag, hasFlag } = require('../config');
const fmt = require('../format');
const fs = require('fs');

async function run(client, args, jsonMode) {
  const title = args.find(a => !a.startsWith('-'));
  if (!title) {
    fmt.err('Usage: tsh send "Title" --body "Message" [--topic X] [--segment X] [--channels web,ios,android]');
    process.exit(1);
  }

  const body = getFlag(args, 'body') || getFlag(args, 'b') || '';
  const topic = getFlag(args, 'topic') || getFlag(args, 't');
  const segment = getFlag(args, 'segment') || getFlag(args, 's');
  const channelsRaw = getFlag(args, 'channels') || getFlag(args, 'c');
  const channels = channelsRaw ? channelsRaw.split(',').map(c => c.trim()) : ['web', 'ios', 'android'];

  const payload = { title, body, channels };
  if (topic) payload.topic = topic;
  if (segment) payload.target = { type: 'segment', segmentId: segment };

  const result = await client.send(payload);

  if (jsonMode) { fmt.json(result); return; }

  if (result.success === false) {
    fmt.err(result.message || 'Send failed');
  } else {
    fmt.ok(`Notification sent`);
    const data = result.data || result;
    if (data.id) fmt.info(`  ID: ${data.id}`);
    if (data.status) fmt.info(`  Status: ${fmt.statusBadge(data.status)}`);
    if (data.total) fmt.info(`  Delivered: ${data.total}`);
  }
}

async function batch(client, args, jsonMode) {
  const file = getFlag(args, 'file') || getFlag(args, 'f');
  if (!file) {
    fmt.err('Usage: tsh send-batch --file notifications.json');
    process.exit(1);
  }

  const raw = fs.readFileSync(file, 'utf8');
  const notifications = JSON.parse(raw);

  const result = await client.sendBatch({ notifications });

  if (jsonMode) { fmt.json(result); return; }

  fmt.ok(`Batch sent: ${notifications.length} notifications`);
}

module.exports = { run, batch };
