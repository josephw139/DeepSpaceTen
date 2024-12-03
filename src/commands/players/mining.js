const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData, getCurrentLocationFromPlayerData } = require('../../database/playerFuncs.js');
const { levelWeights, miningSellPrice, miningResources, resources, calculateWeight, hiddenMessages, randomizeInput } = require('../../database/locationResources.js');
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

        const liveLocation = getCurrentLocationFromPlayerData(location);

		if (job === "start") {
			if (!isEngaged) {
				const canMine = liveLocation.activities.includes('Mine');
				const isMiningShip = activeShip.capabilities.includes("Mining");
                const minCrew = activeShip.crew.length >= activeShip.crewCapacity[0];
                const totalWeight = getTotalWeight(activeShip.inventory);
                const isCargoAlmostFull = Math.abs(activeShip.cargoCapacity - totalWeight) <= 10;
                
				if (canMine && isMiningShip && minCrew && !isCargoAlmostFull ) {
					startMining(interaction, member.id, liveLocation, activeShip, fleet);
					await interaction.editReply({ content: `You've started mining! Resources will be extracted every hour`, ephemeral: true });
				} else if (!canMine) {
					await interaction.editReply({ content: `You can't mine at this location`, ephemeral: true });
				} else if (!isMiningShip) {
					await interaction.editReply({ content: `This ship doesn't have mining capability`, ephemeral: true });
				} else if (!minCrew) {
                    await interaction.editReply({ content: `You don't have enough crew staffing the ship`, ephemeral: true });
                } else if (isCargoAlmostFull) {
                    await interaction.editReply({ content: `Your cargo hold is too full to hold much more`, ephemeral: true });
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
                    db.player.set(`${playerId}`, "Crew on standby, ship conserving power.", "activity");
					//await interaction.reply({ content: `Mining job finished`, ephemeral: true });

                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.editReply({ content: `Mining job finished`, ephemeral: true });
                    } else {
                        await interaction.followUp({ content: `Mining job finished`, ephemeral: true });
                    }
                    
				}
			} else {
				await interaction.editReply({ content: `You weren't mining.`, ephemeral: true });
			}
		}
	}
};

function startMining(interaction, playerId, location, activeShip, fleet) {
    const startTime = new Date();

    db.player.set(`${playerId}`, startTime, "mining.startTime");
	db.player.set(`${playerId}`, true, "engaged");
    db.player.set(`${playerId}`, `${activeShip.name}'s crew is mining at ${location.name}`, "activity");
    

    // Get the current minute to start the cron job at that minute every hour
    const currentMinute = startTime.getMinutes();
    const cronExpression = `* * * * *`;  // This will fire at 'currentMinute' every hour

    // Schedule a job to run every 1 hour (change the ${currentMinute} to a * to run every minute)

	const jobId = `${playerId}-${Date.now()}`;
    const job = schedule.scheduleJob(jobId, cronExpression, function() {
		const shipName = activeShip.name;
        const ship = getShipFromFleet(shipName, fleet);
		// console.log(ship);
		

        if (ship) {
            try {
                const resource = calculateMinerals(location, activeShip.morale, activeShip.extractionPower);
                console.log(resource);
                const totalWeight = getTotalWeight(ship.inventory);
                const resourceWeight = resource.weight;

				// console.log(resource);
                if (totalWeight + resourceWeight <= ship.cargoCapacity) {
                    updateShipInventory(playerId, shipName, resource, fleet);
                } else {
                    const remainingCapacity = ship.cargoCapacity - totalWeight;
					if (remainingCapacity > 0) {
                        const adjustedResourceAmount = calculateAdjustedResourceAmount(resource, remainingCapacity);
                
                        // Update the inventory with the adjusted amount
                        if (adjustedResourceAmount.quantity > 0) {
                            updateShipInventory(playerId, shipName, adjustedResourceAmount, fleet);
                        }
                    }

					this.cancel(); // Cancel the scheduled job after adding the last bit of resources
					db.player.delete(`${playerId}`, "mining.startTime");
					db.player.set(`${playerId}`, false, "engaged");
                    db.player.set(`${playerId}`, "Crew on standby, ship conserving power.", "activity");
                    interaction.channel.send({ content: `<@${playerId}> ${activeShip.name}'s crew loads one last crate into the hold - your cargo hold is full.` });

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


function calculateAdjustedResourceAmount(resource, remainingCapacity) {

    const resourceCategory = findResourceCategory(resource.type);
    const weightPerUnit = resources[resourceCategory][resource.type].weight;

    // Calculate the maximum quantity that can be added without exceeding capacity
    const maxQuantity = Math.floor(remainingCapacity / weightPerUnit);

    return {
        type: resource.type,
        quantity: Math.min(maxQuantity, resource.quantity), // Ensure this doesn't go negative and doesn't exceed original quantity
        sellPrice: resource.sellPrice,
        description: resource.description,
        weight: Math.min(maxQuantity, resource.quantity) * weightPerUnit, // Calculate the new weight based on the adjusted quantity
    };
}


function updateShipInventory(playerId, shipName, resource, fleet) {
    const shipIndex = fleet.ships.findIndex(s => s.name === shipName);
    if (shipIndex !== -1) {
        const ship = fleet.ships[shipIndex];
        const resourceEntry = ship.inventory.find(item => item.name === resource.type);
        const resourceWeight = resource.weight;

        if (resourceEntry) {
            resourceEntry.quantity += resource.quantity;
            resourceEntry.weight += resourceWeight;
        } else {
            ship.inventory.push({
                name: resource.type,
                quantity: resource.quantity,
                weight: resourceWeight,
                description: resource.description,
                sellPrice: resource.sellPrice,
            });
        }

        //fleet[shipIndex] = ship; 
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


function calculateMinerals(location, morale, extractionPower) {
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
                    sellPrice: unique.item.sellPrice,
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

    const resourceCategory = findResourceCategory(selectedType);
    if (!resourceCategory) {
        console.log(`No category found for type: ${selectedType}`);
        return null; // Safeguard against undefined categories or mining levels
    }

    const miningLevel = location.mining[selectedType];
    const resourceDetails = resources[resourceCategory][selectedType];
    const { min, max } = resourceDetails.availability[miningLevel];
    const extractionPowerValue = extractionPower[resourceCategory.toLowerCase()];

    let resourceQuantity = (Math.floor(Math.random() * (max - min + 1)) + min) * extractionPowerValue;

    resourceQuantity = applyMoraleEffects(resourceQuantity, morale);

    //console.log(miningSellPrice[selectedType]);
    
    return {
        type: selectedType,
        quantity: Math.round(resourceQuantity),
        sellPrice: resourceDetails.sellPrice,
        description: resourceDetails.type,
        weight: Math.floor((resourceDetails.weight * resourceQuantity))
    };
}



function applyMoraleEffects(quantity, morale) {
    if (morale == 10) return quantity * 1.1;
    else if (morale >= 7 && morale < 10) return quantity * 1.05;
    else if (morale < 5 && morale > 1) return quantity * 0.94;
    else if (morale <= 1) return quantity * 0.9;
    return Math.floor(quantity);
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

// Helper function to find the category of the given resource
function findResourceCategory(resourceKey) {
    for (const category in resources) {
        if (resources[category][resourceKey]) {
            return category;
        }
    }
    return null; // Return null if the resource isn't found in any category
}