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

        // Retrieve engaged status
        const isEngaged = db.player.get(`${playerId}`, "engaged");

        // Retrieve hangar
        const hangar = db.player.get(`${playerId}`, "hangar");

        // Retrieve discoveries
        const discoveries = db.player.get(`${playerId}`, "discoveries");

        // Retrieve credits
        const credits = db.player.get(`${playerId}`, "credits");

        // Retrieve career
        const career = db.player.get(`${playerId}`, "career");

        // Return the aggregated data
        return {
            fleet,
            isEngaged,
            activeShip,
            location,
            locationDisplay,
            hangar,
            discoveries,
            credits,
            career,
        };
    } catch (e) {
        console.error(e);
        // Handle the error appropriately
        return `Please use /start to gain access to commands, or /help to learn about the game!`
    }
}


function updateDiscovery(playerId, type, name) {
    const playerData = db.player.get(`${playerId}`, "discoveries");
    if (type === "Sector" && !playerData.discoveredSectors.includes(name)) {
        playerData.discoveredSectors.push(name);
    } else if (type === "System" && !playerData.discoveredSystems.includes(name)) {
        playerData.discoveredSystems.push(name);
    }
    db.player.set(`${playerId}`, playerData, "discoveries");
}

function isDiscovered(playerId, type, name) {
    const discoveries = db.player.get(`${playerId}`, "discoveries");
    if (type === "Sector") {
        return discoveries.discoveredSectors.includes(name);
    } else if (type === "System") {
        return discoveries.discoveredSystems.includes(name);
    }
    return false;
}




module.exports = { getPlayerData, updateDiscovery, isDiscovered };
