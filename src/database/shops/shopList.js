const { shopListModules } = require('./shopListModules');
const { shopListFurnishings } = require('./shopListFurnishings');
const { shopListEquipment } = require('./shopListEquipment');

const shopList = {
    modules: shopListModules,
    furnishings: shopListFurnishings,
    equipment: shopListEquipment,
};

module.exports = { shopList };
