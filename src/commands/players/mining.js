const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { levelWeights, miningSellPrice, miningResources, calculateWeight, hiddenMessages, randomizeInput } = require('../../database/locationResources.js');
const schedule = require('node-schedule');

const jobReferences = new Map();

module.exports = {
	data: new SlashCommandBuilder()
	.setName('mine')
	.setDescription('Mine Ores, Gas, and other resources')
	.addStringOption(option =>
        option.setName("job")
            .setDescription("Start or cancel mining jobs")
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
				const canMine = location.currentLocation.activities.includes('Mine');
				const isMiningShip = activeShip.capabilities.includes("Mining");
                const minCrew = activeShip.crew.length >= activeShip.crewCapacity[0];

				if (canMine && isMiningShip && minCrew ) {
					startMining(member.id, activeShip, fleet);
					await interaction.editReply({ content: `You've started mining!`, ephemeral: true });
				} else if (!canMine) {
					await interaction.editReply({ content: `You can't mine at this location`, ephemeral: true });
				} else if (!isMiningShip) {
					await interaction.editReply({ content: `This ship doesn't have mining capability`, ephemeral: true });
				} else if (!minCrew) {
                    await interaction.editReply({ content: `You don't have enough crew staffing the ship`, ephemeral: true });
                }
			} else {
				await interaction.editReply({ content: `You're already engaged in another activity`, ephemeral: true });
			}
		} else {
			if (isEngaged) {
				const miningDetails = db.player.get(`${playerId}`, "mining.details");
				const jobToCancel = jobReferences.get(miningDetails.jobId);
				if (jobToCancel) {
					jobToCancel.cancel();
					jobReferences.delete(miningDetails.jobId); // Remove the reference after cancelling
					db.player.delete(`${playerId}`, "mining.details"); // Clean up database entries
					db.player.delete(`${playerId}`, "mining.startTime");
					db.player.set(`${playerId}`, false, "engaged");
					//await interaction.reply({ content: `Mining job finished`, ephemeral: true });

                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.editReply({ content: `Mining job finished`, ephemeral: true });
                    } else {
                        await interaction.followUp({ content: `Mining job finished`, ephemeral: true });
                    }
                    
				}
			} else {
				await interaction.editReply({ content: `You weren't mining. Idiot.`, ephemeral: true });
			}
		}
	}
};

function startMining(playerId, activeShip, fleet) {
    const startTime = new Date();
    db.player.set(`${playerId}`, startTime, "mining.startTime");
	db.player.set(`${playerId}`, true, "engaged");

    // Get the current minute to start the cron job at that minute every hour
    const currentMinute = startTime.getMinutes();
    const cronExpression = `${currentMinute} * * * *`;  // This will fire at 'currentMinute' every hour

    // Schedule a job to run every 1 hour (change the ${currentMinute} to a * to run every minute)

	const jobId = `${playerId}-${Date.now()}`;
    const job = schedule.scheduleJob(jobId, cronExpression, function() {
		const shipName = activeShip.name;
        const ship = getShipFromFleet(shipName, fleet);
		// console.log(ship);
		const location = db.player.get(`${playerId}`, "location");

        if (ship) {
            try {
                const resource = calculateMinerals(location.currentLocation, activeShip.morale, activeShip.miningPower);
                const totalWeight = getTotalWeight(ship.inventory);
                const resourceWeight = calculateWeight(resource.type, resource.quantity);

				// console.log(resource);
                if (totalWeight + resourceWeight <= ship.cargoCapacity) {
                    updateShipInventory(playerId, shipName, resource, fleet);
                } else {
                    const remainingCapacity = ship.cargoCapacity - totalWeight;
					const adjustedResourceAmount = calculateAdjustedResourceAmount(resource.type, resource.quantity, remainingCapacity);

					// Update the inventory with the adjusted amount
					if (adjustedResourceAmount.quantity > 0) {
						updateShipInventory(playerId, shipName, adjustedResourceAmount, fleet);
					}

					this.cancel(); // Cancel the scheduled job after adding the last bit of resources
					db.player.delete(`${playerId}`, "mining.startTime");
					db.player.set(`${playerId}`, false, "engaged");
                }
            } catch (e) {
                console.error(e);
            }
        } else {
			console.log(activeShip);
			console.log(ship);
		}
    });
	jobReferences.set(jobId, job);
	db.player.set(`${playerId}`, { jobId: jobId, startTime: new Date() }, "mining.details");

}

