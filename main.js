const {
  DOMAIN_LIST_URI: domainListURI,
  EXPIRY_THRESHOLD: expiryThreshold,
  BOT_TOKEN: botToken,
  SOCKS_USERNAME: socksUsername,
  SOCKS_PASSWORD: socksPassword,
  SOCKS_HOST: socksHost,
  SOCKS_PORT: socksPort,
  CHAT_ID: chatId,
} = process.env;

const sslChecker = require('ssl-checker');
const SocksProxy = require('socks5-https-client/lib/Agent');
const Telegram = require('telegraf/telegram');
const axios = require('axios');

const telegram = new Telegram(botToken, {
  agent: new SocksProxy({
    socksUsername,
    socksPassword,
    socksHost,
    socksPort,
  }),
});

const getDomainListFromURL = async () => {
  return await axios.get(domainListURI).then(response => {
    return response.data.toString().split('\n');
  });
};

const getCheckDomainsPromises = async () => {
  const domainList = await getDomainListFromURL();
  return domainList.map(async hostname => {
    const host = hostname.split(':')[0] || hostname;
    const port = hostname.split(':')[1] || 443;
    try {
      const { daysRemaining } = await sslChecker(host, { method: 'HEAD', port: port });
      return {
        hostname,
        daysRemaining,
      };
    } catch (error) {
      console.log(`Hostname: ${host} \nport: ${port} \n${error}`);
      return {
        hostname,
        error,
      };
    }
  });
};

const lambdaEntryPoint = async () => {
  try {
    const checkDomainsPromises = await getCheckDomainsPromises();
    const checkedDomains = await Promise.all(checkDomainsPromises);
    const expiringDomains = checkedDomains.filter(
      it => it.error || it.daysRemaining < expiryThreshold,
    );
    if (expiringDomains.length > 0) {
      return await telegram.sendMessage(
        chatId,
        'SSL Certificates about to expire: \n\n' +
          expiringDomains
            .map(element =>
              element.error
                ? `\n${element.hostname}:\nError: ${element.error.message}\n`
                : `${element.hostname}: ${element.daysRemaining} days left`,
            )
            .join('\n'),
      );
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports.lambdaEntryPoint = lambdaEntryPoint;
