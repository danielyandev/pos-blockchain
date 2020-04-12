const Helper = require("../helpers/helper");
const {TRANSACTION_FEE} = require("../../config");

class Transaction {
    constructor() {
        this.id = Helper.id();
        this.type = null;
        this.input = null;
        this.output = null;
    }

    /**
     * Create new transaction after checking balance
     *
     * @param senderWallet
     * @param to
     * @param amount
     * @param type
     */
    static newTransaction(senderWallet, to, amount, type) {
        if (amount + TRANSACTION_FEE > senderWallet.balance) {
            console.log('Not enough balance');
            return;
        }

        return Transaction.generateTransaction(senderWallet, to, amount, type);
    }

    /**
     * Generate new transaction instance
     * and set output
     *
     * @param senderWallet
     * @param to
     * @param amount
     * @param type
     * @returns {Transaction}
     */
    static generateTransaction(senderWallet, to, amount, type) {
        const transaction = new this();
        transaction.type = type;
        transaction.output = {
            to: to,
            amount: amount,
            fee: TRANSACTION_FEE
        };
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    /**
     * Sign the transaction with sender private key
     * and set transaction's input
     *
     * @param transaction
     * @param senderWallet
     */
    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            from: senderWallet.publicKey,
            signature: senderWallet.sign(Helper.hash(transaction.output))
        };
    }

    /**
     * Verify transaction
     *
     * @param transaction
     * @returns {*}
     */
    static verifyTransaction(transaction) {
        return Helper.verifySignature(
            transaction.input.from,
            transaction.input.signature,
            Helper.hash(transaction.output)
        );
    }

    static isValid(transaction) {
        return this.verifyTransaction(transaction)
    }
}

module.exports = Transaction;