'use strict';

const axios = require('axios');

const BASE = 'https://graph.facebook.com/v21.0';

async function postToPage(caption, imageUrl) {
  const pageId = process.env.FB_PAGE_ID;
  const token  = process.env.FB_PAGE_ACCESS_TOKEN;

  // Step 1: Upload the image as an unpublished photo to get a photo_id
  let uploadRes;
  try {
    uploadRes = await axios.post(
      `${BASE}/${pageId}/photos`,
      { url: imageUrl, published: false },
      { params: { access_token: token }, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    throw new Error(`Photo upload failed: ${detail}`);
  }

  const photoId = uploadRes.data.id;

  // Step 2: Create the feed post with the uploaded photo attached
  let postRes;
  try {
    postRes = await axios.post(
      `${BASE}/${pageId}/feed`,
      { message: caption, attached_media: [{ media_fbid: photoId }] },
      { params: { access_token: token }, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    throw new Error(`Feed post failed: ${detail}`);
  }

  const postId = postRes.data.id;
  const postUrl = `https://www.facebook.com/${postId.replace('_', '/posts/')}`;

  return { postId, postUrl };
}

module.exports = { postToPage };
