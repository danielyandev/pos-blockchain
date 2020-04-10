const {VALIDATORS_FEE, INITIAL_LEADER} = require("../../config");

class Validators {
    constructor() {
        this.list = [
            INITIAL_LEADER
        ];
    }

    update(transaction) {
        if (transaction.output.amount >= VALIDATORS_FEE && transaction.output.to == "0") {
            console.log('new validator added')
            this.list.push(transaction.input.from);
            return true;
        }
        return false;
    }
}

module.exports = Validators;