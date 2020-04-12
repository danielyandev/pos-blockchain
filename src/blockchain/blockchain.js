const Block = require('./block');
const Account = require("./account");
const Stake = require("./stake");
const Validators = require("./validators");

const TRANSACTION_TYPES = {
    transaction: "TRANSACTION",
    stake: "STAKE",
    validator: "VALIDATOR"
};

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
        this.account = new Account()
        this.stake = new Stake()
        this.validators = new Validators()
    }

    /**
     * Add block to the chain (received from other nodes)
     *
     * @param block
     * @returns {Block}
     */
    addBlock(block) {
        this.executeTransactions(block)
        this.chain.push(block);

        return block;
    }

    /**
     * Create own block
     *
     * @param transactions
     * @param wallet
     * @returns {Block}
     */
    createBlock(transactions, wallet) {
        return Block.createBlock(
            this.chain[this.chain.length - 1],
            transactions,
            wallet
        );
    }

    /**
     * Check if chain is valid
     *
     * @param chain
     * @returns {boolean}
     */
    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            console.log('Genesis does not match')
            return false;
        }


        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];
            // if current chain has a block with index
            // compare current block with block received
            if (this.chain.hasOwnProperty(i)){
                console.log(this.chain[i])
                console.log(block)
                if (this.chain[i] !== block){
                    return false;
                }
            }
            if ((block.lastHash !== lastBlock.hash) || (
                block.hash !== Block.blockHash(block)))
                return false;
        }

        return true;

    }

    /**
     * Replace current chain if new one is longer
     *
     * @param newChain
     */
    replaceChain(newChain) {
        if (newChain.length <= this.chain.length) {
            console.log("Received chain is not longer than the current chain");
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log("Received chain is invalid");
            return;
        }

        console.log("Replacing the current chain with new chain");
        this.chain = newChain;
        this.executeChain()
    }

    /**
     * Execute all blocks transactions
     */
    executeChain() {
        console.log('Executing chain')
        this.chain.forEach(block => this.executeTransactions(block))
    }

    /**
     * Get balance using public key
     *
     * @param publicKey
     * @returns {*}
     */
    getBalance(publicKey) {
        return this.account.getBalance(publicKey);
    }

    /**
     * Get the leader
     *
     * @returns {*}
     */
    getLeader() {
        return this.stake.getLeader(this.validators.list);
    }

    /**
     * Check if block is valid
     *
     * @param block
     * @returns {boolean}
     */
    isValidBlock(block) {
        const lastBlock = this.chain[this.chain.length - 1];
        /**
         * check hash
         * check last hash
         * check signature
         * check leader
         */
        if (
            block.lastHash === lastBlock.hash &&
            block.hash === Block.blockHash(block) &&
            Block.verifyBlock(block) &&
            Block.verifyLeader(block, this.getLeader())
        ) {
            console.log("Block is valid");
            return true;
        } else {
            console.log("Block is invalid")
            return false;
        }
    }

    /**
     * Execute block transactions and update chain state
     *
     * @param block
     */
    executeTransactions(block) {
        block.transactions.forEach(transaction => {
            switch (transaction.type) {
                case TRANSACTION_TYPES.transaction:
                    this.account.update(transaction);
                    this.account.transferFee(block, transaction);
                    break;
                case TRANSACTION_TYPES.stake:
                    this.stake.update(transaction);
                    this.account.decrement(
                        transaction.input.from,
                        transaction.output.amount
                    );
                    this.account.transferFee(block, transaction);

                    break;
                case TRANSACTION_TYPES.validator:
                    if (this.validators.update(transaction)) {
                        this.account.decrement(
                            transaction.input.from,
                            transaction.output.amount
                        );
                        this.account.transferFee(block, transaction);
                    }
                    break;
            }
        });
    }

    /**
     * Check if block is the last in chain
     *
     * @param block
     * @returns {boolean}
     */
    isLastBlock(block) {
        return this.chain[this.chain.length -1].hash === block.hash
    }
}

module.exports = Blockchain;