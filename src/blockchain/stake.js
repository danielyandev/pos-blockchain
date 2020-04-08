class Stake {
    constructor() {
        this.addresses = [
            "88dad1abc1d29bd44190c67d1ba946750d9982ce607552d1721258eafab9a35c"
        ];
        this.balance = {
            "88dad1abc1d29bd44190c67d1ba946750d9982ce607552d1721258eafab9a35c": 0
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
        this.addStake(from, amount);
    }
}

module.exports = Stake;