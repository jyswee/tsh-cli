# tsh — Tygash CLI

Push notifications for coding agents. Zero friction.

## Install

```bash
npm install -g tygash
```

Or use without installing:

```bash
npx tygash signup my-agent --local
npx tygash send "Hello" --body "First push"
```

## Quick Start

```bash
# 1. Sign up (instant API key, no email/password/CC)
tsh signup my-agent --local

# 2. Send your first push
tsh send "Hello" --body "Your first push notification" --channels web,ios,android

# Done. Two commands.
```

## Commands

### Setup
```bash
tsh signup <project> [--local]       # Create tenant, get API key
tsh login [--key KEY] [--local]      # Save API key
tsh logout [--local]                 # Clear saved key
tsh config                           # Show active config
tsh me                               # Show plan and limits
```

### Send
```bash
tsh send "Title" --body "Message"                    # Send to all
tsh send "Title" --body "Msg" --topic price-alerts   # Send to topic
tsh send "Title" --body "Msg" --segment active-ios   # Send to segment
tsh send "Title" --body "Msg" --channels web,ios     # Specific channels
```

### Devices
```bash
tsh devices                                          # List
tsh device register --platform web --token <token>   # Register
tsh device <id>                                      # Show
tsh device remove <id>                               # Unregister
```

### Topics
```bash
tsh topics                                           # List
tsh topic create "price-alerts" --desc "Price drops"  # Create
tsh topic subscribe <id> --devices dev1,dev2          # Subscribe
```

### Stats
```bash
tsh stats                            # Delivery rates
tsh history                          # Recent notifications
```

### More
```bash
tsh templates                        # List templates
tsh segments                         # List segments
tsh campaigns                        # List campaigns
tsh channels                         # Show channel config
tsh --help                           # Full reference
```

## Config

API key resolution (git-style priority):

1. `--key` flag
2. `TSH_API_KEY` env var
3. `TYGASH_API_KEY` env var
4. `.tsh/config.json` (project-scoped)
5. `~/.tsh/config.json` (global)

## Agent Integration

Add to your `CLAUDE.md`, `.cursorrules`, `.clinerules`, or `.windsurfrules`:

```
## Push Notifications (Tygash)
Use the tsh CLI for push notifications. Key is in .tsh/config.json (auto-loaded).
- tsh send "Title" --body "Message" --topic topic-name
- tsh devices (list), tsh device register --platform web --token TOKEN
- tsh topics (list), tsh topic create "name"
- tsh stats (delivery rates)
- tsh --help for full reference
```

## JSON Mode

Every command supports `--json` for machine-readable output:

```bash
tsh stats --json | jq '.delivered'
tsh devices --json | jq '.[].platform'
```

## Links

- Docs: https://tygash.com/docs/quickstart.html
- llms.txt: https://tygash.com/llms.txt
- Dashboard: https://tygash.com/dashboardv2

## License

Copyright (c) 2026 Tyga.Cloud Ltd. All rights reserved. See [LICENSE](LICENSE) for details.

This software is provided for use with the Tygash platform. Reverse-engineering, decompilation, redistribution, and creation of derivative works are prohibited. Full terms: https://tygash.com/terms
