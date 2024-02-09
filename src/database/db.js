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
    player: new Enmap({
      name: "player"
    }),
  }

  /*
  * db.player has the following attributes:
  * {
  *   engaged: false,
  *   fleet: [fleetArray],
  *   hangar: [],
  *   discoveries: {
  *     discoveredSectors: [
  *         "Southeast", // starter sector is discovered by default
  *     ],
  *     discoveredSystems: [
  *         "StarterSystem" // starter system is discovered by default
  *     ]
  *   }
  * 
  *   location: { // sectors is a variable containing all locations in locations.js //
  *               currentSector: 'Southeast',
  *               currentSystem: sectors.Southeast[0], 
  *               currentLocation: sectors.Southeast[0].locations[0]
  *             },
  *   location.destination: "location.name", // deleted on completion //
  *   location.arrivalTime: Date(), // deleted on completion //
  *   location.channelId: channel.id, // deleted on completion //
  * 
  *   mining.startTime: Date(), // deleted on completion
  *   mining.miningDetails: { jobId: jobId, startTime: new Date() }, // deleted on completion //
  * 
  * 
  * 
  * }
  */