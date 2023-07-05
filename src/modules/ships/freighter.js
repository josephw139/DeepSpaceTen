const { Ship } = require('./base.js');

class Freighter extends Ship {
    constructor(name) {
        super(name);
    }

    newShip() {
        super.newShip();
    }
}

module.exports = { Freighter };