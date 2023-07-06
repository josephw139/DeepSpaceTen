const Enmap = require("enmap");
const { Cruiser } = require('../modules/ships/cruiser');

const serializer = (data) => {
  return data;
};

const deserializer = (data) => {
  return {
    ...data,
    // gets the guild itself from the cache from its ID
    guild: client.guilds.cache.get(data.guild),
  }
};

module.exports = {
    squadrons: new Enmap({
      name: "squadrons"
    })
  }