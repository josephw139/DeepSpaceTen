// List of shop items. This should eventually be stored in the database so it can be updated realtime

const { Fleet, capitalize } = require('../../modules/ships/base');

// rarity: 1 - common, 2 - uncommon, 3 - rare, 4 - extra rare, - 5 super extra rare

const shopListFurnishings = {
    home_theater: {
        type: "furnishing",
        name: `Home Theater`,
        description: `A viewing area for your crew to catch up on movies and shows, helping keep morale up.`,
        price: 2000,
        quantity: 1,
        weight: 0,
        rarity: 1,
    },
    luxury_housing: {
        type: "furnishing",
        name: `Luxury Housing`,
        description: `Fight off space fatigue with luxorious and decadent comforts and soft pillows.`,
        price: 5000,
        quantity: 1,
        weight: 0,
        rarity: 1,
    },
    casino: {
        type: "furnishing",
        name: `Casino`,
        description: `Not a real casino, but as close as you can get on a small spaceship.`,
        price: 1700,
        quantity: 1,
        weight: 0,
        rarity: 1,
    },
    indoor_pool: {
        type: "furnishing",
        name: "Indoor Pool",
        description: `An indoor swimming pool and hot tub, perfect for relaxation. Don't turn off the artifical gravity.`,
        price: 3000,
        quantity: 1,
        weight: 0,
        rarity: 1,
    }
}

module.exports = { shopListFurnishings };