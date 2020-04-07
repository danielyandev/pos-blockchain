const EDDSA = require("elliptic").eddsa;
const eddsa = new EDDSA("ed25519");

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
     * @returns {*}
     */
    static id() {
        return uuidv4();
    }
}

module.exports = Helper