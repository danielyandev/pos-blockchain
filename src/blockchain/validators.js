const {VALIDATORS_FEE} = require("../config");

class Validators {
    constructor() {
        this.list = [
            "88dad1abc1d29bd44190c67d1ba946750d9982ce607552d1721258eafab9a35c"
        ];
    }

    update(transaction) {
        if (transaction.amount == VALIDATORS_FEE && transaction.to == "0") {
            this.list.push(transaction.from);
            return true;
        }
        return false;
    }
}

module.exports = Validators;