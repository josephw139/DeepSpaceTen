// fleetUtils.js

const { Fleet } = require('../modules/ships/base');
const db = require('./db');
const sectors = require('./locations');


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
        // const location = db.player.get(`${playerId}`, "location");
        // const locationDisplay = `Sector: ${location.currentSector}\nSystem: ${location.currentSystem.name}\nLocation: ${typeof location.currentLocation === "string" ? location.currentLocation : location.currentLocation.name}`;
        const location = activeShip.location;
        const locationDisplay = `Sector: ${location.currentSector}\nSystem: ${location.currentSystem.name}\nLocation: ${typeof location.currentLocation === "string" ? location.currentLocation : location.currentLocation.name}`;

        // Retrieve engaged status
        // const isEngaged = db.player.get(`${playerId}`, "engaged");
        const isEngaged = activeShip.engaged;

        // Retrieve activity status
        // const activity = db.player.get(`${playerId}`, "activity");
        const activity = activeShip.activity;
        // console.log(activeShip);

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
            activity,
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

// Helper function to find the current location object in the sectors data
function getCurrentLocationFromPlayerData(shipLocationData) {
    const { currentSector, currentSystem, currentLocation } = shipLocationData;
    const sector = sectors.sectors[currentSector];

    if (!sector) {
        console.error(`Sector ${currentSector} not found.`);
        return null;
    }

    const system = sector.systems.find(s => s.name === currentSystem.name);
    if (!system) {
        console.error(`System ${currentSystem.name} not found in sector ${currentSector}.`);
        return null;
    }

    const location = system.locations.find(l => l.name === currentLocation.name);
    if (!location) {
        console.error(`Location ${currentLocation.name} not found in system ${currentSystem.name}.`);
        return null;
    }

    console.log(location);
    return location;
}


module.exports = { getPlayerData, getCurrentLocationFromPlayerData, updateDiscovery, isDiscovered };
