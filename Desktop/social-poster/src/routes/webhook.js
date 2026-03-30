'use strict';

const express    = require('express');
const { sendText }    = require('../services/whatsapp');
const { generatePost } = require('../services/claude');
const { fetchImage }   = require('../services/unsplash');
const { postToPage }   = require('../services/facebook');

const router = express.Router();

const HELP_TEXT = `*Social Poster Bot* 🤖

Commands:
• *post: [topic]* — generate and post to Facebook
  _Example: post: AI tools changing healthcare_

• *help* — show this message

Your post will be live on Facebook within ~15 seconds.`;

async function runPipeline(from, topic) {
  try {
    await sendText(from, `Generating your post about "${topic}"... ⏳`);

    // 1. Generate content with Claude
    const { caption, imageKeyword } = await generatePost(topic);

    // 2. Fetch image from Unsplash
    const imageUrl = await fetchImage(imageKeyword);

    // 3. Post to Facebook
    const { postUrl } = await postToPage(caption, imageUrl);

    await sendText(from, `✅ Posted to Facebook!\n\n${postUrl}`);
    console.log(`[Pipeline] Posted for topic "${topic}" — ${postUrl}`);
  } catch (err) {
    console.error('[Pipeline] Error:', err.message);
    await sendText(from, `❌ Something went wrong: ${err.message}\n\nPlease try again.`);
  }
}

// Webhook verification
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('[Webhook] Verified');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Incoming messages
router.post('/', async (req, res) => {
  res.sendStatus(200); // Always respond 200 immediately to Meta

  try {
    const entry    = req.body?.entry?.[0];
    const value    = entry?.changes?.[0]?.value;
    const messages = value?.messages;

    if (!messages || !messages.length) return;

    for (const msg of messages) {
      if (msg.type !== 'text') continue;

      const from = msg.from;
      const text = (msg.text?.body || '').trim();

      console.log(`[Webhook] Message from ${from}: ${text}`);

      const lower = text.toLowerCase();

      if (lower.startsWith('post:')) {
        const topic = text.slice(5).trim();
        if (!topic) {
          await sendText(from, 'Please provide a topic. Example:\npost: AI tools changing healthcare');
          continue;
        }
        runPipeline(from, topic); // fire and forget — do not await
      } else if (lower === 'help') {
        await sendText(from, HELP_TEXT);
      }
      // All other messages are silently ignored
    }
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
  }
});

module.exports = router;
