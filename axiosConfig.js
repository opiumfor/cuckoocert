const axios = require('axios');
const connectTimeout = process.env.CONNECT_TIMEOUT || 4321;
const head = axios.create({
  timeout: connectTimeout,
  method: 'HEAD',
  headers: { 'User-Agent': 'cuckoocert' },
  maxRedirects: 0,
  validateStatus: status => {
    return status >= 200 && status < 499;
  },
});
const get = axios.create({
  timeout: connectTimeout,
  method: 'GET',
  headers: { 'User-Agent': 'cuckoocert' },
});

module.exports = { head, get };
