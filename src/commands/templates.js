'use strict';

const { getFlag, hasFlag } = require('../config');
const fmt = require('../format');

async function list(client, args, jsonMode) {
  const result = await client.templates();
  if (jsonMode) { fmt.json(result); return; }

  const items = result.data || result;
  if (!Array.isArray(items) || !items.length) {
    fmt.info('No templates found');
    return;
  }

  fmt.heading('Templates');
  fmt.table(items.map(t => ({
    id: t.id,
    name: t.name || '-',
  })));
}

async function run(client, args, jsonMode) {
  const sub = args.find(a => !a.startsWith('-'));

  if (!sub) {
    fmt.err('Usage: tsh templates <create|update|delete|ID>');
    process.exit(1);
  }

  if (sub === 'create') {
    const name = args.find(a => !a.startsWith('-') && a !== 'create');
    if (!name) { fmt.err('Usage: tsh templates create "name" --title "Title" --body "Body"'); process.exit(1); }

    const title = getFlag(args, 'title') || getFlag(args, 't');
    const body = getFlag(args, 'body') || getFlag(args, 'b');
    const payload = { name };
    if (title) payload.title = title;
    if (body) payload.body = body;

    const result = await client.createTemplate(payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok('Template created');
    const data = result.data || result;
    if (data.id) fmt.info(`  ID: ${data.id}`);
    return;
  }

  if (sub === 'update') {
    const id = args.find(a => !a.startsWith('-') && a !== 'update');
    if (!id) { fmt.err('Usage: tsh templates update <id> --title "Title" --body "Body"'); process.exit(1); }

    const title = getFlag(args, 'title') || getFlag(args, 't');
    const body = getFlag(args, 'body') || getFlag(args, 'b');
    const payload = {};
    if (title) payload.title = title;
    if (body) payload.body = body;

    const result = await client.updateTemplate(id, payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Template ${id} updated`);
    return;
  }

  if (sub === 'delete') {
    const id = args.find(a => !a.startsWith('-') && a !== 'delete');
    if (!id) { fmt.err('Usage: tsh templates delete <id>'); process.exit(1); }

    const result = await client.deleteTemplate(id);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok(`Template ${id} deleted`);
    return;
  }

  // Default: treat sub as template ID
  const result = await client.template(sub);
  if (jsonMode) { fmt.json(result); return; }

  const data = result.data || result;
  fmt.heading('Template Detail');
  fmt.keyValue({
    'ID': data.id || sub,
    'Name': data.name || '-',
    'Title': data.title || '-',
    'Body': data.body || '-',
  });
}

module.exports = { list, run };
