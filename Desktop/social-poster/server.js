'use strict';

require('dotenv').config();

const path    = require('path');
const express = require('express');
const webhook = require('./routes/webhook');
const api     = require('./routes/api');
const { startAutoRefresh } = require('./services/tokenManager');

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/webhook', webhook);
app.use('/api', api);

app.listen(PORT, () => {
  console.log(`[Server] Social Poster running on port ${PORT}`);
  console.log(`[Debug] ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`[Debug] FB_PAGE_ID: ${process.env.FB_PAGE_ID ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`[Debug] UNSPLASH_ACCESS_KEY: ${process.env.UNSPLASH_ACCESS_KEY ? 'FOUND' : 'NOT FOUND'}`);
  startAutoRefresh();
});
