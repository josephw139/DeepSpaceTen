const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { miningResources, hiddenMessages, randomizeInput, getRndInteger} = require('../../database/locationResources.js');
const schedule = require('node-schedule');

const jobReferences = new Map();

module.exports = {
	data: new SlashCommandBuilder()
	.setName('scan')
	.setDescription('Scan and probe a location for hidden valuables.')
	.addStringOption(option =>
        option.setName("job")
            .setDescription("Start or cancel scans")
            .setRequired(true)
            .addChoices(
                { name: 'start', value: 'start' },
                { name: 'stop', value: 'stop' },
            ))
	,
	async execute(interaction) {
        //console.log(sectors);
        const member = interaction.member;
        const playerId = member.id;
		const channel = interaction.channel;
		const job = interaction.options.get('job').value;

		const playerData = getPlayerData(playerId);
        if (typeof playerData === 'string') {
            interaction.editReply(playerData);
        }
        
        const {
            fleet, location, locationDisplay, activeShip, isEngaged
        } = playerData;

        const liveLocation = getCurrentLocationFromPlayerData(location);

		if (job === "start") {
			if (!isEngaged) {
				const canScan = liveLocation.activities.includes('Scan');
				const lightScan = activeShip.capabilities.includes("Light Scan");
                const deepScan = activeShip.capabilities.includes("Deep Scan");
                const minCrew = activeShip.crew.length >= activeShip.crewCapacity[0];

				if (canScan && lightScan && minCrew ) {
					startScanning(member.id, liveLocation, activeShip, fleet, lightScan, deepScan);
					await interaction.editReply({ content: `You've started scanning! Scans will complete every hour`, ephemeral: true });
				} else if (!canScan) {
					await interaction.editReply({ content: `You can't scan at this location`, ephemeral: true });
				} else if (!lightScan) {
					await interaction.editReply({ content: `This ship doesn't have scanning capabilities`, ephemeral: true });
				} else if (!minCrew) {
                    await interaction.editReply({ content: `You don't have enough crew staffing the ship`, ephemeral: true });
                }
			} else {
				await interaction.editReply({ content: `You're already engaged in another activity`, ephemeral: true });
			}
		} else {
			if (isEngaged) {
				const scanningDetails = db.player.get(`${playerId}`, "scanning.details");
				const jobToCancel = jobReferences.get(scanningDetails.jobId);
				if (jobToCancel) {
					jobToCancel.cancel();
					jobReferences.delete(scanningDetails.jobId); // Remove the reference after cancelling
					db.player.delete(`${playerId}`, "scanning.details"); // Clean up database entries
					db.player.delete(`${playerId}`, "scanning.startTime");
					db.player.set(`${playerId}`, false, "engaged");
                    db.player.set(`${playerId}`, "Crew on standby, ship conserving power", "activity");
					//await interaction.reply({ content: `Scanning job finished`, ephemeral: true });

                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.editReply({ content: `Scanning finished`, ephemeral: true });
                    } else {
                        await interaction.followUp({ content: `Scanning finished`, ephemeral: true });
                    }
                    
				}
			} else {
				await interaction.editReply({ content: `You weren't scanning.`, ephemeral: true });
			}
		}
	}
};

function startScanning(playerId, location, activeShip, fleet, lightScan, deepScan) {
    const startTime = new Date();

    db.player.set(`${playerId}`, startTime, "scanning.startTime");
	db.player.set(`${playerId}`, true, "engaged");
    db.player.set(`${playerId}`, `${activeShip.name}'s crew is scanning at ${location.name}`, "activity");

    // Get the current minute to start the cron job at that minute every hour
    const currentMinute = startTime.getMinutes();
    const cronExpression = `${currentMinute} * * * *`;  // This will fire at 'currentMinute' every hour

    // ${currentMinute} Schedule a job to run every hour

	const jobId = `${playerId}-${Date.now()}`;
    const job = schedule.scheduleJob(jobId, cronExpression, function() {
		const shipName = activeShip.name;
        const ship = getShipFromFleet(shipName, fleet);
		// console.log(ship);
		
        if (ship) {
            try {
                const item = calculateScanning(location, activeShip.morale, lightScan, deepScan);
                const totalWeight = getTotalWeight(ship.inventory);
                const itemWeight = item.weight;

				// console.log(item);
                if (totalWeight + itemWeight <= ship.cargoCapacity) {
                    updateShipInventory(playerId, shipName, item, fleet);
                } else {
					this.cancel();
					db.player.delete(`${playerId}`, "scanning.startTime");
					db.player.set(`${playerId}`, false, "engaged");
                    db.player.set(`${playerId}`, "Crew on standby, ship conserving power", "activity");
                }
            } catch (e) {
                console.error(e);
            }
        } else {
			//console.log(activeShip);
			//console.log(ship);
		}
    });
	jobReferences.set(jobId, job);
	db.player.set(`${playerId}`, { jobId: jobId, startTime: new Date() }, "scanning.details");

}


function updateShipInventory(playerId, shipName, item, fleet) {
    const shipIndex = fleet.ships.findIndex(s => s.name === shipName);
    if (shipIndex !== -1) {
        const ship = fleet.ships[shipIndex];
        const itemEntry = ship.inventory.find(shipItem => shipItem.name === item.type);
        const itemWeight = item.weight;

        if (itemEntry && itemEntry.description == item.description) {
            itemEntry.quantity += item.quantity;
            itemEntry.weight += itemWeight;
        } else {
            ship.inventory.push({
                name: item.type,
                quantity: item.quantity,
                weight: itemWeight,
                description: item.description,
                sell_price: item.sell_price,
            });
        }

        fleet[shipIndex] = ship; 
        db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
    } else {
        console.error(`Ship with name ${shipName} not found in the fleet.`);
    }
}


function getTotalWeight(inventory) {
    return inventory.reduce((total, item) => total + (item.weight || 0), 0);
}

function getShipFromFleet(shipName, fleet) {
    return fleet.ships.find(s => s.name === shipName);
}


function calculateScanning(location, morale, lightScan, deepScan) {
    // Check if there are unique items and ensure the array is not empty
    if (location.unique_items && location.unique_items.length > 0) {
        let totalChance = 0;
        // console.log(location.unique_items);

        // Sum up all chances (either adjustedChance or baseChance)
        for (const unique of location.unique_items) {
            const chance = unique.adjustedChance || unique.item.baseChance;
            totalChance += chance;
        }

        // Generate a random threshold to select an item based on its chance
        let randomThreshold = Math.random() * totalChance;

        // Iterate over each item and decrement the threshold by the item's chance
        for (const unique of location.unique_items) {
            const chance = unique.adjustedChance || unique.item.baseChance;
            randomThreshold -= chance;
            
            // Check if the threshold has been crossed
            if (randomThreshold <= 0) {
                let itemDescription = unique.item.name === 'Hidden Message' ? randomizeInput(hiddenMessages) : unique.item.description;

                return {
                    type: unique.item.name,
                    quantity: unique.item.quantity,
                    weight: unique.item.weight,
                    sell_price: unique.item.sell_price,
                    description: itemDescription,
                };
            }
        }
    } else {
        console.log("No unique items available for scanning.");
    }
    // If no item is selected (e.g., due to rounding errors or empty items list), return null
    return null;
}

// Helper function to find the current location object in the sectors data
function getCurrentLocationFromPlayerData(playerLocationData) {
    const { currentSector, currentSystem, currentLocation } = playerLocationData;
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
