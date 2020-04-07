const Block = require('./block');

class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
    }

    /**
     * Add block to the chain
     * @param data
     * @returns {Block}
     */
    addBlock(data){
        const block = Block.createBlock(this.chain[this.chain.length-1],data);
        this.chain.push(block);

        return block;
    }
}

module.exports = Blockchain;