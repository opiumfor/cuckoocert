const SocksProxy = require('socks5-https-client/lib/Agent');
const Telegram = require('telegraf/telegram');
const axiosConfig = require('./axiosConfig');
const request = axiosConfig.get;
const checker = require('./checker');
const fs = require('fs').promises;
const {
  ENDPOINTS_LIST_URI: endpointsListURI,
  EXPIRY_THRESHOLD: expiryThreshold,
  BOT_TOKEN: botToken,
  SOCKS_USERNAME: socksUsername,
  SOCKS_PASSWORD: socksPassword,
  SOCKS_HOST: socksHost,
  SOCKS_PORT: socksPort,
  CHAT_ID: chatId,
} = process.env;

const telegram = new Telegram(botToken, {
  agent: new SocksProxy({
    socksUsername,
    socksPassword,
    socksHost,
    socksPort,
  }),
});

const getEndpointsListFromURI = async uri => {
  return await request(uri).then(response => {
    return response.data.toString().split('\n');
  });
};

const getEndpointsListFromFile = async filePath => {
  const endpoints = await fs.readFile(filePath, 'utf8');
  return endpoints.split('\n');
};

const checkEndpoints = async endpoints => {
  const checkedEndpoints = endpoints.map(async endpoint => {
    try {
      const daysRemaining = await checker.getDaysToExpire(endpoint);
      return {
        endpoint,
        daysRemaining,
      };
    } catch (error) {
      return {
        endpoint,
        error,
      };
    }
  });
  return Promise.all(checkedEndpoints);
};

const getNotableEndpoints = checkedEndpoints => {
  const notableEndpoints = checkedEndpoints.filter(
    endpoint => endpoint.error || endpoint.daysRemaining < expiryThreshold,
  );
  return notableEndpoints.length > 0 ? notableEndpoints : null;
};

const generateReport = endpoints => {
  return endpoints
    ? endpoints
        .map(endpoint => {
          return endpoint.error
            ? `\n${endpoint.endpoint}:\nError: ${endpoint.error.message}\n`
            : `${endpoint.endpoint}: ${endpoint.daysRemaining} days left`;
        })
        .join('\n')
    : null;
};

const makeNotableEndpointsReport = async ({ filePath } = {}) => {
  const endpointsList = filePath
    ? await getEndpointsListFromFile(filePath)
    : await getEndpointsListFromURI(endpointsListURI);
  const checkedEndpoints = await checkEndpoints(endpointsList);
  const notableEndpoints = getNotableEndpoints(checkedEndpoints);

  return generateReport(notableEndpoints);
};

const sendNotableEndpointsReportViaTelegram = async options => {
  const report = await makeNotableEndpointsReport(options);
  if (report) {
    await telegram.sendMessage(chatId, report);
    return 'report has been sent';
  } else {
    return 'nothing to send';
  }
};

module.exports = {
  sendNotableEndpointsReportViaTelegram,
  getEndpointsListFromURI,
  makeNotableEndpointsReport,
  getEndpointsListFromFile,
};
