const extractionPowerOne = {
    ore: 1,
    gas: 1,
}

const extractionPowerZero = {
    ore: 0,
    gas: 0,
}

const researchPowerBase = {
    base: 1,
}

const researchPowerZero = {
    base: 0,
}

const defaultActivity = "Crew on standby, ship conserving power.";

const defaultStats = {
    cruiser: { 
        description: 'Cruisers are good all-rounder ships, sturdier and more versatile, but much more expensive.',
        hp: 16, attack: '1d6', armor: 4, speed: 10, extractionPower: extractionPowerZero, researchPower: researchPowerZero, stealth: 0, travelSpeed: 1, 
        crew: [], crewCapacity: [8, 16], cargoCapacity: 2000, modCapacity: 6, modules: [],
        furnishingsCapacity: 4, furnishings: [], inventory: [], lab: [], capabilities: [], 
        engaged: false, activity: defaultActivity, location: null, price: 200000, id: null,
    },
    mining_ship: { 
        description: 'Outfitted with drills, ore storage, mineral scanners.',
        hp: 10, attack: '1d2', armor: 2, speed: 9, extractionPower: extractionPowerOne, researchPower: researchPowerZero, stealth: 0, travelSpeed: 1,
        crew: [], crewCapacity: [3, 7], cargoCapacity: 1500,  modCapacity: 2, modules: [],
        furnishingsCapacity: 2, furnishings: [], inventory: [], lab: [], capabilities: ["Mining"],
        engaged: false, activity: defaultActivity, location: null, price: 80000, id: null,
    },
    freighter: { 
        description: 'Designed to haul as much cargo as possible.',
        hp: 10, attack: '1d2', armor: 2, speed: 8, extractionPower: extractionPowerZero, researchPower: researchPowerZero, stealth: 0, travelSpeed: 1,
        crew: [], crewCapacity: [3, 5], cargoCapacity: 4000,  modCapacity: 2, modules: [],
        furnishingsCapacity: 2, furnishings: [], inventory: [], lab: [], capabilities: [],
        engaged: false, activity: defaultActivity, location: null, price: 90000, id: null,
    },
    scout: { 
        description: 'Fast and nimble, equipped with probes and advanced scanning hardware',
        hp: 8, attack: '1d2', armor: 2, speed: 14, extractionPower: extractionPowerZero, researchPower: researchPowerZero, stealth: 1, travelSpeed: 1,
        crew: [], crewCapacity: [3, 4], cargoCapacity: 500,  modCapacity: 2, modules: [], 
        inventory: [], lab: [], furnishingsCapacity: 2, furnishings: [], capabilities: ["Light Scan"],
        engaged: false, activity: defaultActivity, location: null, price: 70000, id: null,
    },
    science_vessel: {
        description: 'Equipped with state of the art laboratories and facilities to study exotic material and other life.',
        hp: 6, attack: '1d2', armor: 2, speed: 9, extractionPower: extractionPowerZero, researchPower: researchPowerBase, stealth: 0, travelSpeed: 1,
        crew: [], crewCapacity: [3, 10], cargoCapacity: 500, modCapacity: 2, modules: [],
        inventory: [], lab: [], furnishingsCapacity: 2, furnishings: [], capabilities: ["Research"],
        engaged: false, activity: defaultActivity, location: null, price: 80000, id: null,
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

const sizeModifiers = {
    Light: {
        speed: +3,
        price: 0.8, // Reduce price by 20%
        crewCapacity: { min: -1, max: -1 },
        hp: -1,
        armor: -1,
        cargoCapacity: 0.9, // Reduce cargo capacity by 10%
        modCapacity: -1,
    },
    Heavy: {
        speed: -1,
        price: 1.5, // Increase price by 50%
        crewCapacity: { min: +3, max: +3 },
        hp: +2,
        armor: +2,
        cargoCapacity: 1.2, // Increase cargo capacity by 20%
        modCapacity: +1,
    },
};




module.exports = { sizeModifiers, manufacturerModifiers, defaultStats }