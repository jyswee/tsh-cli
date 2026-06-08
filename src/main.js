'use strict';

const { loadConfig, hasFlag } = require('./config');
const { api } = require('./api');
const fmt = require('./format');

const VERSION = require('../package.json').version;
const args = process.argv.slice(2);
const command = args[0];
const subArgs = args.slice(1);
const jsonMode = hasFlag(args, 'json');

// ── Version / Help ───────────────────────────────────────────────────
if (!command || hasFlag(args, 'help') || hasFlag(args, 'h')) {
  showHelp();
  process.exit(0);
}

if (hasFlag(args, 'version') || hasFlag(args, 'v') || command === '--version') {
  console.log(`tsh ${VERSION}`);
  process.exit(0);
}

// ── Load Config ──────────────────────────────────────────────────────
const config = loadConfig(args);
const NO_AUTH_COMMANDS = ['signup', 'login', 'logout', 'config', 'help', '--help', '--version'];

if (!NO_AUTH_COMMANDS.includes(command) && !config.apiKey) {
  fmt.err('No API key found. Run: tsh signup <project> --local');
  fmt.info('Or set TSH_API_KEY env var, or run: tsh login --key YOUR_KEY');
  process.exit(1);
}

const client = config.apiKey ? api(config) : null;

// ── Command Router ───────────────────────────────────────────────────
const handlers = {
  // Setup
  signup:   () => require('./commands/signup').run(subArgs, config.baseUrl),
  login:    () => require('./commands/auth').login(subArgs),
  logout:   () => require('./commands/auth').logout(subArgs),
  config:   () => require('./commands/auth').config(jsonMode, config),
  me:       () => require('./commands/auth').me(client, jsonMode),

  // Send
  send:     () => require('./commands/send').run(client, subArgs, jsonMode),
  'send-batch': () => require('./commands/send').batch(client, subArgs, jsonMode),

  // History & Stats
  history:  () => require('./commands/stats').history(client, subArgs, jsonMode),
  stats:    () => require('./commands/stats').stats(client, subArgs, jsonMode),

  // Devices
  devices:  () => require('./commands/devices').list(client, subArgs, jsonMode),
  device:   () => require('./commands/devices').run(client, subArgs, jsonMode),

  // Topics
  topics:   () => require('./commands/topics').list(client, subArgs, jsonMode),
  topic:    () => require('./commands/topics').run(client, subArgs, jsonMode),

  // Templates
  templates: () => require('./commands/templates').list(client, subArgs, jsonMode),
  template:  () => require('./commands/templates').run(client, subArgs, jsonMode),

  // Segments
  segments: () => require('./commands/segments').list(client, subArgs, jsonMode),
  segment:  () => require('./commands/segments').run(client, subArgs, jsonMode),

  // Campaigns
  campaigns: () => require('./commands/campaigns').list(client, subArgs, jsonMode),
  campaign:  () => require('./commands/campaigns').run(client, subArgs, jsonMode),

  // Channels
  channels: () => require('./commands/channels').run(client, subArgs, jsonMode),
};

if (handlers[command]) {
  Promise.resolve(handlers[command]()).catch(e => {
    fmt.err(e.message);
    process.exit(1);
  });
} else {
  fmt.err(`Unknown command: ${command}`);
  fmt.info('Run tsh --help for available commands');
  process.exit(1);
}

// ── Help ─────────────────────────────────────────────────────────────
function showHelp() {
  const { C } = fmt;
  console.log(`
${C.bold}tsh${C.reset} — Tygash CLI. Push notifications for coding agents.

${C.yellow}SETUP${C.reset}
  tsh signup <project> [--local]     Create tenant, get API key instantly
  tsh login [--key KEY] [--local]    Save API key
  tsh logout [--local]               Clear saved key
  tsh config                         Show active config + source
  tsh me                             Show tenant info (plan, limits)

${C.yellow}SEND${C.reset}
  tsh send "Title" --body "Message"                  Send notification
  tsh send "Title" --body "Msg" --topic <name>       Send to topic
  tsh send "Title" --body "Msg" --segment <id>       Send to segment
  tsh send "Title" --body "Msg" --channels web,ios   Specific channels
  tsh send-batch --file notifications.json           Batch from file

${C.yellow}HISTORY & STATS${C.reset}
  tsh history                        Recent notifications
  tsh history <notificationId>       Notification details
  tsh stats                          Delivery stats

${C.yellow}DEVICES${C.reset}
  tsh devices                        List devices
  tsh device register --platform web --token <tok>   Register
  tsh device <id>                    Show device
  tsh device update <id> --tags a,b  Update tags
  tsh device remove <id>             Unregister

${C.yellow}TOPICS${C.reset}
  tsh topics                         List topics
  tsh topic create "name" [--desc "..."]   Create
  tsh topic <id>                     Show topic
  tsh topic subscribe <id> --devices d1,d2   Subscribe
  tsh topic unsubscribe <id> --devices d1    Unsubscribe
  tsh topic delete <id>              Delete

${C.yellow}TEMPLATES${C.reset}
  tsh templates                      List templates
  tsh template create "name" --title "Hi {{name}}" --body "Welcome!"
  tsh template <id>                  Show template
  tsh template delete <id>           Delete

${C.yellow}SEGMENTS${C.reset}
  tsh segments                       List segments
  tsh segment create "name" --platform ios --active ">7d"
  tsh segment <id>                   Show segment
  tsh segment delete <id>            Delete

${C.yellow}CAMPAIGNS${C.reset}
  tsh campaigns                      List campaigns
  tsh campaign create "name" --template <id> --segment <id> [--at ISO]
  tsh campaign <id>                  Show campaign
  tsh campaign stats <id>            Campaign delivery stats
  tsh campaign delete <id>           Cancel

${C.yellow}CHANNELS${C.reset}
  tsh channels                       Show channel config (VAPID/APNs/FCM)
  tsh channels update --vapid-public KEY --vapid-private KEY

${C.yellow}FLAGS${C.reset}
  --json                             Output raw JSON
  --key KEY / -k KEY                 Override API key
  --base-url URL                     Override base URL
  --help / -h                        Show help
  --version / -v                     Show version

${C.dim}Config priority: --key flag > TSH_API_KEY env > .tsh/config.json (local) > ~/.tsh/config.json (global)${C.reset}
${C.dim}Docs: https://tygash.com/docs/quickstart.html | llms.txt: https://tygash.com/llms.txt${C.reset}
`);
}
