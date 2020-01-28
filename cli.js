require('dotenv').config();
const main = require('./main');

main.lambdaEntryPoint().catch(console.log);
