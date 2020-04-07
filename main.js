const express = require('express');
const Blockchain = require('./src/blockchain/blockchain');
const bodyParser = require('body-parser');

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3000;

//create a new app
const app = express();

//using the blody parser middleware
app.use(bodyParser.json());

// create a new blockchain instance
const blockchain = new Blockchain();








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