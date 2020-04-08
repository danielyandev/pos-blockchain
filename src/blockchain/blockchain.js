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
            console.log(JSON.stringify(chain[0]))
            console.log(Block.genesis())
            return false;
        }


        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i - 1];
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
            console.log("block valid");
            this.addBlock(block);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Execute block transactions and update chain state
     *
     * @param block
     */
    executeTransactions(block) {
        block.data.forEach(transaction => {
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
}

module.exports = Blockchain;