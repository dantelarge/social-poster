'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

function parseJson(raw) {
  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleaned);
}

async function generatePost(topic) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a social media manager for a Tech/AI page on Facebook.
Generate a Facebook post about this topic: "${topic}"

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "caption": "the full post text here (150-250 words, engaging, with line breaks for readability)",
  "hashtags": "#HashOne #HashTwo #HashThree #HashFour #HashFive #HashSix #HashSeven #HashEight",
  "imageKeyword": "one short search term for Unsplash (e.g. artificial intelligence)"
}

Rules:
- Caption should be conversational and insightful, not salesy
- End caption with a question to drive engagement
- Hashtags should be relevant to Tech/AI and the specific topic
- imageKeyword must be 1-3 words only`,
      },
    ],
  });

  const raw = message.content[0].text.trim();
  const parsed = parseJson(raw);

  return {
    caption: `${parsed.caption}\n\n${parsed.hashtags}`,
    imageKeyword: parsed.imageKeyword,
  };
}

async function generatePostFromContent(articleText, sourceUrl) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a social media manager for a Tech/AI page on Facebook.
A user has shared an article. Read the content and write a compelling Facebook post about it.

Article URL: ${sourceUrl}
Article content:
"""
${articleText}
"""

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "caption": "the full post text here (150-250 words, engaging, with line breaks for readability)",
  "hashtags": "#HashOne #HashTwo #HashThree #HashFour #HashFive #HashSix #HashSeven #HashEight",
  "imageKeyword": "one short search term for Unsplash (e.g. artificial intelligence)"
}

Rules:
- Summarise the article's key insight in your own words — don't just copy sentences
- Caption should be conversational and insightful, not salesy
- End caption with a question to drive engagement
- Hashtags should be relevant to Tech/AI and the specific topic
- imageKeyword must be 1-3 words only`,
      },
    ],
  });

  const raw = message.content[0].text.trim();
  const parsed = parseJson(raw);

  return {
    caption: `${parsed.caption}\n\n${parsed.hashtags}`,
    imageKeyword: parsed.imageKeyword,
  };
}

module.exports = { generatePost, generatePostFromContent };
