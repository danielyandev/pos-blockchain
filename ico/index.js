const express = require("express");
const Blockchain = require("../src/blockchain/blockchain");
const bodyParser = require("body-parser");
const P2pserver = require("../src/p2p/server");
const Wallet = require("../src/wallet/wallet");
const TransactionPool = require("../src/wallet/transaction-pool");
const { TRANSACTION_THRESHOLD } = require("../config");

const HTTP_PORT = 3000;

const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();
const wallet = new Wallet("pos blockchain app very first leader");

const transactionPool = new TransactionPool();
const p2pserver = new P2pserver(blockchain, transactionPool, wallet);

app.get("/ico/transactions", (req, res) => {
    res.json(transactionPool.transactions);
});

app.get("/ico/blocks", (req, res) => {
    res.json(blockchain.chain);
});

app.post("/ico/transact", (req, res) => {
    const { to, amount, type } = req.body;
    const transaction = wallet.createTransaction(
        to,
        amount,
        type,
        blockchain,
        transactionPool
    );
    if (transaction){
        p2pserver.broadcastTransaction(transaction);
        res.json(transaction);
    }else{
        res.json({"error": "Transaction was not transfered"})
    }
});

app.get("/ico/public-key", (req, res) => {
    res.json({ publicKey: wallet.publicKey });
});

app.get("/ico/balance", (req, res) => {
    res.json({ balance: blockchain.getBalance(wallet.publicKey) });
});

app.post("/ico/balance-of", (req, res) => {
    res.json({ balance: blockchain.getBalance(req.body.publicKey) });
});

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});

p2pserver.listen();