const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./src/blockchain/blockchain');
const P2pServer = require('./src/p2p/server');

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3000;

//create a new app
const app = express();

//using the blody parser middleware
app.use(bodyParser.json());

// create a new blockchain instance
const blockchain = new Blockchain();

const p2pServer = new P2pServer(blockchain);

p2pServer.listen();








/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

/**
 * Get full chain
 */
app.get('/chain', (req, res) => {
    res.json(blockchain.chain);
});

app.listen(HTTP_PORT, () => {
    console.log(`listening on port ${HTTP_PORT}`);
})