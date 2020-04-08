class Stake {
    constructor() {
        this.addresses = [];
        this.balance = {};
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
     * Add amount to address
     *
     * @param from
     * @param amount
     */
    addStake(from, amount) {
        this.initialize(from);
        this.balance[from] += amount;
    }

    /**
     * Get address balance
     *
     * @param address
     * @returns {*}
     */
    getBalance(address) {
        this.initialize(address);
        return this.balance[address];
    }

    /**
     * Get an address with max amount staked
     *
     * @param addresses
     */
    getLeader(addresses) {
        let balance = -1;
        let leader = undefined;
        addresses.forEach(address => {
            if (this.getBalance(address) > balance) {
                leader = address;
            }
        });
        return leader;
    }

    /**
     * Main method to use from outside to add amount to stake
     *
     * @param transaction
     */
    update(transaction) {
        let amount = transaction.output.amount;
        let from = transaction.input.from;
        this.addStake(from, amount);
    }
}

module.exports = Stake;