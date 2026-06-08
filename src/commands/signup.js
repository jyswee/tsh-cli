'use strict';

const { request } = require('../api');
const { saveConfig, hasFlag, getFlag } = require('../config');
const fmt = require('../format');

async function run(args, baseUrl) {
  const tenantId = args.find(a => !a.startsWith('-'));
  if (!tenantId) {
    fmt.err('Usage: tsh signup <project-slug> [--local]');
    fmt.info('Example: tsh signup my-agent --local');
    process.exit(1);
  }

  const local = hasFlag(args, 'local');
  const agent = getFlag(args, 'agent') || 'cli';
  const description = getFlag(args, 'desc') || getFlag(args, 'description');

  fmt.info(`Creating tenant "${tenantId}"...`);

  const result = await request(baseUrl, '', 'POST', '/api/signup', {
    tenantId,
    agent,
    description,
  });

  if (result.error) {
    fmt.err(result.message || result.error);
    process.exit(1);
  }

  // Auto-save key
  const scope = local ? 'local' : 'global';
  const file = saveConfig({ apiKey: result.apiKey, baseUrl }, scope);

  fmt.ok(`Tenant "${tenantId}" created!`);
  console.log();
  fmt.keyValue({
    'API Key': result.apiKey,
    'Plan': result.plan || 'free',
    'Pushes/day': String(result.limits?.pushesPerDay || 50),
    'Channels': String(result.limits?.channels || 3),
    'Saved to': `${file} (${scope})`,
  });
  console.log();
  fmt.info('Send your first push:');
  fmt.info('  tsh send "Hello" --body "First push" --channels web,ios,android');
}

module.exports = { run };
