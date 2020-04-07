const Helper = require("../helpers/helper");

class Wallet {
    constructor(secret) {
        this.balance = 0;
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
}