const sslChecker = require('ssl-checker');
const SocksProxy = require('socks5-https-client/lib/Agent');
const Telegram = require('telegraf/telegram');
const axios = require('axios');
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
  return await axios.get(uri).then(response => {
    return response.data.toString().split('\n');
  });
};

const parseEndpointsList = endpointsList => {
  return endpointsList.map(endpoint => {
    const host = endpoint.split(':')[0] || endpoint;
    const port = endpoint.split(':')[1] || 443;
    return { host, port };
  });
};

const checkEndpoints = async endpoints => {
  const checkedEndpoints = endpoints.map(async endpoint => {
    try {
      const { daysRemaining } = await sslChecker(endpoint.host, {
        method: 'HEAD',
        port: endpoint.port,
      });
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

const getNoteworthyEndpoints = checkedEndpoints => {
  const noteworthyEndpoints = checkedEndpoints.filter(
    endpoint => endpoint.error || endpoint.daysRemaining < expiryThreshold,
  );
  return noteworthyEndpoints.length > 0 ? noteworthyEndpoints : null;
};

const generateReport = endpoints => {
  return endpoints
    ? endpoints
        .map(endpoint => {
          return endpoint.error
            ? `\n${endpoint.endpoint.host}:\nError: ${endpoint.error.message}\n`
            : `${endpoint.endpoint.host}: ${endpoint.daysRemaining} days left`;
        })
        .join('\n')
    : null;
};

const sendReportViaTelegram = async report => {
  try {
    return await telegram.sendMessage(chatId, report);
  } catch (error) {
    console.log(error);
  }
};

const checkEndpointsAndSendReport = async () => {
  const endpointsList = await getEndpointsListFromURI(endpointsListURI);
  const endpoints = parseEndpointsList(endpointsList);
  const checkedEndpoints = await checkEndpoints(endpoints);
  const noteworthyEndpoints = getNoteworthyEndpoints(checkedEndpoints);
  const report = generateReport(noteworthyEndpoints);

  return sendReportViaTelegram(report);
};

module.exports = { checkEndpointsAndSendReport, getEndpointsListFromURI };
