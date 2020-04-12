const Blockchain = require('../src/blockchain/blockchain')
const Block = require("../src/blockchain/block");
const TransactionPool = require("../src/wallet/transaction-pool");
const Wallet = require("../src/wallet/wallet");

let blockchain;
let transactionPool;
let wallet, icoWallet;

beforeEach(() => {
    blockchain = new Blockchain();
    transactionPool = new TransactionPool()
    icoWallet = new Wallet('pos blockchain app very first leader')
    wallet = new Wallet('test wallet')
});

describe('Blockchain', () => {
    describe('With passing data', () => {
        test('genesis block is valid', () => {
            expect(blockchain.chain[0]).toEqual(Block.genesis())
        })

        test('add transaction to pool', () => {
            let addedTransaction = icoWallet.createTransaction(wallet.getPublicKey(), 10, 'TRANSACTION', blockchain, transactionPool)

            expect(transactionPool.transactionExists(addedTransaction)).toBeTruthy();
        })

        test('add new block', () => {
            icoWallet.createTransaction(wallet.getPublicKey(), 10, 'TRANSACTION', blockchain, transactionPool)
            let transactions = transactionPool.validTransactions()
            let block = blockchain.createBlock(transactions, icoWallet)
            blockchain.addBlock(block)
            expect(blockchain.chain[1]).toEqual(block)
            expect(blockchain.isValidChain(blockchain.chain)).toBeTruthy()
        })

        test('replace chain with longer one', () => {
            let block = blockchain.createBlock([], icoWallet)
            blockchain.addBlock(block)
            let blockchain2 = new Blockchain()
            blockchain2.replaceChain(blockchain.chain)
            expect(blockchain2.chain).toBe(blockchain.chain)
        })
    })

    describe('With failing data', () => {
        test('genesis block is invalid', () => {
            expect(blockchain.chain[0]).not.toEqual(Block.genesis() + ' any change')
        })

        test('get invalid chain after adding invalid block', () => {
            icoWallet.createTransaction(wallet.getPublicKey(), 10, 'TRANSACTION', blockchain, transactionPool)
            let transactions = transactionPool.validTransactions()
            let block = Block.genesis()
            blockchain.addBlock(block)
            expect(blockchain.isValidChain(blockchain.chain)).toBeFalsy()
        })

        test('don\'t replace chain with shorter one', () => {
            let block = blockchain.createBlock([], icoWallet)
            blockchain.addBlock(block)
            let blockchain2 = new Blockchain()
            blockchain.replaceChain(blockchain2.chain)
            expect(blockchain.chain).not.toBe(blockchain2.chain)
        })
    })
})