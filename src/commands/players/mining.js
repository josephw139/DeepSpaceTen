const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData, calculateWeight } = require('../../database/playerFuncs.js');
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
            interaction.reply(playerData);
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
					await interaction.reply({ content: `You've started mining!`, ephemeral: false });
				} else if (!canMine) {
					await interaction.reply({ content: `You can't mine at this location`, ephemeral: true });
				} else if (!isMiningShip) {
					await interaction.reply({ content: `This ship doesn't have mining capability`, ephemeral: true });
				} else if (!minCrew) {
                    await interaction.reply({ content: `You don't have enough crew staffing the ship`, ephemeral: true });
                }
			} else {
				await interaction.reply({ content: `You're already engaged in another activity`, ephemeral: true });
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
					await interaction.reply({ content: `Mining job finished`, ephemeral: true });
				}
			} else {
				await interaction.reply({ content: `You weren't mining. Idiot.`, ephemeral: true });
			}
		}
	}
};

function startMining(playerId, activeShip, fleet) {
    const startTime = new Date();
    db.player.set(`${playerId}`, startTime, "mining.startTime");
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
                const resource = calculateMinerals(location.currentLocation, activeShip.morale, activeShip.miningPower);
                const totalWeight = getTotalWeight(ship.inventory);
                const resourceWeight = calculateWeight(resource.type, resource.quantity);

				console.log(resource);
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

function getTotalOre(inventory) {
    return inventory.reduce((total, item) => {
        if (item.name === 'Ore') {
            return total + item.quantity;
        }
        return total;
    }, 0);
}


function updateShipInventory(playerId, shipName, resource, fleet) {
    const shipIndex = fleet.ships.findIndex(s => s.name === shipName);
    if (shipIndex !== -1) {
        const ship = fleet.ships[shipIndex];
        const resourceEntry = ship.inventory.find(item => item.name === resource.type);
        const resourceWeight = calculateWeight(resource.type, resource.quantity);

        if (resourceEntry) {
            resourceEntry.quantity += resource.quantity;
            resourceEntry.weight += resourceWeight;
        } else {
            ship.inventory.push({
                name: resource.type,
                quantity: resource.quantity,
                weight: resourceWeight,
                description: 'Mined ' + resource.type,
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
    // Define ranges for each resource type and mining level
    const ranges = {
        Ore: {
			Very_Low: { min: 10, max: 30 },
            Low: { min: 40, max: 100 },
            Medium: { min: 120, max: 210 },
            High: { min: 180, max: 270 },
			Very_High: { min: 230, max: 340 },
        },
        Gas: {
			Very_Low: { min: 5, max: 20 },
            Low: { min: 30, max: 60 },
            Medium: { min: 70, max: 120 },
            High: { min: 100, max: 160 },
			Very_High: { min: 140, max: 220 },
        },
        Adamantium: {
			Very_Low: { min: 1, max: 10 },
            Low: { min: 10, max: 30 },
            Medium: { min: 25, max: 50 },
            High: { min: 40, max: 80 },
			Very_High: { min: 70, max: 100 },
        }
    };

    // Randomly select a mining type based on weights
    const miningTypes = Object.keys(location.mining);
    const selectedType = weightedRandom(miningTypes, location.mining);

    // Get the range for the selected mining type and level
    const miningLevel = location.mining[selectedType];
    const { min, max } = ranges[selectedType][miningLevel];

    // Randomly choose a value between min and max for the selected type, then multiply by miningPower
    let oreQuantity = (Math.floor(Math.random() * (max - min + 1)) + min) * miningPower;

    if (morale == 10) {
        oreQuantity *= 1.1;
    } else if (morale >= 7 && morale < 10) {
        oreQuantity *= 1.05;
    } else if (morale == 6 || activeShip.morale == 5) {
        oreQuantity *= 1;
    } else if (morale < 5 && activeShip.morale > 1) {
        oreQuantity *= 0.94;
    } else if (morale <= 1) {
        oreQuantity *= 0.9;
    }

    oreQuantity = Math.round(oreQuantity);

    return {
        type: selectedType,
        quantity: oreQuantity,
    };
}


// Helper function to randomly select a mining type based on weights
function weightedRandom(types, weights) {
    // Filter out types set to "None"
    const availableTypes = types.filter(type => weights[type] !== "None");

    let totalWeight = availableTypes.reduce((total, type) => total + weightScale(weights[type]), 0);
    let random = Math.random() * totalWeight;
    for (let type of availableTypes) {
        random -= weightScale(weights[type]);
        if (random < 0) {
            return type;
        }
    }
}

// Helper function to scale weights (Low: 1, Medium: 2, High: 3)
function weightScale(level) {
    switch (level) {
		case "Very_Low": return 1;
        case "Low": return 2;
        case "Medium": return 3;
        case "High": return 4;
		case "Very_High": return 5;
        default: return 0;
    }
}
