require('dotenv').config();
const cuckoocert = require('./cuckoocert');

cuckoocert.checkEndpointsAndSendReport().catch(console.log);
