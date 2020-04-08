const Helper = require("../helpers/helper");


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
     *
     * @returns {Block}
     */
    static genesis() {
        return new this("genesis-timestamp", "no-last-hash", "genesis-hash", []);
    }

    /**
     * Hash the data
     *
     * @param timestamp
     * @param lastHash
     * @param transactions
     * @returns {*}
     */
    static hash(timestamp, lastHash, transactions) {
        return Helper.hash(`${timestamp}${lastHash}${transactions}`);
    }

    /**
     * Create new block instance
     *
     * @param lastBlock
     * @param transactions
     * @param wallet
     * @returns {Block}
     */
    static createBlock(lastBlock, transactions, wallet) {
        let timestamp = Date.now();
        const lastHash = lastBlock.hash;
        let hash = Block.hash(timestamp, lastHash, transactions);

        // get the validators public key
        let validator = wallet.getPublicKey();

        // Sign the block
        let signature = Block.signBlockHash(hash, wallet);
        return new this(timestamp, lastHash, hash, transactions, validator, signature);
    }

    /**
     * Hash the block
     *
     * @param block
     * @returns {*}
     */
    static blockHash(block) {
        //destructuring
        const {timestamp, lastHash, transactions} = block;
        return Block.hash(timestamp, lastHash, transactions);
    }

    /**
     * Return wallet sign method
     *
     * @param hash
     * @param wallet
     * @returns {Buffer | Signature | Buffer | string | number | PromiseLike<ArrayBuffer> | * | PromiseLike<ArrayBuffer>}
     */
    static signBlockHash(hash, wallet) {
        return wallet.sign(hash);
    }

    /**
     *
     * @param block
     * @returns {*}
     */
    static verifyBlock(block) {
        return Helper.verifySignature(
            block.validator,
            block.signature,
            Block.hash(block.timestamp, block.lastHash, block.transactions)
        );
    }

    /**
     *
     * @param block
     * @param leader
     * @returns {boolean}
     */
    static verifyLeader(block, leader) {
        return block.validator === leader;
    }
}

module.exports = Block