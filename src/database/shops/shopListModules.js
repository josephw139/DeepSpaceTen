// List of shop items. This should eventually be stored in the database so it can be updated realtime

const { Fleet, capitalize } = require('../../modules/ships/base');

// rarity: 1 - common, 2 - uncommon, 3 - rare, 4 - extra rare, - 5 super extra rare

const shopListModules = {
    exterior_cargo_bay: {
        type: "module",
        name: `Exterior Cargo Bay`,
        description: `Increase your ship's cargo capacity by 2000.\nSpecial: Stacks`,
        price: 24000,
        quantity: 1,
        weight: 0,
        rarity: 3,
        stacking: true,
        stats: {
            cargoCapacity: +2000,
        }
    },
    cargo_hold_expansion: {
        type: "module",
        name: `Exterior Cargo Bay`,
        description: `Increase your ship's cargo capacity by 800.\nSpecial: Stacks`,
        price: 10000,
        quantity: 1,
        weight: 0,
        rarity: 1,
        stacking: true,
        stats: {
            cargoCapacity: +800,
        }
    },
    mining_apparatus: {
        type: "module",
        name: `Mining Apparatus`,
        description: `Allows your ship to mine, or further increases mining outputs.\nSpecial: Stacks`,
        price: 30000,
        quantity: 1,
        weight: 0,
        rarity: 1,
        stacking: true,
        stats: {
            extractionPower: {
                ore: 0.5,
                gas: 0.5,
            },
        },
        capabilities: ["Mining"],
    },
    gas_extractor: {
        type: "module",
        name: `Gas Extractor`,
        description: `Increases gas mining efficiency. Does not add Mining capability.\nSpecial: Stacks`,
        price: 40000,
        quantity: 1,
        weight: 0,
        rarity: 2,
        stacking: true,
        stats: {
            extractionPower: {
                gas: 1,
            },
        },
    },
    ore_refinery: {
        type: "module",
        name: `Ore Refinery`,
        description: `In-ship refinery allows for an increased ore output. Does not add Mining capability.\nSpecial: Stacks`,
        price: 30000,
        quantity: 1,
        weight: 0,
        rarity: 2,
        stacking: true,
        stats: {
            extractionPower: {
                ore: 1,
            },
        },
    },
    science_lab: {
        type: "module",
        name: `Science Lab`,
        description: `Allows your ship to research, or further increases research outputs.\nSpecial: Stacks`,
        price: 30000,
        quantity: 1,
        weight: 0,
        rarity: 1,
        stacking: true,
        stats: {
            researchPower: 0.5,
        },
        capabilities: ["Research"],
    },
    light_scanner: {
        type: "module",
        name: `Light Scanner`,
        description: `Allows your ship to perform better planetary and system scans. Does not increase effectiveness if the ship already has Light Scan capabilities.`,
        price: 15000,
        quantity: 1,
        weight: 0,
        rarity: 2,
        stacking: false,
        capabilities: ["Light Scan"],
    },
    abacus_retracer_retrofit: {
        type: "module",
        name: `Abacus Retracer Retrofit`,
        description: `Abacus Retracers - The technology which allows FTL travel. Decreases travel times.`,
        price: 20000,
        quantity: 1,
        weight: 0,
        rarity: 3,
        stacking: false,
        stats: {
            travelSpeed: +1,
        },
    },
    experimental_drive_upgrade: {
        type: "module",
        name: `Experimental Drive Upgrade`,
        description: `Faster is always better. Increases Speed.`,
        price: 15000,
        quantity: 1,
        weight: 0,
        rarity: 1,
        stacking: false,
        stats: {
            speed: +3,
        }
    },
    /* martian_manufacturing_synths: {
        name: `Martian Manufacturing LLC Synth Crew`,
        description: `Prototypes of the new up and coming Synthetic Human lines. Say goodbye to human crew! Reduces Minimum Crew requirements.`,
        price: 30000,
        quantity: 1,
        weight: 0,
        rarity: 3,
        stacking: false,
        stats: {
            crewCapacity: { min: 1, max: +0 },
        }
    },
    bright_futures_android_assistant: {
        name: `Bright Futures Android Assistant`,
        description: `Prototype of an advanced Android model, hard to distinguish from real people, specialized in spaceship operation. Counts as a crew, increases Speed and Mining and Research outputs.`,
        price: 30000,
        quantity: 1,
        weight: 0,
        rarity: 3,
        stacking: false,
    },*/
    deep_range_scanner: {
        type: "module",
        name: `Deep Range Scanner`,
        description: `Allows for more thorough imaging of systems and planets.`,
        price: 7000,
        quantity: 1,
        weight: 0,
        rarity: 4,
        stacking: false,
        capabilities: ["Deep Scan"],
    },
    security_team: {
        type: "module",
        name: `Security Team`,
        description: `Hired mercenaries to protect your ship. Includes an armory and barracks spaces.`,
        price: 30000,
        quantity: 1,
        weight: 0,
        rarity: 2,
        stacking: false,
    },
    stealth_drive: {
        type: "module",
        name: `Stealth Drive`,
        description: `Advanced stealth technology, helping hide ships from unwanted attention.`,
        price: 20000,
        quantity: 1,
        weight: 0,
        rarity: 4,
        stacking: false,
        stats: {
            stealth: +4,
        }
    }
}

module.exports = { shopListModules };