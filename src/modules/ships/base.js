// class for a Ship
const { classModifiers, manufacturerModifiers, defaultStats } = require('./shipTraits')


class Ship {
    constructor({ type, capabilities, classType, name, manufacturer, description, hp, attack, armor, speed,
                crew, crewCapacity, cargoCapacity, modCapacity, modules, inventory, price }) {
        this.type = type;
        this.capabilities = capabilities;
        this.classType = classType;
        this.name = name;
        this.manufacturer = manufacturer;
        this.description = description;
        this.hp = hp;
        this.attack = attack;
        this.armor = armor;
        this.speed = speed;
        this.crew = crew;
        this.crewCapacity = crewCapacity;
        this.cargoCapacity = cargoCapacity;
        this.modules = modules;
        this.modCapacity = modCapacity;
        this.inventory = inventory;
        this.price = price;

        // modify stats based on modules equipped
        for (let i = 0; i < modules.length; i++) {
            switch(modules[i]) {
                case "Cargo Storage":
                    this.cargoCapacity += 2;
                    break;
            }
        }

        // determine ship morale
        let morale = 0;
        for (let i = 0; i < crew.length; i++) {
            morale += crew[i].morale;
        }
        this.morale = morale / crew.length;

        this.deploy = `${this.name} is operational and ready to deploy!`;
    }

    // function to call in the Fleet command to show ship details
    shipDisplay(detailed = false) {
        let classTypeString;
        if (!this.classType) {
            classTypeString = "";
        } else {
            classTypeString = this.classType;
        }

        if (detailed) {
            const totalInventoryWeight = this.inventory.reduce((total, item) => total + (item.weight || 0), 0);
            const inventoryNames = this.inventory.map(item => `x${item.quantity} ${item.name} (${item.weight})`).join(', ');
    
            return `*${this.description}*\n\n` +
                    `Crew (${this.crew.length}/${this.crewCapacity[1]}) - Minimum ${this.crewCapacity[0]}\nMorale: ${this.morale}\n\n` +
                    `HP: ${this.hp} | Armor: ${this.armor} | Speed: ${this.speed}\nAttack: ${this.attack}\n\n` +
                    `__Capabilities:__ ${this.capabilities.join(', ')}\n\n` +
                   `__Installed Modules (${this.modules.length}/${this.modCapacity}):__\n${this.modules.join(', ')}\n` +
                   `__Cargo Hold (${totalInventoryWeight}/${this.cargoCapacity}):__\n${inventoryNames}`;
        }
        return `${this.name}, ${classTypeString} ${capitalize(this.type)} (${capitalize(this.manufacturer)})`;
    }
    
    
    

    // convert ship stats to JSON for database saving
    toArray() {
        const array = {
            type: this.type,
            capabilities: this.capabilities,
            classType: this.classType,
            name: this.name,
            manufacturer: this.manufacturer,
            description: this.description,
            hp: this.hp,
            attack: this.attack,
            armor: this.armor, 
            speed: this.speed,
            crew: this.crew,
            crewCapacity: this.crewCapacity,
            cargoCapacity: this.cargoCapacity,
            inventory: this.inventory,
            modules: this.modules,
            modCapacity: this.modCapacity,
            price: this.price,
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
                this.saveShipToFleet(createShip(array[0][i].type, array[0][i]));
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
                shipDisplay += `**\nCrew: ${this.ships[i].crew.length}/${this.ships[i].crewCapacity[1]} | Morale: ${this.ships[i].morale}\n`;
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

    // save ship to Fleet
    saveShipToFleet(ship) {
            this.ships.push(ship);
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


// create a new ship
function createShip(shipType, nameOrArray, manufacturer, shipClass = null) {
    const ShipClass = shipClasses[shipType];
    const stats = JSON.parse(JSON.stringify(defaultStats[shipType])); // Deep copy to avoid mutating the original

    // Apply manufacturer modifiers
    if (manufacturer && manufacturerModifiers[manufacturer]) {
        Object.keys(manufacturerModifiers[manufacturer]).forEach(stat => {
            if (stat === 'crewCapacity' && typeof stats[stat] === 'object') {
                // Assuming crewCapacity adjustments need special handling
                stats[stat][0] += manufacturerModifiers[manufacturer][stat].min || 0;
                stats[stat][1] += manufacturerModifiers[manufacturer][stat].max || 0;
            } else if (['price', 'cargoCapacity'].includes(stat) && typeof stats[stat] === 'number') {
                // Apply percentage modifiers directly for price and cargoCapacity
                stats[stat] *= manufacturerModifiers[manufacturer][stat];
            } else if (typeof stats[stat] === 'number') {
                // Apply flat modifiers for other stats
                stats[stat] += manufacturerModifiers[manufacturer][stat];
            }
        });
    }
    
    // Apply Class modifiers (Light, Heavy)
    if (shipClass && classModifiers[shipClass]) {
        Object.keys(classModifiers[shipClass]).forEach(stat => {
            if (stat === 'crewCapacity') {
                // Directly applying min and max adjustments to both elements of the crewCapacity array
                stats[stat][0] += classModifiers[shipClass][stat].min; // Adjust minimum capacity
                stats[stat][1] += classModifiers[shipClass][stat].max; // Adjust maximum capacity
            } else if (['price', 'cargoCapacity'].includes(stat)) {
                // Apply percentage modifiers directly
                stats[stat] *= classModifiers[shipClass][stat];
            } else {
                // Apply flat modifiers
                stats[stat] += classModifiers[shipClass][stat];
            }
        });
    }

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
                classType: shipClass,
                ...stats
            });
        }
        return ship;

    } else {
        throw new Error("Invalid ship type");
    }
}

function generateRandomShip() {
    // Example lists of ship types and manufacturers
    const shipTypes = Object.keys(defaultStats);
    const manufacturers = Object.keys(manufacturerModifiers);
    // Add a chance for the Class to be null
    const classes = [...Object.keys(classModifiers), null]; // Adding null to the classes array

    // Randomly select a ship type and manufacturer
    const shipType = shipTypes[Math.floor(Math.random() * shipTypes.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    // Randomly select a class, allowing for the possibility of null
    const shipClass = classes[Math.floor(Math.random() * classes.length)];

    // Generate a random name for the ship
    const shipName = `${capitalize(shipType)} ${Math.floor(Math.random() * 1000)}`;

    // Use your existing createShip function to generate the ship, handling null Class appropriately
    const randomShip = createShip(shipType, shipName, manufacturer, shipClass);

    console.log(`Generated ship: ${shipName}, Type: ${shipType}, Manufacturer: ${manufacturer}, Class: ${shipClass ? shipClass : "Standard"}`);
    console.log(randomShip);
    return randomShip;
}


function capitalize(string) {
    if (string) {
        return string
        // Replace underscores with spaces
        .replace(/_/g, ' ')
        // Capitalize the first letter of each word
        .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
    }
}


module.exports = { Ship, Fleet, capitalize, createShip, generateRandomShip };