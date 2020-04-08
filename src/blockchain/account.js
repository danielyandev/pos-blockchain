const {INITIAL_COINS} = require("../../config");

class Account {
    constructor() {
        this.addresses = [
            "88dad1abc1d29bd44190c67d1ba946750d9982ce607552d1721258eafab9a35c"
        ];
        this.balance = {
            "88dad1abc1d29bd44190c67d1ba946750d9982ce607552d1721258eafab9a35c": INITIAL_COINS
        };
    }

    /**
     * If address does not exist in addresses
     * assign 0 value and push to addresses
     *
     * @param address
     */
    initialize(address) {
        if (this.balance[address] === undefined) {
            this.balance[address] = 0;
            this.addresses.push(address);
        }
    }

    /**
     * Transfer given amount from one address to another
     *
     * @param from
     * @param to
     * @param amount
     */
    transfer(from, to, amount) {
        this.initialize(from);
        this.initialize(to);
        this.increment(to, amount);
        this.decrement(from, amount);
    }

    /**
     * Increment address amount
     *
     * @param to
     * @param amount
     */
    increment(to, amount) {
        this.balance[to] += amount;
    }

    /**
     * Decrement address amount
     *
     * @param from
     * @param amount
     */
    decrement(from, amount) {
        this.balance[from] -= amount;
    }

    /**
     * Get balance of address
     *
     * @param address
     * @returns {*}
     */
    getBalance(address) {
        this.initialize(address);
        return this.balance[address];
    }

    /**
     * Main method to use from outside to transfer amount between addresses
     *
     * @param transaction
     */
    update(transaction) {
        let amount = transaction.output.amount;
        let from = transaction.input.from;
        let to = transaction.output.to;
        this.transfer(from, to, amount);
    }

    /**
     * Send transaction fee to leader validator
     *
     * @param block
     * @param transaction
     */
    transferFee(block, transaction) {
        let amount = transaction.output.fee;
        let from = transaction.input.from;
        let to = block.validator;
        this.transfer(from, to, amount);
    }

}

module.exports = Account