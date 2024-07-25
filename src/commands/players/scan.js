const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { miningResources } = require('../../database/miningResources.js');
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

		if (job === "start") {
			if (!isEngaged) {
				const canScan = location.currentLocation.activities.includes('Scan');
				const lightScan = activeShip.capabilities.includes("Light Scan");
                const deepScan = activeShip.capabilities.includes("Deep Scan");
                const minCrew = activeShip.crew.length >= activeShip.crewCapacity[0];

				if (canScan && lightScan && minCrew ) {
					startScanning(member.id, activeShip, fleet, lightScan, deepScan);
					await interaction.editReply({ content: `You've started scanning!`, ephemeral: false });
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

function startScanning(playerId, activeShip, fleet, lightScan, deepScan) {
    const startTime = new Date();
    db.player.set(`${playerId}`, startTime, "scanning.startTime");
	db.player.set(`${playerId}`, true, "engaged");

    // Schedule a job to run every 1 minutes

	const jobId = `${playerId}-${Date.now()}`;
    const job = schedule.scheduleJob(`*/1 * * * *`, function() {
		const shipName = activeShip.name;
        const ship = getShipFromFleet(shipName, fleet);
		// console.log(ship);
		const location = db.player.get(`${playerId}`, "location");

        if (ship) {
            try {
                const item = calculateScanning(location.currentLocation, activeShip.morale, lightScan, deepScan);
                const totalWeight = getTotalWeight(ship.inventory);
                const itemWeight = item.weight;

				// console.log(item);
                if (totalWeight + itemWeight <= ship.cargoCapacity) {
                    updateShipInventory(playerId, shipName, item, fleet);
                } else {
					this.cancel();
					db.player.delete(`${playerId}`, "scanning.startTime");
					db.player.set(`${playerId}`, false, "engaged");
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

        if (itemEntry) {
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
    if (location.unique_items && location.unique_items.length > 0) {
        // Calculate total weight
        let totalChance = 0;
        for (const unique of location.unique_items) {
            const chance = unique.adjustedChance || unique.item.baseChance;
            totalChance += chance;
        }

        // Generate a random number within the total chance
        let randomChance = Math.random() * totalChance;
        for (const unique of location.unique_items) {
            const chance = unique.adjustedChance || unique.item.baseChance;
            randomChance -= chance;
            if (randomChance <= 0) {
                return {
                    type: unique.item.name,
                    quantity: unique.item.quantity,
                    weight: unique.item.weight,
                    sell_price: unique.item.sell_price,
                    description: unique.item.description,
                };
            }
        }
    } else {
        console.log("No unique items available for scanning.");
        return null; // Handle the case where no unique items are present
    }
}

