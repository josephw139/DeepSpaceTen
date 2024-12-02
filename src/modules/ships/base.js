// class for a Ship
const { sizeModifiers, manufacturerModifiers, defaultStats } = require('./shipTraits'); 


class Ship {
    constructor({ type, capabilities, sizeType, name, manufacturer, description,
                    hp, attack, armor, speed, miningPower, researchPower, stealth, travelSpeed,
                    crew, crewCapacity, cargoCapacity, modCapacity, modules, furnishingsCapacity,
                    furnishings, inventory, lab, price, }) {

        this.type = type;
        this.capabilities = capabilities;
        this.sizeType = sizeType;
        this.name = name;
        this.manufacturer = manufacturer;
        this.description = description;
        this.hp = hp;
        this.attack = attack;
        this.armor = armor;
        this.speed = speed;
        this.miningPower = miningPower;
        this.researchPower = researchPower;
        this.stealth = stealth;
        this.travelSpeed = travelSpeed;
        this.crew = crew;
        this.crewCapacity = crewCapacity;
        this.cargoCapacity = cargoCapacity;
        this.modules = modules;
        this.modCapacity = modCapacity;
        this.furnishingsCapacity = furnishingsCapacity;
        this.furnishings = furnishings;
        this.inventory = inventory;
        this.lab = lab;
        this.price = price;

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
        let sizeTypeString;
        if (!this.sizeType) {
            sizeTypeString = "";
        } else {
            sizeTypeString = this.sizeType;
        }

        if (detailed) {
            const totalInventoryWeight = this.inventory.reduce((total, item) => total + (item.weight || 0), 0);
            const inventoryNames = this.inventory.map(item => `x${item.quantity} ${item.name} (${item.weight}kg) - ${item.sell_price * item.quantity} C\n*${item.description}*`).join('\n\n');
            const labNames = this.lab.map(item => `x${item.quantity} ${item.name} - ${item.sell_price * item.quantity} C\n*${item.description}*`).join('\n\n');

            // Prepare module details, consolidate duplicates, and format description
            const moduleCounts = this.modules.reduce((acc, module) => {
                const name = module.name;
                if (!acc[name]) {
                    // Removing 'Special:' and anything after it using a regular expression
                    // const description = module.description.replace(/(\s*Special:.*)/i, '');
                    const description = module.description;
                    acc[name] = { 
                        count: 0, 
                        description
                    }; 
                }
                acc[name].count += 1;
                return acc;
            }, {});

            const modulesInfo = Object.entries(moduleCounts).map(([name, data]) => {
                // Formatting output to meet the specified requirements
                return `${name}${data.count > 1 ? ` x${data.count}` : ''}\n${data.description}`;
            }).join('\n\n');

            return `*${this.description}*\n\n` +
                    `Crew (${this.crew.length}/${this.crewCapacity[1]}) - Minimum ${this.crewCapacity[0]}\nMorale: ${this.morale}\n\n` +
                    `HP: ${this.hp} | Armor: ${this.armor} | Speed: ${this.speed}\nAttack: ${this.attack}\n\n` +
                    `__Capabilities:__ ${this.capabilities.join(', ')}\n\n` +
                   `__Installed Modules (${this.modules.length}/${this.modCapacity}):__\n${modulesInfo}\n\n` +
                   `__Furnishings (${this.furnishings.length}/${this.furnishingsCapacity}):__\n${this.furnishings.join(', ')}\n\n` +
                   (this.capabilities.includes('Research') ? `__Lab:__\n${labNames}\n\n`: '') +
                   `__Cargo Hold (${totalInventoryWeight}/${this.cargoCapacity}):__\n${inventoryNames}`;
        }
        return `${this.name}, ${sizeTypeString} ${capitalize(this.type)} (${capitalize(this.manufacturer)})`;
    }
    
    
    

