'use strict';

const axios = require('axios');

async function scrapeUrl(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SocialPoster/1.0; +https://socialposter.app)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    timeout: 12000,
    maxRedirects: 5,
  });

  let html = String(res.data);

  // Strip blocks that never contain useful article text
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  html = html.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  html = html.replace(/<header[\s\S]*?<\/header>/gi, '');
  html = html.replace(/<aside[\s\S]*?<\/aside>/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // Strip remaining HTML tags
  html = html.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  html = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Collapse whitespace
  html = html.replace(/\s+/g, ' ').trim();

  if (html.length < 100) {
    throw new Error('Could not extract meaningful content from that URL. The page may require JavaScript or block bots.');
  }

  // Return first 4000 chars — enough context for Claude without blowing the token budget
  return html.slice(0, 4000);
}

module.exports = { scrapeUrl };
