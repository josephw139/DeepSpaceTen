const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData, getCurrentLocationFromPlayerData } = require('../../database/playerFuncs.js');
const { levelWeights, researchSellPrice, researchTypes } = require('../../database/locationResources.js');
const schedule = require('node-schedule');

const jobReferences = new Map();

module.exports = {
	data: new SlashCommandBuilder()
	.setName('research')
	.setDescription('Study & Research')
	.addStringOption(option =>
        option.setName("job")
            .setDescription("Start or cancel research jobs")
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
			hangar, fleet, activeShip, isEngaged,
			location, activity, locationDisplay, credits 
		} = playerData;

        const liveLocation = getCurrentLocationFromPlayerData(activeShip.location);

		if (job === "start") {
			if (!isEngaged) {
				const canResearch = liveLocation.activities.includes('Research');
				const isResearchShip = activeShip.capabilities.includes("Research");
                const minCrew = activeShip.crew.length >= activeShip.crewCapacity[0];

				if (canResearch && isResearchShip && minCrew ) {
					startResearch(member.id, liveLocation, activeShip.id, fleet);
					await interaction.editReply({ content: `You've started researching! Results will be produced every hour`, ephemeral: true });
				} else if (!canResearch) {
					await interaction.editReply({ content: `You can't research at this location`, ephemeral: true });
				} else if (!isResearchShip) {
					await interaction.editReply({ content: `This ship doesn't have research capability`, ephemeral: true });
				} else if (!minCrew) {
                    await interaction.editReply({ content: `You don't have enough crew staffing the ship`, ephemeral: true });
                }
			} else {
				await interaction.editReply({ content: `You're already engaged in another activity`, ephemeral: true });
			}
		} else {
			if (isEngaged) {
				const researchDetails = db.player.get(`${playerId}`, `research.${activeShip.id}.details`);
				const jobToCancel = jobReferences.get(researchDetails.jobId);
				if (jobToCancel) {
					jobToCancel.cancel();
					jobReferences.delete(researchDetails.jobId); // Remove the reference after cancelling
					db.player.delete(`${playerId}`, `research.${activeShip.id}.details`); // Clean up database entries
					db.player.delete(`${playerId}`, `research.${activeShip.id}.startTime`);
					activeShip.engaged = false;
                    db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
                    db.player.set(`${playerId}`, "Crew on standby, ship conserving power", "activity");
					//await interaction.reply({ content: `Research job finished`, ephemeral: true });

                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.editReply({ content: `Research job finished`, ephemeral: true });
                    } else {
                        await interaction.followUp({ content: `Research job finished`, ephemeral: true });
                    }
                    
				}
			} else {
				await interaction.editReply({ content: `This ship was not researching.`, ephemeral: true });
			}
		}
	}
};

function startResearch(playerId, location, shipId, fleet) {
    const ship = fleet.ships.find(s => s.id === shipId);
    const startTime = new Date();

    db.player.set(`${playerId}`, startTime, `research.${ship.id}.startTime`);
	ship.engaged = true;
    ship.activity = `${ship.name}'s crew is researching at ${location.name}`;
    db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");


    // Get the current minute to start the cron job at that minute every hour
    const currentMinute = startTime.getMinutes();
    const cronExpression = `${currentMinute} * * * *`;  // This will fire at 'currentMinute' every hour


    // Schedule a job to run every 1 hour 
	const jobId = `${playerId}-${Date.now()}`;
    const job = schedule.scheduleJob(jobId, cronExpression, function() {

        if (ship) {
            try {
                const resource = calculateResearch(location, ship.morale, ship.researchPower);
                //const totalWeight = getTotalWeight(ship.inventory);
                // const resourceWeight = calculateWeight(resource.type, resource.quantity);

				// console.log(resource);
                updateShipInventory(playerId, shipId, resource, fleet);

            } catch (e) {
                console.error(e);
            }
        } else {
			console.log(ship);
		}
    });
	jobReferences.set(jobId, job);
	db.player.set(`${playerId}`, { jobId: jobId, startTime: new Date() }, `research.${ship.id}.details`);

}


function updateShipInventory(playerId, shipId, resource, fleet) {
    const ship = fleet.ships.find(s => s.id === shipId);
   
    const resourceEntry = ship.lab.find(item => item.name === resource.type);
    // const resourceWeight = calculateWeight(resource.type, resource.quantity);

    if (resourceEntry) {
        resourceEntry.quantity += resource.quantity;
        // resourceEntry.weight += resourceWeight;
    } else {
        ship.lab.push({
            name: resource.type,
            quantity: resource.quantity,
            // weight: resourceWeight,
            description: resource.type,
            sellPrice: resource.sellPrice,
        });
    }

    //fleet[shipIndex] = ship; 
    db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
}


function getShipFromFleet(shipName, fleet) {
    return fleet.ships.find(s => s.name === shipName);
}


function calculateResearch(location, morale, researchPower) {
    // Check for unique items first
    /* if (location.unique_items) {
        console.log(location.unique_items);
        for (const unique of location.unique_items) {
            const item = unique.item;
            const chance = item.adjustedChance || item.baseChance;
            if (Math.random() <= chance) {
                return {
                    type: item.name,
                    quantity: item.quantity,
                    weight: item.weight,
                    sell_price: item.sell_price,
                    description: item.description,
                };
            }
        }
    } */

    // Randomly select a research type based on weights
    const selectedType = weightedRandom(location.research);
    if (!selectedType) {
        console.log("No valid research type selected.");
        return null; // Handle the case where no type is selected due to filtering or chance
    }
    const researchLevel = location.research[selectedType];
    if (!researchLevel) {
        console.log(`No research level found for type: ${selectedType}`);
        return null; // Safeguard against undefined research levels
    }

    const { min, max } = researchTypes[selectedType][researchLevel];
    let researchQuantity = (Math.floor(Math.random() * (max - min + 1)) + min) * researchPower.base;
    researchQuantity = applyMoraleEffects(researchQuantity, morale);
    
    return {
        type: selectedType,
        quantity: Math.round(researchQuantity),
        sellPrice: researchSellPrice[selectedType],
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
            return type;  // Returns the selected research type
        }
    }
}

