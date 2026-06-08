'use strict';

const { getFlag, hasFlag } = require('../config');
const fmt = require('../format');

async function history(client, args, jsonMode) {
  const id = args.find(a => !a.startsWith('-'));

  if (id) {
    // Get specific notification by ID
    const result = await client.notification(id);
    if (jsonMode) { fmt.json(result); return; }

    const data = result.data || result;
    fmt.heading('Notification Detail');
    fmt.keyValue({
      'ID': data.id || id,
      'Title': data.title || '-',
      'Status': data.status || '-',
      'Total': String(data.total || 0),
      'Timestamp': data.timestamp || data.createdAt || '-',
    });
    return;
  }

  // List all history
  const result = await client.history();
  if (jsonMode) { fmt.json(result); return; }

  const items = result.data || result;
  if (!Array.isArray(items) || !items.length) {
    fmt.info('No history found');
    return;
  }

  fmt.heading('Notification History');
  fmt.table(items.map(n => ({
    id: n.id,
    title: n.title || '-',
    status: fmt.statusBadge(n.status || 'sent'),
    total: String(n.total || 0),
    timestamp: n.timestamp || n.createdAt || '-',
  })));
}

async function stats(client, args, jsonMode) {
  const result = await client.stats();
  if (jsonMode) { fmt.json(result); return; }

  const data = result.data || result;
  fmt.heading('Push Stats');
  fmt.keyValue({
    'Sent': String(data.sent || 0),
    'Delivered': String(data.delivered || 0),
    'Opened': String(data.opened || 0),
    'Clicked': String(data.clicked || 0),
    'Failed': String(data.failed || 0),
  });
}

module.exports = { history, stats };
