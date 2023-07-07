function createShip (ship, shipType, name = null) {
    let type;
    switch(shipType) {
        case "cruiser":
            type = Cruiser;
            break;
        case "freighter":
            type = Freighter;
            break;
        case "scout":
            type = Scout;
            break;
        case "science_vessel":
            type = ScienceVessel;
            break;
    }
    // if we're recreating ship from the database
    if (ship != false) {

        return new type(`U.C.S. ${ship['name']}`, ship['hp'], ship['cargo'], ship['armor'], ship['speed'], ship['modules']);

    } else { // creating brand new ship
        return new type(`U.C.S. ${name}`);
    }
}

class Ship {
    constructor(name, hp, cargo, armor, speed, modules, ) {
        this.name = name;
        this.hp = hp;
        this.cargo = cargo;
        this.armor = armor;
        this.speed = speed;
        this.modules = modules;
        this.type = null;
        this.deploy = `${this.name} is operational and ready to deploy!`;
    }

    toArray() {
        const array = {type: this.type, name: this.name, hp: this.hp, cargo: this.cargo,
        armor: this.armor, speed: this.speed, modules: this.modules};

        console.log(array);

        return array;
    }

}

class Cruiser extends Ship {
    constructor(name, hp, cargo, armor, speed, modules) {
        super(name);
        this.type = "cruiser";
        (hp) ? super(hp) : this.hp = 10;
        (cargo) ? super(cargo) : this.cargo = 3;
        (armor) ? super(armor) : this.armor = 3;
        (speed) ? super(speed) : this.speed = 4;
        (modules) ? super(modules) : this.modules = [];
    }

}

class Freighter extends Ship {
    constructor(name, hp, cargo, armor, speed, modules) {
        super(name);
        this.type = "freighter";
        (hp) ? super(hp) : this.hp = 10;
        (cargo) ? super(cargo) : this.cargo = 3;
        (armor) ? super(armor) : this.armor = 3;
        (speed) ? super(speed) : this.speed = 4;
        (modules) ? super(modules) : this.modules = [];
    }

}

class Scout extends Ship {
    constructor(name, hp, cargo, armor, speed, modules) {
        super(name);
        this.type = "scout";
        (hp) ? super(hp) : this.hp = 10;
        (cargo) ? super(cargo) : this.cargo = 3;
        (armor) ? super(armor) : this.armor = 3;
        (speed) ? super(speed) : this.speed = 4;
        (modules) ? super(modules) : this.modules = [];
    }

}

class ScienceVessel extends Ship {
    constructor(name, hp, cargo, armor, speed, modules) {
        super(name);
        this.type = "science";
        (hp) ? super(hp) : this.hp = 10;
        (cargo) ? super(cargo) : this.cargo = 3;
        (armor) ? super(armor) : this.armor = 3;
        (speed) ? super(speed) : this.speed = 4;
        (modules) ? super(modules) : this.modules = [];
    }

}

module.exports = { createShip, Ship, Cruiser, Freighter, ScienceVessel };