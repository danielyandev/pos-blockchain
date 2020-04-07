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
}