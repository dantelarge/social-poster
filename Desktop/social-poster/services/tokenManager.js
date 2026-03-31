'use strict';

const axios = require('axios');

const APP_ID     = process.env.FB_APP_ID;
const APP_SECRET = process.env.FB_APP_SECRET;

let isRefreshing = false;

async function refreshPageToken() {
  if (isRefreshing) return;
  isRefreshing = true;

  if (!APP_ID || !APP_SECRET) {
    console.warn('[TokenManager] FB_APP_ID or FB_APP_SECRET not set — skipping refresh');
    isRefreshing = false;
    return;
  }

  const userToken = process.env.FB_LONG_LIVED_USER_TOKEN;
  if (!userToken) {
    console.warn('[TokenManager] FB_LONG_LIVED_USER_TOKEN not set — skipping refresh');
    isRefreshing = false;
    return;
  }

  try {
    // Step 1: Exchange for a fresh long-lived user token
    const exchangeRes = await axios.get('https://graph.facebook.com/oauth/access_token', {
      params: {
        grant_type:        'fb_exchange_token',
        client_id:         APP_ID,
        client_secret:     APP_SECRET,
        fb_exchange_token: userToken,
      },
    });

    const longLivedToken = exchangeRes.data.access_token;

    // Step 2: Get the Page token
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
      isRefreshing = false;
      return;
    }

    process.env.FB_PAGE_ACCESS_TOKEN     = page.access_token;
    process.env.FB_LONG_LIVED_USER_TOKEN = longLivedToken;

    console.log(`[TokenManager] Page token refreshed for "${page.name}"`);
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    console.error('[TokenManager] Token refresh failed:', detail);
  }

  isRefreshing = false;
}

function startAutoRefresh() {
  setTimeout(refreshPageToken, 10000);
  setInterval(refreshPageToken, 45 * 24 * 60 * 60 * 1000);
}

module.exports = { startAutoRefresh, refreshPageToken };
