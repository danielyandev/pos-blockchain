const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./src/blockchain/blockchain');
const P2pServer = require('./src/p2p/server');
const Wallet = require('./src/wallet/wallet');
const TransactionPool = require('./src/wallet/transaction-pool');

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3000;

//create a new app
const app = express();

//using the body parser middleware
app.use(bodyParser.json());

// create a new blockchain instance
const blockchain = new Blockchain();

// create a new wallet
const wallet = new Wallet(Date.now().toString());

// create a new transaction pool
const transactionPool = new TransactionPool();

// create a new p2p server instance
const p2pServer = new P2pServer(blockchain, transactionPool);


/*
|--------------------------------------------------------------------------
| Listen to peers
|--------------------------------------------------------------------------
*/
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

/**
 * Get transactions in the pool
 */
app.get('/transactions', (req, res) => {
    res.json(transactionPool.transactions);
});

/**
 * Create transaction
 */
app.post("/transact", (req, res) => {
    const {to, amount, type} = req.body;
    const transaction = wallet.createTransaction(
        to,
        amount,
        type,
        blockchain,
        transactionPool
    );
    p2pServer.broadcastTransaction(transaction);
    res.json(transaction);
});

app.listen(HTTP_PORT, () => {
    console.log(`listening on port ${HTTP_PORT}`);
})