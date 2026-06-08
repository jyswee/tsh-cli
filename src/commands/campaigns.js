'use strict';

const { getFlag, hasFlag } = require('../config');
const fmt = require('../format');

async function list(client, args, jsonMode) {
  const result = await client.campaigns();
  if (jsonMode) { fmt.json(result); return; }

  const items = result.data || result;
  if (!Array.isArray(items) || !items.length) {
    fmt.info('No campaigns found');
    return;
  }

  fmt.heading('Campaigns');
  fmt.table(items.map(c => ({
    id: c.id,
    name: c.name || '-',
    status: fmt.statusBadge(c.status || 'scheduled'),
    scheduledAt: c.scheduledAt || '-',
  })));
}

async function run(client, args, jsonMode) {
  const sub = args.find(a => !a.startsWith('-'));

  if (!sub) {
    fmt.err('Usage: tsh campaigns <create|stats|delete|ID>');
    process.exit(1);
  }

  if (sub === 'create') {
    const name = args.find(a => !a.startsWith('-') && a !== 'create');
    if (!name) { fmt.err('Usage: tsh campaigns create "name" --template <id> --segment <id> [--at "ISO date"]'); process.exit(1); }

    const template = getFlag(args, 'template') || getFlag(args, 't');
    const segment = getFlag(args, 'segment') || getFlag(args, 's');
    const at = getFlag(args, 'at') || getFlag(args, 'a');
    const payload = { name };
    if (template) payload.templateId = template;
    if (segment) payload.segmentId = segment;
    if (at) payload.scheduledAt = at;

    const result = await client.createCampaign(payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok('Campaign created');
    const data = result.data || result;
    if (data.id) fmt.info(`  ID: ${data.id}`);
    return;
  }

  if (sub === 'stats') {
    const id = args.find(a => !a.startsWith('-') && a !== 'stats');
    if (!id) { fmt.err('Usage: tsh campaigns stats <id>'); process.exit(1); }

    const result = await client.campaignStats(id);
    if (jsonMode) { fmt.json(result); return; }

    const data = result.data || result;
    fmt.heading(`Campaign Stats (${id})`);
    fmt.keyValue({
      'Sent': String(data.sent || 0),
      'Delivered': String(data.delivered || 0),
      'Opened': String(data.opened || 0),
      'Clicked': String(data.clicked || 0),
      'Failed': String(data.failed || 0),
    });
    return;
  }

  if (sub === 'delete') {
    const id = args.find(a => !a.startsWith('-') && a !== 'delete');
    if (!id) { fmt.err('Usage: tsh campaigns delete <id>'); process.exit(1); }

    const result = await client.deleteCampaign(id);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Campaign ${id} deleted`);
    return;
  }

  // Default: treat sub as campaign ID
  const result = await client.campaign(sub);
  if (jsonMode) { fmt.json(result); return; }

  const data = result.data || result;
  fmt.heading('Campaign Detail');
  fmt.keyValue({
    'ID': data.id || sub,
    'Name': data.name || '-',
    'Status': data.status || '-',
    'Template': data.templateId || '-',
    'Segment': data.segmentId || '-',
    'Scheduled At': data.scheduledAt || '-',
  });
}

module.exports = { list, run };
