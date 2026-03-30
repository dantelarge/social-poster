'use strict';

const axios = require('axios');

const APP_ID     = process.env.FB_APP_ID;
const APP_SECRET = process.env.FB_APP_SECRET;

// Refresh the Page token using the stored long-lived user token
async function refreshPageToken() {
  if (!APP_ID || !APP_SECRET) {
    console.warn('[TokenManager] FB_APP_ID or FB_APP_SECRET not set — skipping refresh');
    return;
  }

  const userToken = process.env.FB_LONG_LIVED_USER_TOKEN;
  if (!userToken) {
    console.warn('[TokenManager] FB_LONG_LIVED_USER_TOKEN not set — skipping refresh');
    return;
  }

  try {
    // Step 1: Exchange user token for a fresh long-lived user token
    const exchangeRes = await axios.get('https://graph.facebook.com/oauth/access_token', {
      params: {
        grant_type:        'fb_exchange_token',
        client_id:         APP_ID,
        client_secret:     APP_SECRET,
        fb_exchange_token: userToken,
      },
    });

    const longLivedToken = exchangeRes.data.access_token;

    // Step 2: Get the Page token from me/accounts
    const accountsRes = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
      params: {
        fields:       'access_token,name',
        access_token: longLivedToken,
      },
    });

    const pages = accountsRes.data.data;
    const page  = pages.find(p => p.id === process.env.FB_PAGE_ID) || pages[0];

    if (!page) {
      console.error('[TokenManager] No page found in me/accounts response');
      return;
    }

    // Update the token in memory so all subsequent requests use it
    process.env.FB_PAGE_ACCESS_TOKEN = page.access_token;
    process.env.FB_LONG_LIVED_USER_TOKEN = longLivedToken;

    console.log(`[TokenManager] Page token refreshed for "${page.name}"`);
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    console.error('[TokenManager] Token refresh failed:', detail);
  }
}

// Refresh on startup, then every 45 days
function startAutoRefresh() {
  // Delay first refresh by 10 seconds to let server fully start
  setTimeout(refreshPageToken, 10000);
  setInterval(refreshPageToken, 45 * 24 * 60 * 60 * 1000);
}

module.exports = { startAutoRefresh, refreshPageToken };
