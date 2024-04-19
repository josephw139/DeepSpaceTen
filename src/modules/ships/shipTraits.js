const defaultStats = {
    cruiser: { 
        description: 'Cruisers are good all-rounder ships, sturdier and more versatile, but much more expensive.',
        hp: 16, attack: '1d6', armor: 4, speed: 10, miningPower: 0, researchPower: 0, stealth: 0, travelSpeed: 1, 
        crew: [], crewCapacity: [8, 16], cargoCapacity: 1000, modCapacity: 4, modules: [],
        furnishingsCapacity: 2, furnishings: [], inventory: [], capabilities: [], price: 50000,
    },
    mining_ship: { 
        description: 'Outfitted with drills, ore storage, mineral scanners.',
        hp: 10, attack: '1d2', armor: 2, speed: 9, miningPower: 1, researchPower: 0, stealth: 0, travelSpeed: 1,
        crew: [], crewCapacity: [3, 7], cargoCapacity: 1500,  modCapacity: 2, modules: [],
        furnishingsCapacity: 1, furnishings: [], inventory: [], capabilities: ["Mining"], price: 30000,
    },
    freighter: { 
        description: 'Designed to haul as much cargo as possible.',
        hp: 10, attack: '1d2', armor: 2, speed: 8, miningPower: 0, researchPower: 0, stealth: 0, travelSpeed: 1,
        crew: [], crewCapacity: [3, 5], cargoCapacity: 4000,  modCapacity: 2, modules: [],
        furnishingsCapacity: 1, furnishings: [], inventory: [], capabilities: [], price: 30000,
    },
    scout: { 
        description: 'Fast and nimble, equipped with probes and advanced scanning hardware',
        hp: 8, attack: '1d2', armor: 2, speed: 14, miningPower: 0, researchPower: 0, stealth: 1, travelSpeed: 1,
        crew: [], crewCapacity: [3, 4], cargoCapacity: 500,  modCapacity: 1, modules: [], 
        inventory: [], furnishingsCapacity: 1, furnishings: [], capabilities: ["Light Scan"], price: 25000,
    },
    science_vessel: {
        description: 'Equipped with state of the art laboraties and facilities to study exotic material and other life.',
        hp: 6, attack: '1d2', armor: 2, speed: 9, miningPower: 0, researchPower: 1, stealth: 0, travelSpeed: 1,
        crew: [], crewCapacity: [3, 10], cargoCapacity: 500, modCapacity: 2, modules: [],
        inventory: [], capabilities: ["Research"], price: 30000,
    },
};

const manufacturerModifiers = {
    "Atlas Exploration": {
        speed: +2,
        cargoCapacity: 0.95,
    },
    "Martian Manufacturing LLC": {
        armor: +1,
        hp: +2,
    },
    "Wright-Yuan Corporation": {
        price: 1.2,
        speed: +1,
        hp: +1
    },
    "Voidway Aeronautics": {
        cargoCapacity: 1.2,
        crewCapacity: { min: +0, max: +1 },
    },
    "Bright Future Industries": {
        price: 1.6,
        modCapacity: +1,
    },
    "Conglomerate of Liberated Peoples' Steelworks": {
        crewCapacity: { min: -1, max: +1 },
        armor: -1,
        hp: -1,
        price: 0.90,
        furnishingsCapacity: +1,
    }

};

const classModifiers = {
    Light: {
        speed: +2,
        price: 0.9, // Reduce price by 20%
        crewCapacity: { min: -1, max: -1 },
        hp: -1,
        armor: -1,
        cargoCapacity: 0.9, // Reduce cargo capacity by 10%
    },
    Heavy: {
        speed: -1,
        price: 1.1, // Increase price by 20%
        crewCapacity: { min: +1, max: +1 },
        hp: +1,
        armor: +1,
        cargoCapacity: 1.1, // Increase cargo capacity by 10%
    },
};




module.exports = { classModifiers, manufacturerModifiers, defaultStats }