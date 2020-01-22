require('dotenv').config();
const sslChecker = require('ssl-checker');
const fs = require('fs');
const SocksProxy = require('socks5-https-client/lib/Agent');
const Telegram = require('telegraf/telegram');
const e = process.env;

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

const domainList = fs
  .readFileSync('domains.txt')
  .toString()
  .split('\n');

const checkDomains = domainList.map(async hostname => {
  const { daysRemaining } = await sslChecker(hostname);
  return {
    hostname,
    daysRemaining,
  };
});

module.exports.handler = async () => {
  await Promise.all(checkDomains).then(checkedDomains => {
    debugger;
    const expiringDomains = checkedDomains.filter(it => it.daysRemaining < expiryThreshold);
    console.log('Certificates about to expire: ', expiringDomains);
    debugger;
    return telegram.sendMessage(
      chatId,
      expiringDomains
        .map(element => `${element.hostname}: ${element.daysRemaining} days left`)
        .join('\n'),
    );
  });
};
