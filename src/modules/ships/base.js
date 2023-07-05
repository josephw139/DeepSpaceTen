class Ship {
    constructor(name) {
        this.name = name;
        this.deploy = `${this.name} is operational and ready to deploy!`;
    }

    newShip() {
        return ;
    }

    toJSON(ship) {
        return JSON.stringify(ship);
    }

    fromJSON(ship) {
        return JSON.parse(ship);
    }
}

module.exports = { Ship };