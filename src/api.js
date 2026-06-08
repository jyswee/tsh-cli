'use strict';

function request(baseUrl, apiKey, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? require('https') : require('http');

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'tsh-cli/1.0.0',
      'Accept': 'application/json',
    };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const payload = body ? JSON.stringify(body) : null;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
      timeout: 30000,
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.error || parsed.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
          } else {
            resolve({ raw: data });
          }
        }
      });
    });

    req.on('error', (e) => reject(new Error(`Network error: ${e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout (30s)')); });
    if (payload) req.write(payload);
    req.end();
  });
}

function api(config) {
  const { baseUrl, apiKey } = config;
  const r = (method, path, body) => request(baseUrl, apiKey, method, path, body);
  const sdk = '/saas/api/v1/sdk';

  return {
    // Signup (no auth)
    signup: (data) => request(baseUrl, '', 'POST', '/api/signup', data),
    limits: () => request(baseUrl, '', 'GET', '/api/signup/limits'),

    // Send
    send: (data) => r('POST', `${sdk}/push/send`, data),
    sendBatch: (data) => r('POST', `${sdk}/push/send-batch`, data),

    // History & Stats
    history: (params) => r('GET', `${sdk}/push/history${params ? '?' + params : ''}`),
    notification: (id) => r('GET', `${sdk}/push/history/${id}`),
    stats: (params) => r('GET', `${sdk}/push/stats${params ? '?' + params : ''}`),

    // Devices
    devices: (params) => r('GET', `${sdk}/push/devices${params ? '?' + params : ''}`),
    device: (id) => r('GET', `${sdk}/push/devices/${id}`),
    registerDevice: (data) => r('POST', `${sdk}/push/devices/register`, data),
    updateDevice: (id, data) => r('PUT', `${sdk}/push/devices/${id}`, data),
    removeDevice: (id) => r('DELETE', `${sdk}/push/devices/${id}`),

    // Topics
    topics: (params) => r('GET', `${sdk}/push/topics${params ? '?' + params : ''}`),
    topic: (id) => r('GET', `${sdk}/push/topics/${id}`),
    createTopic: (data) => r('POST', `${sdk}/push/topics`, data),
    updateTopic: (id, data) => r('PUT', `${sdk}/push/topics/${id}`, data),
    deleteTopic: (id) => r('DELETE', `${sdk}/push/topics/${id}`),
    subscribeTopic: (id, data) => r('POST', `${sdk}/push/topics/${id}/subscribe`, data),
    unsubscribeTopic: (id, data) => r('POST', `${sdk}/push/topics/${id}/unsubscribe`, data),

    // Templates
    templates: (params) => r('GET', `${sdk}/push/templates${params ? '?' + params : ''}`),
    template: (id) => r('GET', `${sdk}/push/templates/${id}`),
    createTemplate: (data) => r('POST', `${sdk}/push/templates`, data),
    updateTemplate: (id, data) => r('PUT', `${sdk}/push/templates/${id}`, data),
    deleteTemplate: (id) => r('DELETE', `${sdk}/push/templates/${id}`),

    // Segments
    segments: (params) => r('GET', `${sdk}/push/segments${params ? '?' + params : ''}`),
    segment: (id) => r('GET', `${sdk}/push/segments/${id}`),
    createSegment: (data) => r('POST', `${sdk}/push/segments`, data),
    updateSegment: (id, data) => r('PUT', `${sdk}/push/segments/${id}`, data),
    deleteSegment: (id) => r('DELETE', `${sdk}/push/segments/${id}`),

    // Campaigns
    campaigns: (params) => r('GET', `${sdk}/push/campaigns${params ? '?' + params : ''}`),
    campaign: (id) => r('GET', `${sdk}/push/campaigns/${id}`),
    createCampaign: (data) => r('POST', `${sdk}/push/campaigns`, data),
    campaignStats: (id) => r('GET', `${sdk}/push/campaigns/${id}/stats`),
    updateCampaign: (id, data) => r('PUT', `${sdk}/push/campaigns/${id}`, data),
    deleteCampaign: (id) => r('DELETE', `${sdk}/push/campaigns/${id}`),

    // Channels
    channels: () => r('GET', `${sdk}/push/channels/config`),
    updateChannels: (data) => r('PUT', `${sdk}/push/channels/config`, data),

    // Health
    health: () => r('GET', `${sdk}/push/health`),
  };
}

module.exports = { api, request };
