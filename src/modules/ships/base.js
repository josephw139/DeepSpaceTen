class Ship {
    constructor(type, name, hp, cargoCapacity, inventory, armor, speed, modules, modCapacity, attack) {
        this.type = type, this.name = name, this.hp = hp, this.cargoCapacity = cargoCapacity,
        this.inventory = inventory, this.armor = armor, this.speed = speed,
        this.modules = modules, this.modCapacity = modCapacity, this.attack = attack;

        for (let i = 0; i < modules.length; i++) {
            switch(modules[i]) {
                case "Weapon Silos":
                    this.attack += '+1d6';
                    break;
                case "Cargo Storage":
                    this.cargoCapacity += 2;
                    break;
            }
        }

        this.deploy = `${this.name} is operational and ready to deploy!`;
    }

    shipDisplay(detailed=false) {
        if (detailed) {
            return `HP: ${this.hp} | Armor: ${this.armor} | Speed: ${this.speed} | Attack: ${this.attack}\n
            Installed Modules (${this.modules.length}/${this.modCapacity}): ${this.modules}\n
            Cargo Hold (${this.inventory.length}/${this.cargoCapacity}): ${this.inventory}`;
        }
        return `${this.name} - ${capitalize(this.type)}`;
    }

    toArray() {
        const array = {type: this.type, name: this.name, hp: this.hp, cargoCapacity: this.cargoCapacity,
            inventory: this.inventory, armor: this.armor, speed: this.speed, modules: this.modules,
            modCapacity: this.modCapacity, attack: this.attack};

        //console.log('base(54) toArray:\n' + array);

        return array;
    }

    rollAttack() {
        // TO DO: for loop to split tons of fice (1d8+1d6+1d6+1d6)
        // const splitDice = this.attack.split('+');
        const split = this.attack.split('d');
        const numDice = split[0];
        const diceSize = split[1];
        let diceArray = [];
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            let result = Math.floor(Math.random() * diceSize) + 1;
            diceArray.push(result);
            total += result;
        };

        let diceString = "[";
        for (let i = 0; i < diceArray.length; i++) {
            diceString += `${diceArray[i]}`;
        }
        diceString += "]"

        return ([total, diceString]);
    }

}

class Fleet {
    constructor(array=null) {
        this.fleet = [];
        this.fleetJSON = [];
        this.fleetSpecs = [];

        if (array != null) {
            const specs =['scout'];
            for (let i = 0; i < array.length; i++) {
                this.createShip(array[i].type, array[i]);
                if (specs.includes(array[i].type)) {
                    this.fleetSpecs.push(array[i].type)
                }
                // this.fleet.push(ship);
                // console.log(newFleet[i]);
            }
        }
    }

    showAllShips() {
        // console.log(this.fleet);
        let shipDisplay = ``;
        for (let i = 0; i < this.fleet.length; i++) {
            shipDisplay += `${i + 1} - ${this.fleet[i].shipDisplay()}\n`;
        }
        return shipDisplay;
    }

    fleetSave() {
        for (let i = 0; i < this.fleet.length; i++) {
            this.fleetJSON.push(this.fleet[i].toArray());
        }
        return this.fleetJSON;
    }

    /*fleetReconstruct(fleetArray) {

    }*/

    createShip (shipType, ship) {
        // ship will either be an Array (pulled from database), or a string (name of a new ship)
        let type;
        let baseStats;
        switch(shipType) {
            case "cruiser":
                type = Cruiser;
                baseStats = {type: 'cruiser', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                modules: [], modCapacity: 2, attack: '1d8'};
                break;
            case "freighter":
                type = Freighter;
                baseStats = {type: 'freighter', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                modules: [], modCapacity: 2, attack: '1d8'};
                break;
            case "scout":
                type = Scout;
                baseStats = {type: 'scout', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                modules: [], modCapacity: 2, attack: '1d8'};
                break;
            case "science vessel":
                baseStats = {type: 'science vessel', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                modules: [], modCapacity: 2, attack: '1d8'};
                type = ScienceVessel;
                break;
        }
        // if we're recreating ship from the database
        if (typeof ship === "object") {
            // console.log('recreating ship from database');
            const s = new type(ship['type'], `${ship['name']}`, ship['hp'], ship['cargoCapacity'],
                ship['inventory'] , ship['armor'], ship['speed'], ship['modules'], ship['modCapacity'], ship['attack']);
            this.fleet.push(s);
            return s;

        } else { // creating brand new ship
            // console.log('creating new ship');
            const s = new type(baseStats['type'], `U.C.S. ${capitalize(ship)}`, baseStats['hp'], baseStats['cargoCapacity'],
                baseStats['inventory'], baseStats['armor'], baseStats['speed'], baseStats['modules'],
                baseStats['modCapacity'], baseStats['attack']);
            this.fleet.push(s);
            return s;
        }
    }
}

class Cruiser extends Ship {

}

class Freighter extends Ship {

}

class Scout extends Ship {

}

class ScienceVessel extends Ship {

}

function capitalize(string) {
    return string.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase());
}

module.exports = { Ship, Fleet, capitalize };