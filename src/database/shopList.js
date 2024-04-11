// List of shop items. This should eventually be stored in the database so it can be updated realtime

const { Fleet, capitalize } = require('../modules/ships/base');

const shopList = {
    ships: {
        
    },
    upgrades: {
        cargo_storage: {
            name: `Exterior Cargo Bay`,
            description: `Increase your ship's cargo capacity by 750.`,
            price: 10000,
            quantity: 1,
            weight: 500,
        },
        deep_range_scanner: {
            name: `Deep Range Scanner`,
            description: `Allows for more thorough imaging of systems and planets.`,
            price: 7000,
            quantity: 1,
            weight: 200,
        },
        security_team: {
            name: `Security Team`,
            description: `Hired mercenaries to protect your ship. Includes an armory and barracks spaces.`,
            price: 30000,
            quantity: 1,
            weight: 0,
        },
        stealth_drive: {
            name: `Stealth Drive`,
            description: `Advanced stealth technology, helping hide ships from unwanted attention.`,
            price: 20000,
            quantity: 1,
            weight: 400,
        }
    },
    furnishings: {
        home_theater: {
            name: `Home Theater`,
            description: `A viewing area for your crew to catch up on movies and shows, helping keep morale up.`,
            price: 2000,
            quantity: 1,
            weight: 0,
        },
        luxury_housing: {
            name: `Luxury Housing`,
            description: `Fight off space fatigue with luxorious and decadent comforts and soft pillows.`,
            price: 5000,
            quantity: 1,
            weight: 0,
        },
        casino: {
            name: `Casino`,
            description: `Not a real casino, but as close as you can get on a small spaceship.`,
            price: 1700,
            quantity: 1,
            weight: 0
        },
        indoor_pool: {
            name: "Indoor Pool",
            description: `An indoor swimming pool and hot tub, perfect for relaxation. Don't turn off the artifical gravity.`,
            price: 3000,
            quantity: 1,
            weight: 0,
        }
    },
}

module.exports = { shopList };