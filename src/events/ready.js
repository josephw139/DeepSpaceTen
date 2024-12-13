const { Events } = require('discord.js');
const db = require('../database/db.js');
const schedule = require('node-schedule');
const { getPlayerData, getCurrentLocationFromPlayerData } = require('../database/playerFuncs.js');
const { Fleet } = require('../modules/ships/base.js');



module.exports = {
	name: Events.ClientReady,
	once: true,
	execute: async (client) => {

		// On bot startup, reset player states
		await resetPlayerStates(client);
		
		console.log("Player states reset.");
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

async function resetPlayerStates(client) {
	// Fetch all keys from the 'player' Enmap
	//db.player.clear(); //USE TO RESET ALL PLAYERS

	const playerKeys = db.player.keyArray();
	//console.log(playerKeys);
	
	try {
		// Iterate over each key to reset the engaged status
		for (const playerId of playerKeys) {
			const playerDatabase = db.player.get(playerId); // array of player info stored in the db
			//const playerData = getPlayerData(playerId); // convenient things
			// console.log(playerDatabase);

			// Retrieve and recreate the fleet
			const fleetArray = playerDatabase.fleet;
			
			const fleet = new Fleet(fleetArray);
			
			const activeShip = fleet.getActiveShip();
			//console.log(activeShip);
			//console.log('\n\nPLAYER DATA:\n\n')
			//console.log(playerDatabase)

			// Reset 'engaged' status to false
			fleet.ships.forEach(ship => {
				ship.engaged = false;
				ship.activity = "Crew on standby, ship conserving power";

			})

			try {
				// Resolve Mining jobs of each ship on bot reboot
				for (const [shipId] of Object.entries(playerDatabase.mining)) {
					const ship = fleet.ships.find(s => s.id === shipId);

					if (!ship) {
						db.player.delete(`${playerId}`, `mining.${shipId}`);
						continue;
					}
				}
			} catch (err) {
				// console.log("No mining jobs");
			}
			
			try {
				// Resolve Scanning jobs of each ship on bot reboot
				for (const [shipId] of Object.entries(playerDatabase.scanning)) {
					const ship = fleet.ships.find(s => s.id === shipId);

					if (!ship) {
						db.player.delete(`${playerId}`, `scanning.${shipId}`);
						continue;
					}
				}
			} catch (err) {
				// console.log("No scanning jobs");
			}

			try {
				// Resolve Research jobs of each ship on bot reboot
				for (const [shipId] of Object.entries(playerDatabase.research)) {
					const ship = fleet.ships.find(s => s.id === shipId);

					if (!ship) {
						db.player.delete(`${playerId}`, `research.${shipId}`);
						continue;
					}
				}
			} catch (err) {
				// console.log("No research jobs");
			}
			

			try {
				// Resolve Travel jobs of each ship on bot reboot
				for (const [shipId] of Object.entries(playerDatabase.travel)) {
					const ship = fleet.ships.find(s => s.id === shipId);

					if (!ship) {
						db.player.delete(`${playerId}`, `travel.${shipId}`);
						continue;
					}

					const shipIdString = String(shipId);
					const travelJob = playerDatabase.travel[shipIdString];

					const currentSystem = ship.location.currentSystem;
					const destinationObject = currentSystem.locations.find(location => location.name === travelJob.destination);
					const channelId = travelJob.channelId;

					const channel = await client.channels.fetch(channelId);

					if (destinationObject) {
						//console.log(destinationObject);
						//db.player.set(`${playerId}`, destinationObject, "location.currentLocation");
						ship.location.currentLocation = destinationObject;
						//console.log('\n\nARRIVAL:\n\n');
						//console.log(fleet);
				
						// Clear destination and arrival time
						db.player.delete(`${playerId}`, `travel.${shipId}`);
				
						db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");

						await channel.send({ content: `<@${playerId}>, ${ship.name} has arrived at ${ship.location.currentLocation.name}` });

					} else {
						console.error(`Destination ${destinationName} not found in the current system for player ${playerId}.`);
					}
				}
			} catch (err) {
				// console.log("No travel jobs");
			}
			
		}
	} catch (err) {
		console.log(err);
	}


		//db.player.set(playerId, false, "engaged");
		//db.player.set(`${playerId}`, "Crew on standby, ship conserving power", "activity");


		// Handle ongoing travel jobs, if the bot restarted mid-travel
		/*
		if (playerDatabase.location && playerDatabase.location.destination && playerDatabase.location.channelId) {
			const currentSystem = playerDatabase.location.currentSystem;
			const destinationObject = currentSystem.locations.find(location => location.name === playerDatabase.location.destination);
			const channelId = playerDatabase.location.channelId;
			const channel = await client.channels.fetch(channelId);

			if (destinationObject) {
				db.player.set(`${playerId}`, destinationObject, "location.currentLocation");
				await channel.send({ content: `<@${playerId}>, you've arrived at ${playerDatabase.location.destination}` });

				// Clear destination and arrival time
				db.player.delete(`${playerId}`, `location.destination`);
				db.player.delete(`${playerId}`, `location.arrivalTime`);
				db.player.delete(`${playerId}`, `location.channelId`);
			}
		}*/
}