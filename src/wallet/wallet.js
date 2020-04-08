const Helper = require("../helpers/helper");
const Transaction = require("./transaction");

class Wallet {
    constructor(secret) {
        this.balance = 100;
        this.keyPair = Helper.generateKeyPair(secret);
        this.publicKey = this.keyPair.getPublic("hex");
    }

    toString() {
        return `Wallet - 
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`;
    }

    /**
     * Sign the data
     *
     * @param dataHash
     * @returns {Buffer | Signature | string | undefined | number | PromiseLike<ArrayBuffer>}
     */
    sign(dataHash){
        return this.keyPair.sign(dataHash).toHex();
    }

    /**
     * Create new transaction and add to pool
     *
     * @param to
     * @param amount
     * @param type
     * @param blockchain
     * @param transactionPool
     * @returns {undefined|Transaction}
     */
    createTransaction(to, amount, type, blockchain, transactionPool) {
        let transaction = Transaction.newTransaction(this, to, amount, type);
        transactionPool.addTransaction(transaction);
        return transaction;
    }
}

module.exports = Wallet