const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../locations/locations.js');
const db = require('../../database/db.js');
const schedule = require('node-schedule');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('travel')
        .setDescription('Sail through the stars'),
    async execute(interaction) {
		const member = interaction.member;
        const playerId = member.id;
		const channel = interaction.channel;
        const playerData = db.player.get(`${member.id}`, "location");
        const currentSystem = playerData.currentSystem;


		function getLocationsForSystem(currentSystem, currentLocationName) {
			// Filter out the current location from the system's locations
			console.log('getLocations function:' + currentLocationName)
			return currentSystem.locations.filter(location => location.name !== currentLocationName);
		}

		const locations = getLocationsForSystem(currentSystem, playerData.currentLocation.name);

        // Create a dropdown menu with locations as options
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select-destination')
                    .setPlaceholder('Choose your destination')
                    .addOptions(locations.map(location => ({
                        label: location.name,
                        value: location.name
                    }))),
            );

        // Reply with the dropdown menu
        await interaction.reply({ content: 'Select your destination:', components: [row] });

		// Handle the dropdown selection
        const filter = (i) => i.customId === 'select-destination' && i.user.id === interaction.user.id;
        interaction.channel.awaitMessageComponent({ filter, time: 120000 }) // 120-second wait for response
            .then(i => {
                const isEngaged = db.player.get(`${playerId}`, "engaged");
                if (!isEngaged) {
                    const selectedLocation = i.values[0];
                    const travelTime = calculateTravelTime(playerData, selectedLocation); // Implement your logic to calculate travel time

                    // Schedule the completion of the travel
                    scheduleTravel(member.id, selectedLocation, travelTime, channel);

                    i.channel.send({ content: `You will arrive in ${travelTime} minutes.`, components: [] });
                }  else {
                    i.channel.send({ content: `You're already engaged in another activity`, components: [] });
                }
            })
            
    },
};

function calculateTravelTime(playerData, selectedLocation) {
	const currentSector = playerData.currentSector;
	const currentSystem = playerData.currentSystem;
	const currentLocation = playerData.currentLocation;

	const locationExists = currentSystem.locations.some(location => location.name === selectedLocation);

	if (locationExists) {
        let travelTime = 60;
        return travelTime;
    }
}

function scheduleTravel(playerId, destination, travelTime, channel) {
	// multiply travelTime by 10000 if travelTime is minutes, 1000 for seconds)
    const arrivalTime = new Date(new Date().getTime() + travelTime * 1000);
    // Schedule a job to update the player's location
    schedule.scheduleJob(arrivalTime, () => {
        completeTravel(playerId, destination, channel);
    });

    // Update player's travel destination and expected arrival time in the database
	db.player.set(`${playerId}`, `En route to ${destination}`, "location.currentLocation")
    db.player.set(`${playerId}`, destination, "location.destination");
    db.player.set(`${playerId}`, arrivalTime, "location.arrivalTime");
    db.player.set(`${playerId}`, channel.id, "location.channelId");
    db.player.set(`${playerId}`, true, "engaged");
}

async function completeTravel(playerId, destination, channel) {
    // Update player's current location
	const locations = db.player.get(`${playerId}`, 'location');
	const currentSystem = locations.currentSystem;
	const destinationObject = currentSystem.locations.find(location => location.name === destination);

	if (destinationObject) {
		db.player.set(`${playerId}`, destinationObject, "location.currentLocation");

		// Clear destination and arrival time
		db.player.delete(`${playerId}`, "location.destination");
		db.player.delete(`${playerId}`, "location.arrivalTime");
        db.player.delete(`${playerId}`, "location.channelId");
        db.player.set(`${playerId}`, false, "engaged");
	} else {
		console.error(`Destination ${destinationName} not found in the current system for player ${playerId}.`);
	}
    
	console.log(db.player.get(`${playerId}`, 'location'));

    await channel.send({ content: `<@${playerId}>, you've arrived at ${destination}` });
} 