// fleetUtils.js

const { Fleet } = require('../modules/ships/base');
const db = require('./db');


// returns playerData object
// playerData.fleet
// playerData.activeShip
// playerData.location
// playerData.locationDisplay
function getPlayerData(playerId) {
    try {
        // Retrieve and recreate the fleet
        const fleetArray = db.player.get(`${playerId}`, "fleet");
        const fleet = new Fleet(fleetArray);
        const activeShip = fleet.getActiveShip();

        // Retrieve the location
        const location = db.player.get(`${playerId}`, "location");
        const locationDisplay = `Sector: ${location.currentSector}\nSystem: ${location.currentSystem.name}\nLocation: ${typeof location.currentLocation === "string" ? location.currentLocation : location.currentLocation.name}`;

        // Return the aggregated data
        return {
            fleet,
            activeShip,
            location,
            locationDisplay
        };
    } catch (e) {
        console.error(e);
        // Handle the error appropriately
        throw new Error("Player data retrieval failed");
    }
}


module.exports = { getPlayerData };
