#!/usr/bin/env -S node --no-warnings
require('dotenv').config();
const { ENDPOINTS_LIST_URI: endpointsListURI } = process.env;

const cuckoocert = require('./cuckoocert');
const checker = require('./checker');
const argv = require('yargs')
  // show help if no command given
  .demandCommand()
  .recommendCommands()
  .strict()
  .showHelpOnFail(true)
  .usage('Usage: $0 <command> [options]')
  .command(
    'show',
    'Show the list of endpoints to check',
    () => {},
    async argv => {
      if (argv.file) {
        const endpointsList = await cuckoocert.getEndpointsListFromFile(argv.file);
        console.log(endpointsList);
      } else {
        const endpointsList = await cuckoocert.getEndpointsListFromURI(endpointsListURI);
        console.log(endpointsList);
      }
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
    'Check the endpoints and either print result to STDOUT (default) or send it via Telegram (-t or --telegram)',
    () => {},
    async argv => {
      if (argv.telegram) {
        await cuckoocert.sendNotableEndpointsReportViaTelegram({ filePath: argv.file });
      } else {
        const report = await cuckoocert.makeNotableEndpointsReport({ filePath: argv.file });
        console.log(report);
      }
    },
  )
  .option('telegram', {
    alias: 't',
    type: 'boolean',
    description: 'Send report via Telegram',
  })
  .option('file', {
    alias: 'f',
    type: 'string',
    description: 'Get endpoints list from file rather than URL',
  })
  .help('h')
  .alias('h', 'help')
  .epilog('The End').argv;
