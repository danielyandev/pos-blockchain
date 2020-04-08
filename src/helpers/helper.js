const EDDSA = require("elliptic").eddsa;
const eddsa = new EDDSA("ed25519");
const SHA256 = require('crypto-js/sha256');
const uuidv4 = require("uuid").v4

class Helper {
    /**
     * Generate public and private keys from secret
     *
     * @param secret
     * @returns {*}
     */
    static generateKeyPair(secret) {
        return eddsa.keyFromSecret(secret);
    }

    /**
     * Get uuid V4
     *
     * @returns {*}
     */
    static id() {
        return uuidv4();
    }

    /**
     * Hash the data
     *
     * @param data
     * @returns {*}
     */
    static hash(data){
        return SHA256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey, signature, dataHash) {
        return eddsa.keyFromPublic(publicKey).verify(dataHash, signature);
    }
}

module.exports = Helper