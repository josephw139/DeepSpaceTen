const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet, capitalize, applyModule, removeModule } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { removeItemFromShipInventory, updateHangar, withdrawItemFromHangar, addItemToShipInventory } = require('../../database/hangerFuncs.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('fleet')
	.setDescription('Manage your fleet')
	.addStringOption(option =>
        option.setName("manage")
            .setDescription("View by itself will show all ships. Use ships' number to select individual ships.")
            .setRequired(true)
            .addChoices(
                { name: 'view', value: 'view' },
                { name: 'active', value: 'active' },
                { name: 'rename', value: 'rename' },
				{ name: 'equip', value: 'equip' },
				{ name: 'unequip', value: 'unequip' },
            ))
	.addIntegerOption(option => option.setName('ship').setDescription('Select a ship'))
	.addStringOption(option => option.setName('name').setDescription("Name of a ship, module, or furnishing")
	)
	,
	async execute(interaction) {
        const member = interaction.member;
		const playerId = member.id
		const channel = interaction.channel;
		const playerData = getPlayerData(playerId);
		if (typeof playerData === 'string') {
            interaction.editReply(playerData);
        }
		const fleet = playerData.fleet;
		const location = playerData.location;
		const locationDisplay = playerData.locationDisplay;
		const activeShip = playerData.activeShip;
		const credits = playerData.credits;
		const hangar = playerData.hangar;
		const isEngaged = playerData.isEngaged;
		const activity = playerData.activity;

		const manageOption = interaction.options.getString('manage');
        const shipOption = interaction.options.getInteger('ship');
		const nameOption = interaction.options.getString('name');

		// FLEET VIEW 
		if (manageOption === 'view') {

			// VIEW SPECIFIC SHIP
			if (shipOption) {
				let target;
				try {
					target = fleet.ships[shipOption - 1];
				} catch (err) {
					// console.log(err);
					await interaction.editReply({content: `This ship doesn't exist`, ephemeral: true});
					return;
				}
				console.log(target);
				let activeShipString = '';
				if (target === activeShip) {
					activeShipString += 'STATUS: ACTIVE';
				}
				const shipView = new EmbedBuilder()
				.setTitle(`Exploration Team ${member.displayName}`)
				.setDescription(`${target.shipDisplay()}\n${activeShipString}`)
				.addFields(
					{ name: 'Location', value: `${locationDisplay}`},
					{ name: 'Stats', value: `${target.shipDisplay(true)}` },
				)
				channel.send({ embeds: [shipView] });
				await interaction.editReply({content: `Use /fleet view to see all your ships`, ephemeral: true});

			// SHOW ALL SHIPS
			} else {
				let shipDisplay = fleet.showAllShips();
				
				const fleetDisplay = new EmbedBuilder()
				.setTitle(`Captain ${member.displayName}`)
				.setDescription(`__Fleet Overview__\nBank: ${credits} C\n${activity}`)
				.addFields(
					{ name: 'Location', value: `${locationDisplay}`},
					{ name: 'Ships', value: `${shipDisplay}` },
					// { name: 'Drone Ships', value: `${drones}`},
					// { name: 'Available Modules', value: `${modules}`},
					// { name: 'Attack Test', value: `Rolled: ${newFleet[0].attack}\nTotal Damage: ${damage[0]} | Dice Rolled: ${damage[1]}`},
				)

				channel.send({ embeds: [fleetDisplay] });

				// Obligatory reply
				await interaction.editReply({content: `Use /fleet:manage view ship # to see individual ship details`, ephemeral: true});

			}

		} else if (manageOption === 'active') {
			if (!shipOption) {
				await interaction.editReply({content: `Specify a # to select your ship`, ephemeral: true});
				return;
			}

			if (shipOption > fleet.ships.length || shipOption === 0) {
				await interaction.editReply({content: `This ship does not exist.`, ephemeral: true});
				return;
			}

			let target;
			try {
				target = fleet.ships[shipOption - 1];
			} catch (err) {
				// console.log(err);
				await interaction.editReply({content: `This ship doesn't exist`, ephemeral: true});
				return;
			}

			fleet.setActiveShip(target);
			db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
			await interaction.editReply({content: `${fleet.getActiveShip().name} is set to ACTIVE.`, ephemeral: true});

		} else if (manageOption === 'rename') {
			if (!shipOption) {
				await interaction.editReply({content: `Specify a # to select your ship`, ephemeral: true});
				return;
			}
			if (!nameOption) {
				await interaction.editReply({content: `Please specify a name`, ephemeral: true});
				return;
			}

			let target;
			try {
				target = fleet.ships[shipOption - 1];
			} catch (err) {
				// console.log(err);
				await interaction.editReply({content: `This ship doesn't exist`, ephemeral: true});
				return;
			}
			const oldName = target.name;
			target.name = nameOption;
			db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
			await interaction.editReply({content: `${oldName} has been rechristened as ${target.name}`, ephemeral: true});

		} else if (manageOption === 'equip') {
			if (!shipOption) {
				await interaction.editReply({content: `Specify a # to select your ship`, ephemeral: true});
				return;
			}
			if (!nameOption) {
				await interaction.editReply({content: `Please specify a module or furnishing in your Hangar`, ephemeral: true});
				return;
			}
			const isHangar = location.currentLocation.activities.includes('Hangar');
			if (!isHangar) {
				await interaction.editReply(`You can't access your hangar here.`);
				return;
			}

			let target;
			try {
				target = fleet.ships[shipOption - 1];
			} catch (err) {
				// console.log(err);
				await interaction.editReply({content: `This ship doesn't exist`, ephemeral: true});
				return;
			}

			if (target.modules.length >= target.modCapacity) {
				await interaction.editReply({content: `You don't have the capacity to add more modules to this ship.`, ephemeral: true});
				return;
			}

			const moduleToEquip = withdrawItemFromHangar(playerId, hangar, capitalize(nameOption), 1);
			if (!moduleToEquip) {
				await interaction.editReply({content: `Module not found`, ephemeral: true});
				return;
			}

			const moduleApplied = applyModule(target, moduleToEquip);
			if (!moduleApplied) {
				await interaction.editReply({content: `${nameOption} is not stackable.`, ephemeral: true});
			}
			
			db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
			await interaction.editReply({content: `${target.name} has been equipped with ${nameOption}`, ephemeral: true});

		} else if (manageOption === 'unequip') {
			if (!shipOption) {
				await interaction.editReply({content: `Specify a # to select your ship`, ephemeral: true});
				return;
			}
			if (!nameOption) {
				await interaction.editReply({content: `Please specify a module or furnishing on your ship`, ephemeral: true});
				return;
			}
			const isHangar = location.currentLocation.activities.includes('Hangar');
			if (!isHangar) {
				await interaction.editReply(`You can't access your hangar here.`);
				return;
			}

			let target;
			try {
				target = fleet.ships[shipOption - 1];
			} catch (err) {
				// console.log(err);
				await interaction.editReply({content: `This ship doesn't exist`, ephemeral: true});
				return;
			}

			const removedModule = removeModule(target, capitalize(nameOption));
			if (!removedModule) {
				await interaction.editReply({content: `Module ${nameOption} was not found on the ship`, ephemeral: true});
			}

			db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
			updateHangar(playerId, hangar, removedModule);

			await interaction.editReply({content: `Module ${nameOption} has been removed from ${target.name} and stored in your Hangar.`, ephemeral: true});
		}

		// TESTS
		/*
		const shipOne = ships.createShip(fleet[0].type, fleet[0]);
		const shipTwo = ships.createShip(fleet[1].type, fleet[1]);
		console.log(shipOne.toArray());
		const damage = shipOne.rollAttack();
		*/
		// END TESTS

	}
};