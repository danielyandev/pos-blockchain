const {VALIDATORS_FEE} = require("../../config");

class Validators {
    constructor() {
        this.list = [
            "88dad1abc1d29bd44190c67d1ba946750d9982ce607552d1721258eafab9a35c"
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