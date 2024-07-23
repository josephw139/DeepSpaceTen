const { shopListUpgrades } = require('./shopListUpgrades');
const { shopListFurnishings } = require('./shopListFurnishings');
const { shopListEquipment } = require('./shopListEquipment');

const shopList = {
    upgrades: shopListUpgrades,
    furnishings: shopListFurnishings,
    equipment: shopListEquipment,
};

module.exports = { shopList };
