const {INITIAL_LEADER} = require("../../config");

class Stake {
    constructor() {
        this.addresses = [
            INITIAL_LEADER
        ];
        this.balance = {
            [INITIAL_LEADER]: 0
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
            let address_balance = this.getBalance(address)
            if (address_balance > balance) {
                leader = address;
                balance = address_balance
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
        console.log('New amount staked ' + amount)
        this.addStake(from, amount);
    }
}

module.exports = Stake;