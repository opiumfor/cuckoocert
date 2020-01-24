require('dotenv').config();
const sslChecker = require('ssl-checker');
const fs = require('fs');
const SocksProxy = require('socks5-https-client/lib/Agent');
const Telegram = require('telegraf/telegram');
const axios = require('axios');

const e = process.env;
const domainListURI = e.DOMAIN_LIST_URI;
const expiryThreshold = e.EXPIRY_THRESHOLD;
const botToken = e.BOT_TOKEN;

const telegram = new Telegram(botToken, {
  agent: new SocksProxy({
    socksUsername: e.SOCKS_USERNAME,
    socksPassword: e.SOCKS_PASSWORD,
    socksHost: e.SOCKS_HOST,
    socksPort: e.SOCKS_PORT,
  }),
});
const chatId = e.CHAT_ID;

const getDomainListFromURL = async () => {
  return await axios.get(domainListURI).then(response => {
    return response.data.toString().split('\n');
  });
};

const getCheckDomainsPromises = async () => {
  const domainList = await getDomainListFromURL();
  return domainList.map(async hostname => {
    const { daysRemaining } = await sslChecker(hostname);
    return {
      hostname,
      daysRemaining,
    };
  });
};

const lambdaEntryPoint = async () => {
  const checkDomainsPromises = await getCheckDomainsPromises();
  const checkedDomains = await Promise.all(checkDomainsPromises);
  const expiringDomains = checkedDomains.filter(it => it.daysRemaining < expiryThreshold);
  // console.log('Certificates about to expire: ', expiringDomains);
  return telegram.sendMessage(
    chatId,
    'SSL Certificates about to expire: \n\n' +
      expiringDomains
        .map(element => `${element.hostname}: ${element.daysRemaining} days left`)
        .join('\n'),
  );
};

module.exports.lambdaEntryPoint = lambdaEntryPoint;

// lambdaEntryPoint();
