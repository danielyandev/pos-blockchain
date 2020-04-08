const Block = require('./block');
const Account = require("./account");
const Stake = require("./stake");
const Validators = require("./validators");

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
     * @param data
     * @returns {Block}
     */
    addBlock(data) {
        const block = Block.createBlock(this.chain[this.chain.length - 1], data);
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
}

module.exports = Blockchain;