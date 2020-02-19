const axios = require('axios');
const moment = require('moment');

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
    return new Date(response.request.socket.getPeerCertificate().valid_to);
  });
};

const getDaysToExpire = async uri => {
  const expiryDate = moment(await getCertificateExpiryDate(uri));
  return expiryDate.diff(moment(), 'days');
};

module.exports = { getCertificateExpiryDate, getCertificate, getDaysToExpire };
