'use strict';

const { getFlag, hasFlag } = require('../config');
const fmt = require('../format');

async function run(client, args, jsonMode) {
  const sub = args.find(a => !a.startsWith('-'));

  if (sub === 'update') {
    const vapidPublic = getFlag(args, 'vapid-public');
    const vapidPrivate = getFlag(args, 'vapid-private');
    const fcmKey = getFlag(args, 'fcm-key');
    const apnsKey = getFlag(args, 'apns-key');

    const payload = {};
    if (vapidPublic) payload.vapidPublicKey = vapidPublic;
    if (vapidPrivate) payload.vapidPrivateKey = vapidPrivate;
    if (fcmKey) payload.fcmKey = fcmKey;
    if (apnsKey) payload.apnsKey = apnsKey;

    const result = await client.updateChannels(payload);
    if (jsonMode) { fmt.json(result); return; }

    fmt.ok('Channel config updated');
    return;
  }

  // Default: show current channel config
  const result = await client.channels();
  if (jsonMode) { fmt.json(result); return; }

  const data = result.data || result;
  fmt.heading('Channel Config');
  fmt.keyValue({
    'VAPID Public': data.vapidPublicKey || '-',
    'VAPID Private': data.vapidPrivateKey ? '********' : '-',
    'FCM Key': data.fcmKey ? '********' : '-',
    'APNS Key': data.apnsKey ? '********' : '-',
  });
}

module.exports = { run };
