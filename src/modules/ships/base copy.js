// class for a Ship
class Ship {
    constructor(type, name, hp, cargoCapacity, inventory, armor, speed, modules, modCapacity) {
        this.type = type, this.name = name, this.hp = hp, this.cargoCapacity = cargoCapacity,
        this.inventory = inventory, this.armor = armor, this.speed = speed,
        this.modules = modules, this.modCapacity = modCapacity;

        // modify stats based on modules equipped
        for (let i = 0; i < modules.length; i++) {
            switch(modules[i]) {
                case "Cargo Storage":
                    this.cargoCapacity += 2;
                    break;
            }
        }

        this.deploy = `${this.name} is operational and ready to deploy!`;
    }

    // function to call in the Fleet command to show ship details
    shipDisplay(detailed=false) {
        if (detailed) {
            return `HP: ${this.hp} | Armor: ${this.armor} | Speed: ${this.speed}\n
            Installed Modules (${this.modules.length}/${this.modCapacity}): ${this.modules}\n
            Cargo Hold (${this.inventory.length}/${this.cargoCapacity}): ${this.inventory}`;
        }
        return `${this.name} - ${capitalize(this.type)}`;
    }

    // convert ship stats to JSON for database saving
    toArray() {
        const array = {type: this.type, name: this.name, hp: this.hp, cargoCapacity: this.cargoCapacity,
            inventory: this.inventory, armor: this.armor, speed: this.speed, modules: this.modules,
            modCapacity: this.modCapacity};

        //console.log('base(54) toArray:\n' + array);

        return array;
    }

    /*
    rollAttack() {
        // TO DO: for loop to split tons of fice (1d8+1d6+1d6+1d6)
        const splitDice = this.attack.split('+');
        let diceArray = [];
        let total = 0;
        for (let i = 0; i < splitDice.length; i++) {
            let split = splitDice[i].split('d');
            let numDice = split[0];
            let diceSize = split[1];
            for (let j = 0; j < numDice; i++) {
                let result = Math.floor(Math.random() * diceSize) + 1;
                diceArray.push(result);
                total += result;
            };
        }

        let diceString = "[";
        for (let i = 0; i < diceArray.length; i++) {
            diceString += `${diceArray[i]}`;
        }
        diceString += "]"

        return ([total, diceString]);
    }
    */

}

// Fleet contains all the information for a player's ships
class Fleet {
    constructor(array=null) {
        this.fleet = [];
        this.fleetJSON = [];
        this.fleetSpecs = [];

        // Recreating an existing Fleet
        if (array != null) {
            // why is specs = scout? figure that out
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

    // display a list of all ships owned by a player
    showAllShips() {
        // console.log(this.fleet);
        let shipDisplay = ``;
        for (let i = 0; i < this.fleet.length; i++) {
            shipDisplay += `${i + 1} - ${this.fleet[i].shipDisplay()}\n`;
        }
        return shipDisplay;
    }

    // convert fleet to JSON to save t odatabase
    fleetSave() {
        for (let i = 0; i < this.fleet.length; i++) {
            this.fleetJSON.push(this.fleet[i].toArray());
        }
        return this.fleetJSON;
    }

    /*fleetReconstruct(fleetArray) {

    }*/

    // create a new ship
    createShip (shipType, ship) {
        // ship variable will either be an Array (an existing ship pulled from database),
        // or a string (name of a new ship)
        // shipType is a string
        let type;
        let baseStats;
        switch(shipType) {
            case "cruiser":
                type = Cruiser;
                baseStats = {type: 'cruiser', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                modules: [], modCapacity: 2};
                break;
            case "mining ship":
                type = Miner;
                baseStats = {type: 'mining ship', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                modules: [], modCapacity: 2};
                break;
            case "freighter":
                    type = Freighter;
                    baseStats = {type: 'freighter', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                    modules: [], modCapacity: 2};
                    break;
            case "scout":
                type = Scout;
                baseStats = {type: 'scout', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                modules: [], modCapacity: 2};
                break;
            case "science vessel":
                baseStats = {type: 'science vessel', hp: 10, cargoCapacity: 3, inventory: [], armor: 3, speed: 4,
                modules: [], modCapacity: 2};
                type = ScienceVessel;
                break;
        }
        // if we're recreating ship from the database
        if (typeof ship === "object") {
            // console.log('recreating ship from database');
            const s = new type(ship['type'], `${ship['name']}`, ship['hp'], ship['cargoCapacity'],
                ship['inventory'] , ship['armor'], ship['speed'], ship['modules'], ship['modCapacity']);
            this.fleet.push(s);
            return s;

        } else { // creating brand new ship
            // console.log('creating new ship');
            const s = new type(baseStats['type'], `${capitalize(ship)}`, baseStats['hp'], baseStats['cargoCapacity'],
                baseStats['inventory'], baseStats['armor'], baseStats['speed'], baseStats['modules'],
                baseStats['modCapacity']);
            this.fleet.push(s);
            return s;
        }
    }
}

class Cruiser extends Ship {

}

class Freighter extends Ship {

}

class Miner extends Ship {

}

class Scout extends Ship {

}

class ScienceVessel extends Ship {

}

function capitalize(string) {
    return string.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase());
}

module.exports = { Ship, Fleet, capitalize };