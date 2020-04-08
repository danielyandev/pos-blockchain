const Transaction = require("./transaction");
const {TRANSACTIONS_PER_BLOCK} = require("../../config");

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    /**
     * Add transaction and check if TRANSACTIONS_PER_BLOCK limit reached
     *
     * @param transaction
     * @returns {boolean}
     */
    addTransaction(transaction) {
        this.transactions.push(transaction);
        return this.thresholdReached();

    }

    /**
     * Filter valid transactions
     *
     * @returns {[]}
     */
    validTransactions() {
        return this.transactions.filter(transaction => {
            if (!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.data.from}`);
                return;
            }

            return transaction;
        });
    }

    /**
     * Check if transaction exists in pool
     *
     * @param transaction
     * @returns {}
     */
    transactionExists(transaction) {
        return this.transactions.find(t => t && t.id === transaction.id);
    }

    /**
     * Clear the pool
     */
    clear() {
        this.transactions = [];
    }

    thresholdReached() {
        return this.transactions.length >= TRANSACTIONS_PER_BLOCK;
    }
}

module.exports = TransactionPool;