function calculateAdjustedResourceAmount(resourceType, quantity, remainingCapacity) {
    // Assume a fixed weight per unit for simplicity; adjust based on your game's mechanics
    const weightPerUnit = calculateWeight(resourceType, quantity);

    // Calculate the maximum quantity that can be added without exceeding capacity
    const maxQuantity = Math.floor(remainingCapacity / weightPerUnit);

    return {
        type: resourceType,
        quantity: maxQuantity // Ensure this doesn't go negative
    };
}


function updateShipInventory(playerId, shipName, resource, fleet) {
    const shipIndex = fleet.ships.findIndex(s => s.name === shipName);
    if (shipIndex !== -1) {
        const ship = fleet.ships[shipIndex];
        const resourceEntry = ship.inventory.find(item => item.name === resource.type);
        const resourceWeight = calculateWeight(resource.type, resource.quantity);

        if (resourceEntry && resourceEntry.description == resource.description) {
            resourceEntry.quantity += resource.quantity;
            resourceEntry.weight += resourceWeight;
        } else {
            ship.inventory.push({
                name: resource.type,
                quantity: resource.quantity,
                weight: resourceWeight,
                description: resource.type,
                sell_price: resource.sell_price,
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


function calculateMinerals(location, morale, miningPower) {
    // Check for unique items first
    if (location.unique_items) {
        for (const unique of location.unique_items) {
            const chance = unique.adjustedChance || unique.item.baseChance;
            if (Math.random() <= chance) {
                let itemDescription;
                if (unique.item.name == 'Hidden Message') {
                    itemDescription = randomizeInput(hiddenMessages);
                } else {
                    itemDescription = unique.item.description;
                }
                
                return {
                    type: unique.item.name,
                    quantity: unique.item.quantity,
                    weight: unique.item.weight,
                    sell_price: unique.item.sell_price,
                    description: itemDescription,
                };
            }
        }
    }

    // Randomly select a mining type based on weights
    const selectedType = weightedRandom(location.mining);
    if (!selectedType) {
        console.log("No valid mining type selected.");
        return null; // Handle the case where no type is selected due to filtering or chance
    }
    const miningLevel = location.mining[selectedType];
    if (!miningLevel) {
        console.log(`No mining level found for type: ${selectedType}`);
        return null; // Safeguard against undefined mining levels
    }

    const { min, max } = miningResources[selectedType][miningLevel];
    let oreQuantity = (Math.floor(Math.random() * (max - min + 1)) + min) * miningPower;
    oreQuantity = applyMoraleEffects(oreQuantity, morale);
    
    return {
        type: selectedType,
        quantity: Math.round(oreQuantity),
        sell_price: miningSellPrice[selectedType],
    };
}



function applyMoraleEffects(quantity, morale) {
    if (morale == 10) return quantity * 1.1;
    else if (morale >= 7 && morale < 10) return quantity * 1.05;
    else if (morale < 5 && morale > 1) return quantity * 0.94;
    else if (morale <= 1) return quantity * 0.9;
    return quantity;
}


// Helper function to randomly select a mining type based on weights
function weightedRandom(types) {
    // Filtering out types where mining level is "None" or not defined in levelWeights
    const availableTypes = Object.keys(types).filter(type => types[type] !== "None" && levelWeights[types[type]] !== undefined);

    // Calculating total weight based on the mining level of available types
    let totalWeight = availableTypes.reduce((total, type) => total + levelWeights[types[type]], 0);

    // Generating a random number within the range of total weight
    let random = Math.random() * totalWeight;

    // Selecting a type based on the accumulated weight
    for (let type of availableTypes) {
        random -= levelWeights[types[type]];
        if (random < 0) {
            return type;  // Returns the selected resource type
        }
    }
}

