// List of shop items. This should eventually be stored in the database so it can be updated realtime

const { Fleet, capitalize } = require('../../modules/ships/base');

// rarity: 1 - common, 2 - uncommon, 3 - rare, 4 - extra rare, - 5 super extra rare

const shopListEquipment = {
    personal_energy_shield: {
        type: "equipment",
        name: `Personal Energy Shield`,
        description: `A bubble field surrounds the wearer, providing great protection at the cost of power.`,
        price: 5000,
        quantity: 1,
        weight: 0,
        rarity: 3,
        stacking: false,
        stats: {
            armor: +10,
        }
    },
}

module.exports = { shopListEquipment };