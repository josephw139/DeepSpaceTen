const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const schedule = require('node-schedule');
const { getPlayerData } = require('../../database/playerFuncs.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('travel')
        .setDescription('Sail through the stars')
        .addStringOption(option =>
            option.setName("system")
                .setDescription("Choose a system, or leave blank for your current system.")
                .setRequired(false))
    ,
    async execute(interaction) {
		const member = interaction.member;
        const playerId = member.id;
		const channel = interaction.channel;
        // rework to use playerData function
        const actualPlayerData = getPlayerData(playerId);
        if (typeof actualPlayerData === 'string') {
            interaction.editReply(actualPlayerData);
        }
        
        const { activeShip } = actualPlayerData;

        const playerData = db.player.get(`${member.id}`, "location");
        const discoveries = db.player.get(`${playerId}`, "discoveries");
        const currentSystemName = playerData.currentSystem.name;
        const systemNameToTravel = interaction.options.getString('system') || currentSystemName;
        
        const systemToTravel = findSystemByName(systemNameToTravel, discoveries);

        if (!systemToTravel) {
            await interaction.editReply({ content: `System "${systemNameToTravel}" not found.`, ephemeral: true });
            return;
        }

        const minCrew = activeShip.crew.length >= activeShip.crewCapacity[0];
        if (!minCrew) {
            interaction.channel.send({ content: `WARNING: ${activeShip.name} does not meet minimum crew thresholds. Traveling will take longer and be less safe, and certain operations will not be doable.`, ephemeral: true })
        }


		const locations = getLocationsForSystem(systemToTravel, playerData.currentLocation.name);

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
        await interaction.editReply({ content: 'Select your destination:', components: [row] });

		// Handle the dropdown selection
        const filter = (i) => i.customId === 'select-destination' && i.user.id === interaction.user.id;
        interaction.channel.awaitMessageComponent({ filter, time: 120000 }) // 120-second wait for response
            .then(i => {
                const isEngaged = db.player.get(`${playerId}`, "engaged");
                if (!isEngaged) {
                    const selectedLocation = i.values[0];
                    const travelTime = calculateTravelTime(playerData, selectedLocation, minCrew, activeShip); // Implement your logic to calculate travel time

                    // Schedule the completion of the travel
                    scheduleTravel(member.id, selectedLocation, travelTime, channel);

                    i.channel.send({ content: `You will arrive in ${Math.floor(travelTime / 60)} minutes.`, components: [] });
                }  else {
                    i.channel.send({ content: `You're already engaged in another activity`, components: [] });
                }
            })
            .catch(e => {
                if (e.code === 'InteractionCollectorError') {
                    channel.send({ content: `Travel selection has timed out. Please select your destination again.` });
                } else {
                    // Log other errors for debugging
                    console.error('Error in awaitMessageComponent:', e);
                }
            });
            
    },
};

function findSystemByName(systemName, discoveries) {
    const sectorsData = sectors.sectors;

    for (const sector of Object.values(sectorsData)) {
        for (const system of sector.systems) {
            if (system.name === systemName && discoveries.discoveredSystems.includes(systemName)) {
                return system;
            }
        }
    }
    return null;
}

function getLocationsForSystem(systemToTravel, currentLocationName) {
    // Filter out the current location from the system's locations
    //console.log('getLocations function:' + currentLocationName)
    return systemToTravel.locations.filter(location => location.name !== currentLocationName);
}

function calculateTravelTime(playerData, selectedLocation, minCrew, activeShip) {
	const currentSector = playerData.currentSector;
	const currentSystem = playerData.currentSystem;
	const currentLocation = playerData.currentLocation;

	const locationExists = currentSystem.locations.some(location => location.name === selectedLocation);

	if (locationExists) {
        let travelTime = 3600; // 3600 = one hour

        // randomly add -5 to 5 minutes to travel time
        const adjustmentSeconds = Math.floor(Math.random() * 601) - 300; // Generates a number between -300 and 300 (5 minutes)
        travelTime += adjustmentSeconds;

        // ship's speed
        const baseSpeed = 10;
        const speedDifference = activeShip.speed - baseSpeed;
        travelTime = travelTime * (1 - speedDifference * 0.03);

        // ship's travelTime
        if (activeShip.travelSpeed > 1) {
            const travelSpeedAdjustmentFactor = 0.1 * (activeShip.travelSpeed - 1);
            travelTime *= 1 - travelSpeedAdjustmentFactor;
        }

        if (!minCrew) {
            travelTime *= 1.5;
        }
        if (activeShip.morale == 10) {
            travelTime *= 0.95;
        } else if (activeShip.morale == 6 || activeShip.morale == 5) {
            travelTime *= 1.04;
        } else if (activeShip.morale < 5 && activeShip.morale > 1) {
            travelTime *= 1.08;
        } else if (activeShip.morale <= 1) {
            travelTime *= 1.12;
        }
        travelTime = Math.floor(travelTime);
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
    db.player.set(`${playerId}`, `Your ship is en route to ${destination}`, "activity");

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
        db.player.set(`${playerId}`, "Crew on standby, ship conserving power", "activity");
	} else {
		console.error(`Destination ${destinationName} not found in the current system for player ${playerId}.`);
	}
    
	//console.log(db.player.get(`${playerId}`, 'location'));

    await channel.send({ content: `<@${playerId}>, you've arrived at ${destination}` });
} 