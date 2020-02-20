const axiosConfig = require('./axiosConfig');
const request = axiosConfig.head;
const moment = require('moment');

const addHttps = url => {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = 'https://' + url;
  }
  return url;
};

const getCertificate = async uri => {
  return await request(addHttps(uri)).then(response => {
    return response.request.socket.getPeerCertificate();
  });
};

const getCertificateExpiryDate = async uri => {
  const certificate = await getCertificate(uri);
  return new Date(certificate.valid_to);
};

const getDaysToExpire = async uri => {
  const expiryDate = moment(await getCertificateExpiryDate(uri));
  return expiryDate.diff(moment(), 'days');
};

module.exports = { getCertificateExpiryDate, getCertificate, getDaysToExpire };
