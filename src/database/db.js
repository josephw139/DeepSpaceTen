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
  *   credits: 500,
  *   discoveries: {
  *     discoveredSectors: [
  *         "Southeast", // starter sector is discovered by default
  *     ],
  *     discoveredSystems: [
  *         "Argus' Beacon" // starter system is discovered by default
  *     ]
  *   }
  * 
  *   location: {
          currentSector: 'Southeast',
          currentSystem: {
            name: "Argus' Beacon",
            description: 'The starting point for all new adventurers, offering a safe haven and opportunities for those willing to explore.',
            locations: [ [Object], [Object], [Object] ]
          },
          currentLocation: {
            name: 'G-357 Asteroid Belt',
            description: 'A mineral-rich belt of asteroids, promising wealth to those who dare to mine it.',
            activities: [ 'Mine', 'Research' ],
            mining: { Ore: 'Medium', Gas: 'Low', Adamantium: 'Very_Low' },
            research: 'Low'
          }
        }
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