    // convert ship stats to JSON for database saving
    toArray() {
        const array = {
            type: this.type,
            capabilities: this.capabilities,
            sizeType: this.sizeType,
            name: this.name,
            manufacturer: this.manufacturer,
            description: this.description,
            hp: this.hp,
            attack: this.attack,
            armor: this.armor, 
            speed: this.speed,
            miningPower: this.miningPower,
            researchPower: this.researchPower,
            stealth: this.stealth,
            travelSpeed: this.travelSpeed,
            crew: this.crew,
            crewCapacity: this.crewCapacity,
            cargoCapacity: this.cargoCapacity,
            inventory: this.inventory,
            lab: this.lab,
            modCapacity: this.modCapacity,
            modules: this.modules,
            furnishingsCapacity: this.furnishingsCapacity,
            furnishings: this.furnishings,
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

        if (array) {
            array.ships.forEach(shipData => {
                this.saveShipToFleet(createShip(shipData.type, shipData));
            });
            this.activeShip = this.ships[array.activeShip];
        }

        /*
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
        }*/
    }

    // set active ship
    setActiveShip(shipName) {
        console.log(`setActiveShip: ${shipName}`);
        
        let ship = null;
        if (typeof shipName === 'string') {
            ship = this.ships.find(s => s.name === shipName);
        } else {
            ship = this.ships.find(s => s.name === shipName.name);
            //console.log('SET ACTIVE SHIP:');
            //console.log(shipName);
        }
        if (ship) {
            this.activeShip = ship;
        } else {
            console.error(`Ship with name ${shipName} not found in the fleet.`);
            console.error(shipName);
        }
    }

    getActiveShip() {
        return this.activeShip;
    }

    // Display a list of all ships owned by a player
    showAllShips() {
        let shipDisplay = "";
        for (let i = 0; i < this.ships.length; i++) {
            const ship = this.ships[i];
            const isActive = ship === this.activeShip;
            const statusLine = `STATUS: ${isActive ? 'ACTIVE' : 'INACTIVE'}`;

            // Format ship line with or without bold based on active status
            const inventoryNames = ship.inventory.map(item => `x${item.quantity} ${item.name} - ${item.sell_price * item.quantity} C`).join(', ');
            const labNames = ship.lab.map(item => `x${item.quantity} ${item.name} - ${item.sell_price * item.quantity} C`).join(', ');
            const shipLineOne = `${i + 1} - ${ship.shipDisplay()}`;
            const shipLineTwo = `Crew: ${ship.crew.length}/${ship.crewCapacity[1]} | Morale: ${ship.morale}`;
            const shipLineThree = `Cargo: ${inventoryNames}` + (ship.capabilities.includes('Research') ? `\nLab: ${labNames}` : '');
            const formattedLine = isActive ? `**${shipLineOne}**` : shipLineOne;

            shipDisplay += `${formattedLine}\n${shipLineTwo}\n${shipLineThree}\n${statusLine}\n\n`;
        }
        return shipDisplay;
    }


    // convert fleet to JSON to save to database
    fleetSave() {
        return {
            ships: this.ships.map(ship => ship.toArray()),
            activeShip: this.activeShip ? this.ships.findIndex(ship => ship.name === this.activeShip.name) : -1
        };
    }
    
    /*fleetSave() {
        let shipJSON = [];
        for (let i = 0; i < this.ships.length; i++) {
            shipJSON.push(this.ships[i].toArray())
        }
        this.fleetJSON.push(shipJSON);
        this.fleetJSON.push(this.activeShip);
        return this.fleetJSON;
    }*/

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
    science_vessel: ScienceVessel
}

// new version
function createShip(shipType, nameOrArray, manufacturer, sizeType = null, modules = []) {
    const ShipClass = shipClasses[shipType];

    if (typeof nameOrArray === "string") {
        // New ship creation
        const stats = JSON.parse(JSON.stringify(defaultStats[shipType]));
        applyAllModifiers(stats, manufacturer, sizeType, modules);
        let ship = new ShipClass({
            type: shipType,
            name: nameOrArray,
            manufacturer: manufacturer,
            sizeType: sizeType,
            ...stats
        });
        return ship;
    } else {
        // Recreating a ship from saved data; no need to reapply modifiers
        return new ShipClass({...nameOrArray});
    }
}

function applyAllModifiers(stats, manufacturer, sizeType, modules) {
    // Apply Size modifiers
    if (sizeType && sizeModifiers[sizeType]) {
        applyModifiers(stats, sizeModifiers[sizeType]);
    }
    
    // Apply manufacturer modifiers
    if (manufacturer && manufacturerModifiers[manufacturer]) {
        applyModifiers(stats, manufacturerModifiers[manufacturer]);
    }

}

function applyModifiers(stats, modifiers) {
    Object.keys(modifiers).forEach(stat => {
        if (stat === 'crewCapacity' && typeof modifiers[stat] === 'object') {
            stats[stat][0] += modifiers[stat].min || 0;
            stats[stat][1] += modifiers[stat].max || 0;
        } else if (['price', 'cargoCapacity'].includes(stat) && typeof stats[stat] === 'number') {
            stats[stat] = Math.floor(stats[stat] * modifiers[stat]);
        } else if (typeof stats[stat] === 'number') {
            stats[stat] += modifiers[stat];
        }
    });
}

function applyModule(ship, module) {
    console.log(`Applying module: ${module.name}`);
    // Apply the effects of the module to the ship's stats

    // Check if the module is already equipped
    const existingModule = ship.modules.find(mod => mod.name === module.name);
    if (existingModule) {
        if (module.stacking == false) {
            console.error(`Module ${module.name} is already equipped and cannot be stacked.`);
            return null;
        }
    }

    if (module.stats) {
        Object.keys(module.stats).forEach(stat => {
            if (stat === 'crewCapacity' && typeof module.stats[stat] === 'object') {
                ship.crewCapacity[0] += module.stats[stat].min || 0;
                ship.crewCapacity[1] += module.stats[stat].max || 0;
            // Special case for Martian Manufacturing LLC Synth Crew
            } else if (module.name === "Martian Manufacturing LLC Synth Crew" && stat === 'crewCapacity') {
                ship.crewCapacity[0] = 1; // Set the minimum crew capacity to 1
                console.log(`Minimum crew capacity set to 1 by ${module.name}`);
            } else if (['price'].includes(stat) && typeof ship[stat] === 'number') {
                ship[stat] *= module.stats[stat];
            } else if (typeof ship[stat] === 'number') {
                ship[stat] += module.stats[stat];
            }
        });
    }

    // Handle capabilities if the module adds any
    if (module.capabilities) {
        module.capabilities.forEach(capability => {
            if (!ship.capabilities.includes(capability)) {
                ship.capabilities.push(capability);
                console.log(`Added capability: ${capability}`);
            } else {
                console.log(`Capability ${capability} already exists and will not be added again.`);
            }
        });
    }

    ship.modules.push(module); // Add module to ship's module list
    console.log(`Module ${module.name} applied successfully.`);
    return true;
}

// REMOVE MODULE FROM SHIPS
function removeModule(ship, moduleName) {
    const moduleIndex = ship.modules.findIndex(mod => mod.name === moduleName);
    if (moduleIndex === -1) {
        console.error("Module not found on the ship.");
        return null;
    }

    const module = ship.modules[moduleIndex];

    // Reverse the effects of the module on the ship's stats
    if (module.stats) {
        Object.keys(module.stats).forEach(stat => {
            if (stat === 'crewCapacity' && typeof module.stats[stat] === 'object') {
                ship.crewCapacity[0] -= module.stats[stat].min || 0;
                ship.crewCapacity[1] -= module.stats[stat].max || 0;
            } else if (['price',].includes(stat) && typeof ship[stat] === 'number') {
                ship[stat] /= module.stats[stat]; // Revert percentage changes by dividing
            } else if (typeof ship[stat] === 'number') {
                ship[stat] -= module.stats[stat]; // Revert flat modifications
            }
        });
    }

    // Remove capabilities if the module added any
    if (module.capabilities) {
        module.capabilities.forEach(capability => {
            const index = ship.capabilities.indexOf(capability);
            if (index !== -1) {
                ship.capabilities.splice(index, 1);
                console.log(`Removed capability: ${capability}`);
            }
        });
    }

    // Remove the module from the ship's module list
    ship.modules.splice(moduleIndex, 1);
    console.log(`Module ${moduleName} removed successfully.`);
    return module;
}



function generateRandomShip() {
    // Example lists of ship types and manufacturers
    const shipTypes = Object.keys(defaultStats);
    const manufacturers = Object.keys(manufacturerModifiers);
    // Add a chance for the Class to be null
    const sizes = [...Object.keys(sizeModifiers), null]; // Adding null to the sizes array

    // Randomly select a ship type and manufacturer

    // Define the list of ship types you want to exclude
    const excludedTypes = ["thorn", "ranger"];

    // Filter out the excluded types from the shipTypes array
    const filteredShipTypes = shipTypes.filter(type => !excludedTypes.includes(type.toLowerCase()));

    // Randomly select a ship type from the filtered list
    const shipType = filteredShipTypes[Math.floor(Math.random() * filteredShipTypes.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    
    // Randomly select a size, allowing for the possibility of null
    const shipSize = sizes[Math.floor(Math.random() * sizes.length)];

    // Generate a random name for the ship
    const shipName = `${capitalize(shipType)} ${Math.floor(Math.random() * 1000)}`;

    // Use your existing createShip function to generate the ship, handling null Size appropriately
    const randomShip = createShip(shipType, shipName, manufacturer, shipSize);

    console.log(`Generated ship: ${shipName}, Type: ${shipType}, Manufacturer: ${manufacturer}, Size: ${shipSize ? shipSize : "Standard"}`);
    console.log(randomShip);
    return randomShip;
}


function capitalize(string) {
    if (string) {
        return string
            .replace(/_/g, ' ') // Replace underscores with spaces
            // Capitalize the first letter of each word, considering spaces and hyphens
            .replace(/(^\w|[\s-]\w)/g, (match) => match.toUpperCase());
    }
    return '';
}


module.exports = { Ship, Fleet, capitalize, createShip, generateRandomShip, applyModule, removeModule, };