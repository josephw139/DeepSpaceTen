// class for a Ship


class Ship {
    constructor({ type, capabilities, name, manufacturer, hp, cargoCapacity, armor, speed, modCapacity, modules, inventory }) {
        this.type = type;
        this.capabilities = capabilities;
        this.name = name;
        this.manufacturer = manufacturer;
        this.hp = hp;
        this.cargoCapacity = cargoCapacity;
        this.armor = armor;
        this.speed = speed;
        this.modules = modules;
        this.modCapacity = modCapacity;
        this.inventory = inventory;

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
    shipDisplay(detailed = false) {
        if (detailed) {
            const totalInventoryWeight = this.inventory.reduce((total, item) => total + (item.weight || 0), 0);
            const inventoryNames = this.inventory.map(item => `x${item.quantity} ${item.name} (${item.weight})`).join(', ');
    
            return `HP: ${this.hp} | Armor: ${this.armor} | Speed: ${this.speed}\n` +
                    `Capabilities: ${this.capabilities.join(', ')}\n\n` +
                   `__Installed Modules (${this.modules.length}/${this.modCapacity}):__\n${this.modules.join(', ')}\n` +
                   `__Cargo Hold (${totalInventoryWeight}/${this.cargoCapacity}):__\n${inventoryNames}`;
        }
        return `${this.name}, ${capitalize(this.type)} (${capitalize(this.manufacturer)})`;
    }
    
    
    

    // convert ship stats to JSON for database saving
    toArray() {
        const array = {
            type: this.type,
            capabilities: this.capabilities,
            name: this.name,
            hp: this.hp,
            manufacturer: this.manufacturer,
            cargoCapacity: this.cargoCapacity,
            inventory: this.inventory,
            armor: this.armor, 
            speed: this.speed,
            modules: this.modules,
            modCapacity: this.modCapacity
        };

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
        this.ships = [];
        this.fleetJSON = [];
        this.fleetSpecs = [];
        this.activeShip = null;

        // Recreating an existing Fleet
        if (array != null) {
            // console.log(array);

            // array comes from fleetJSON.
            // fleetJSON contains an array of ships at [0], and the active ship at [1]
            // [1] is just supposed to be a string,
            // but it saves as the full object for some reason which works for me
            const specs =['scout'];
            for (let i = 0; i < array[0].length; i++) {
                this.createShip(array[0][i].type, array[0][i]);
                if (specs.includes(array[0][i].type)) {
                    this.fleetSpecs.push(array[0][i].type)
                }
                // this.fleet.push(ship);
                // console.log(newFleet[i]);
            }
            this.setActiveShip(array[1]);
        }
    }

    // set active ship
    setActiveShip(shipName) {
        let ship = null;
        if (typeof shipName === 'string') {
            ship = this.ships.find(s => s.name === shipName);
        } else {
            ship = this.ships.find(s => s.name === shipName.name);
        }
        if (ship) {
            this.activeShip = ship;
        } else {
            console.error(`Ship with name ${shipName} not found in the fleet.`);
        }
    }

    getActiveShip() {
        return this.activeShip;
    }

    // display a list of all ships owned by a player
    showAllShips() {
        // console.log(this.ships);
        let shipDisplay = ``;
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i] === this.activeShip) {
                shipDisplay += `**`;
            }
            shipDisplay += `${i + 1} - ${this.ships[i].shipDisplay()}`;
            if (this.ships[i] === this.activeShip) {
                shipDisplay += `**\n`;
            }
            if (this.ships[i] === this.activeShip) {
                shipDisplay += `STATUS: ACTIVE\n\n`;
            } else {
                shipDisplay += `STATUS: INACTIVE\n\n`;
            }
        }
        return shipDisplay;
    }

    // convert fleet to JSON to save to database
    fleetSave() {
        let shipJSON = [];
        for (let i = 0; i < this.ships.length; i++) {
            shipJSON.push(this.ships[i].toArray())
        }
        this.fleetJSON.push(shipJSON);
        this.fleetJSON.push(this.activeShip);
        return this.fleetJSON;
    }

    /*fleetReconstruct(fleetArray) {

    }*/

    // create a new ship
    createShip(shipType, nameOrArray, manufacturer) {
        const ShipClass = shipClasses[shipType];
        const stats = defaultStats[shipType];

        if (ShipClass && stats && nameOrArray) {
            let ship;
            if ((typeof nameOrArray === "object")) {
                // recreate an existing ship with json object
                ship = new ShipClass({
                    ...nameOrArray
                })
            } else {
                // create a brand new ship
                ship = new ShipClass({
                    type: shipType,
                    name: nameOrArray,
                    manufacturer: manufacturer,
                    ...stats
                });
            }

            this.ships.push(ship);
            return ship;

        } else {
            throw new Error("Invalid ship type");
        }
    }
}

class Cruiser extends Ship {

}

class Freighter extends Ship {

}

class MiningShip extends Ship {

}

class Scout extends Ship {

}

class ScienceVessel extends Ship {

}


const shipClasses = {
    cruiser: Cruiser,
    freighter: Freighter,
    mining_ship: MiningShip,
    scout: Scout,
    scienceVessel: ScienceVessel
}

const defaultStats = {
    cruiser: { hp: 16, cargoCapacity: 1000, armor: 4, speed: 3, modCapacity: 4, modules: [], inventory: [], capabilities: [] },
    mining_ship: { hp: 10, cargoCapacity: 1500, armor: 2, speed: 2, modCapacity: 2, modules: [], inventory: [], capabilities: ["Mining"] },
    freighter: { hp: 10, cargoCapacity: 4000, armor: 2, speed: 2, modCapacity: 2, modules: [], inventory: [], capabilities: [] },
    scout: { hp: 6, cargoCapacity: 500, armor: 2, speed: 4, modCapacity: 1, modules: [], inventory: [], capabilities: [] },
    science_vessel: { hp: 8, cargoCapacity: 500, armor: 2, speed: 2, modCapacity: 2, modules: [], inventory: [], capabilities: ["Research"] },
};

function capitalize(string) {
    if (string) {
        return string
        // Replace underscores with spaces
        .replace(/_/g, ' ')
        // Capitalize the first letter of each word
        .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
    }
}


module.exports = { Ship, Fleet, capitalize };