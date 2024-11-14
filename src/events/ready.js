const { Events } = require('discord.js');
const db = require('../database/db.js');
const schedule = require('node-schedule');

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
	const playerKeys = db.player.keyArray();

	// Iterate over each key to reset the engaged status
	for (const playerId of playerKeys) {
		const playerData = db.player.get(playerId);

		// Reset 'engaged' status to false
		db.player.set(playerId, false, "engaged");
		db.player.set(`${playerId}`, "Crew on standby, ship conserving power", "activity");


		// Handle ongoing travel jobs, if the bot restarted mid-travel
		if (playerData.location && playerData.location.destination && playerData.location.channelId) {
			const currentSystem = playerData.location.currentSystem;
			const destinationObject = currentSystem.locations.find(location => location.name === playerData.location.destination);
			const channelId = playerData.location.channelId;
			const channel = await client.channels.fetch(channelId);

			if (destinationObject) {
				db.player.set(`${playerId}`, destinationObject, "location.currentLocation");
				await channel.send({ content: `<@${playerId}>, you've arrived at ${playerData.location.destination}` });

				// Clear destination and arrival time
				db.player.delete(`${playerId}`, "location.destination");
				db.player.delete(`${playerId}`, "location.arrivalTime");
				db.player.delete(`${playerId}`, "location.channelId");
			}
		}
	}
}