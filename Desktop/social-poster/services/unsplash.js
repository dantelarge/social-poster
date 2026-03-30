'use strict';

const axios = require('axios');

async function fetchImage(keyword) {
  const res = await axios.get('https://api.unsplash.com/search/photos', {
    params: {
      query: keyword,
      per_page: 5,
      orientation: 'landscape',
    },
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    },
  });

  const photos = res.data.results;
  if (!photos || photos.length === 0) {
    throw new Error(`No Unsplash images found for keyword: "${keyword}"`);
  }

  // Pick a random photo from the first 5 results for variety
  const photo = photos[Math.floor(Math.random() * photos.length)];
  return photo.urls.full;
}

module.exports = { fetchImage };
