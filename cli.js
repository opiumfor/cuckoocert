#!/usr/bin/env node
require('dotenv').config();
const { ENDPOINTS_LIST_URI: endpointsListURI } = process.env;

const cuckoocert = require('./cuckoocert');
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
