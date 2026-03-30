'use strict';

const express  = require('express');
const { generatePost, generatePostFromContent } = require('../services/claude');
const { fetchImage }   = require('../services/unsplash');
const { postToPage }   = require('../services/facebook');
const { scrapeUrl }    = require('../services/scraper');

const router = express.Router();

// POST /api/generate
// Body: { topic: "..." }  OR  { url: "https://..." }
router.post('/generate', async (req, res) => {
  try {
    const { topic, url } = req.body;

    if (!topic && !url) {
      return res.status(400).json({ error: 'Provide either a topic or a URL.' });
    }

    let generated;

    if (url) {
      const articleText = await scrapeUrl(url);
      generated = await generatePostFromContent(articleText, url);
    } else {
      console.log('[Generate] Calling Claude...');
      generated = await generatePost(topic.trim());
      console.log('[Generate] Claude done. Calling Unsplash...');
    }

    const imageUrl = await fetchImage(generated.imageKeyword);
    console.log('[Generate] Unsplash done.');

    return res.json({
      caption:      generated.caption,
      imageKeyword: generated.imageKeyword,
      imageUrl,
    });
  } catch (err) {
    console.error('[API /generate]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/publish
// Body: { caption: "...", imageUrl: "https://..." }
router.post('/publish', async (req, res) => {
  try {
    const { caption, imageUrl } = req.body;

    if (!caption || !imageUrl) {
      return res.status(400).json({ error: 'caption and imageUrl are required.' });
    }

    const { postUrl } = await postToPage(caption, imageUrl);
    return res.json({ postUrl });
  } catch (err) {
    console.error('[API /publish]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
