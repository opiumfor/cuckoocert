#!/usr/bin/env node
require('dotenv').config();
const { ENDPOINTS_LIST_URI: endpointsListURI } = process.env;

const cuckoocert = require('./cuckoocert');
const checker = require('./checker');
const argv = require('yargs')
  // show help if no command given
  .demandCommand(1, '')
  .usage('Usage: $0 <command> [options]')
  .command(
    'show',
    'Show the list of endpoints to check',
    () => {},
    async argv => {
      const endpointsList = await cuckoocert.getEndpointsListFromURI(endpointsListURI);
      console.log(endpointsList);
    },
  )
  .command(
    'when <uri>',
    'Show expiry date for single endpoint',
    () => {},
    async argv => {
      const expiryDate = await checker.getCertificateExpiryDate(argv.uri);
      console.log(expiryDate);
    },
  )
  .command(
    'days <uri>',
    'Show days to expire for single endpoint',
    () => {},
    async argv => {
      const expiryDate = await checker.getDaysToExpire(argv.uri);
      console.log(expiryDate);
    },
  )
  .command(
    'cert <uri>',
    'Show certificate info for single endpoint',
    () => {},
    async argv => {
      const certificate = await checker.getCertificate(argv.uri);
      console.log(certificate);
    },
  )
  .command(
    'check',
    'Check the endpoints and either print result to STDOUT (default) or send it via Telegram',
    () => {},
    argv => {
      if (argv.telegram) {
        cuckoocert.sendNotableEndpointsReportViaTelegram().catch(console.log);
      } else {
        cuckoocert.makeNotableEndpointsReport().then(console.log);
      }
    },
  )
  .option('telegram', {
    alias: 't',
    type: 'boolean',
    description: 'Send report via Telegram',
  })
  .help('h')
  .alias('h', 'help')
  .epilog('The End').argv;
