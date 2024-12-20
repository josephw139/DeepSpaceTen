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
        /*.addStringOption(option => TEMP REMOVED UNTIL INTERSYSTEM TRAVEL IS IMPLEMENTED
            option.setName("system")
                .setDescription("Choose a system, or leave blank for your current system.")
                .setRequired(false))*/
    ,
    async execute(interaction) {
		const member = interaction.member;
        const playerId = member.id;
		const channel = interaction.channel;

        const PlayerData = getPlayerData(playerId);
        if (typeof PlayerData === 'string') {
            interaction.editReply(PlayerData);
        }

        const { 
			hangar, fleet, activeShip, isEngaged,
			location, activity, locationDisplay, credits 
		} = PlayerData;

        const discoveries = db.player.get(`${playerId}`, "discoveries");
        const currentSystemName = location.currentSystem.name;
        const systemNameToTravel = interaction.options.getString('system') || currentSystemName;
        
        const systemToTravel = findSystemByName(systemNameToTravel, discoveries);

        if (isEngaged) {
            await interaction.editReply({ content: `This ship is already engaged in another activity.`, components: [] });
            return;
        }

        if (!systemToTravel) {
            await interaction.editReply({ content: `System "${systemNameToTravel}" not found.`, ephemeral: true });
            return;
        }

        const minCrew = activeShip.crew.length >= activeShip.crewCapacity[0];
        if (!minCrew) {
            interaction.channel.send({ content: `WARNING: ${activeShip.name} does not meet minimum crew thresholds. Traveling will take longer and be less safe, and certain operations will not be doable.`, ephemeral: true })
        }


		const locations = getLocationsForSystem(systemToTravel, location.currentLocation.name);

        // Create a dropdown menu with locations as options
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select-destination')
                    .setPlaceholder('Choose your destination')
                    /*.addOptions([
                        { label: 'Cancel', value: 'cancel' },
                    ])*/
                    .addOptions(locations.map(location => ({
                        label: location.name,
                        value: location.name
                    }))),
            );

        // Reply with the dropdown menu
        await interaction.editReply({ content: 'Select your destination:', components: [row] });
        

		// Handle the dropdown selection
        const filter = (i) => i.customId === 'select-destination' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            const selectedLocation = i.values[0];
            const travelTime = calculateTravelTime(location, selectedLocation, minCrew, activeShip);
            scheduleTravel(playerId, fleet, activeShip.id, selectedLocation, travelTime, channel); 

            await i.channel.send({ content: `${activeShip.name} will arrive at ${selectedLocation} in ${Math.floor(travelTime / 60)} minutes.`, components: [] });
        });

        collector.on('end', collected => {
            if (!collected.size) interaction.update({ content: 'Travel command timed out. Please try again.', ephemeral: true });
            return;
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

function calculateTravelTime(location, selectedLocation, minCrew, activeShip) {
	const currentSector = location.currentSector;
	const currentSystem = location.currentSystem;
	const currentLocation = location.currentLocation;

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

function scheduleTravel(playerId, fleet, shipId, destination, travelTime, channel) {
    
    const ship = fleet.ships.find(s => s.id === shipId);

	// multiply travelTime by 10000 if travelTime is minutes, 1000 for seconds)
    const arrivalTime = new Date(new Date().getTime() + travelTime * 1000);
    // Schedule a job to update the player's location
    schedule.scheduleJob(arrivalTime, () => {
        completeTravel(playerId, fleet, shipId, destination, channel);
    });

    // Update player's travel destination and expected arrival time in the database
	//db.player.set(`${playerId}`, `En route to ${destination}`, `${activeShip.id}.location.currentLocation`);
    db.player.set(`${playerId}`, destination, `travel.${ship.id}.destination`);
    db.player.set(`${playerId}`, arrivalTime, `travel.${ship.id}.arrivalTime`);
    db.player.set(`${playerId}`, channel.id, `travel.${ship.id}.channelId`);

    ship.engaged = true;
    ship.activity = `Hurtling through space!`;
    ship.location.currentLocation = {name: `En route to ${destination}.`};
    db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");

}

async function completeTravel(playerId, fleet, shipId, destination, channel) {

    const ship = fleet.ships.find(s => s.id === shipId);

    // Update player's current location
	// const locations = db.player.get(`${playerId}`, 'location');
    const locations = ship.location;
	const currentSystem = locations.currentSystem;
	const destinationObject = currentSystem.locations.find(location => location.name === destination);

	if (destinationObject) {
		//db.player.set(`${playerId}`, destinationObject, "location.currentLocation");
        ship.location.currentLocation = destinationObject;

		// Clear destination and arrival time
		db.player.delete(`${playerId}`, `travel.${ship.id}`);

        ship.engaged = false;
        ship.activity = "Crew on standby, ship conserving power.";
        db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
        await channel.send({ content: `<@${playerId}>, ${ship.name} has arrived at ${ship.location.currentLocation.name}` });

	} else {
		console.error(`Destination ${destinationName} not found in the current system for player ${playerId}.`);
	}
    
	//console.log(db.player.get(`${playerId}`, 'location'));

} 