const { Ship } = require('./base.js');

class Cruiser extends Ship {
    constructor(name) {
        super(name);
        this.hp = 10;
        this.cargo = 3;
        this.armor = 3;
        this.speed = 4;
        this.modules = [];
    }


    newShip() {
        super.newShip();
    }
}

module.exports = { Cruiser };