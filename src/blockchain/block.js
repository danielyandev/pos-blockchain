const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(timestamp, lastHash, hash, transactions, validator, signature) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.transactions = transactions;
        this.validator = validator;
        this.signature = signature;
    }

    toString() {
        return `Block - 
        Timestamp    : ${this.timestamp}
        Last Hash    : ${this.lastHash}
        Hash         : ${this.hash}
        Transactions : ${this.transactions}
        Validator    : ${this.validator}
        Signature    : ${this.signature}`;
    }

    /**
     * Create genesis block
     * @returns {Block}
     */
    static genesis() {
        return new this(Date.now(), "no-last-hash", "genesis-hash", []);
    }

    /**
     * Hash the data
     * @param timestamp
     * @param lastHash
     * @param data
     * @returns {*}
     */
    static hash(timestamp,lastHash,data){
        return SHA256(`${timestamp}${lastHash}${data}`).toString();
    }

    /**
     * Create new block instance
     * @param lastBlock
     * @param data
     * @returns {Block}
     */
    static createBlock(lastBlock, data) {
        let hash;
        let timestamp = Date.now();
        const lastHash = lastBlock.hash;
        hash = Block.hash(timestamp, lastHash, data);

        return new this(timestamp, lastHash, hash, data);
    }
}

module.exports = Block