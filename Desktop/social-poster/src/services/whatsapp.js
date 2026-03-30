'use strict';

const axios = require('axios');

const BASE = 'https://graph.facebook.com/v21.0';

function normalizePhone(phone) {
  let p = String(phone).replace(/[\s\-\(\)\+]/g, '');
  if (p.startsWith('0') && p.length === 11) p = '234' + p.slice(1);
  return p;
}

async function sendText(to, message) {
  const phone = normalizePhone(to);
  try {
    const res = await axios.post(
      `${BASE}/${process.env.WA_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to:   phone,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization:  `Bearer ${process.env.WA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true, messageId: res.data.messages?.[0]?.id };
  } catch (err) {
    const error = err.response?.data?.error?.message || err.message;
    return { success: false, error };
  }
}

module.exports = { sendText, normalizePhone };
