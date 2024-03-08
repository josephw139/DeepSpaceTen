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
    }
}

module.exports = { shopList };