const Block = require('./block');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    /**
     * Add block to the chain
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
}

module.exports = Blockchain;