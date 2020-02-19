const axios = require('axios');

const addHttps = url => {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = 'https://' + url;
  }
  return url;
};

const request = axios.create({
  timeout: 10000,
  method: 'HEAD',
  headers: { 'User-Agent': 'cuckoocert' },
  maxRedirects: 0,
  validateStatus: status => {
    return status >= 200 && status < 499;
  },
});

const getCertificate = async uri => {
  return await request(addHttps(uri)).then(response => {
    return response.request.socket.getPeerCertificate();
  });
};

const getCertificateExpiryDate = async uri => {
  return await request(addHttps(uri)).then(response => {
    return response.request.socket.getPeerCertificate().valid_to;
  });
};

module.exports = { getCertificateExpiryDate, getCertificate };
