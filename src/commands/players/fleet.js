const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');


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
            ))
	.addIntegerOption(option => option.setName('ship').setDescription('Select a ship'))
	.addStringOption(option => option.setName('name').setDescription("Your new ship's name")
	)
	,
	async execute(interaction) {
        const member = interaction.member;
		const playerId = member.id
		const channel = interaction.channel;
		const playerData = getPlayerData(playerId);
		if (typeof playerData === 'string') {
            interaction.reply(playerData);
        }
		const fleet = playerData.fleet;
		const location = playerData.location;
		const locationDisplay = playerData.locationDisplay;
		const activeShip = playerData.activeShip;
		const credits = playerData.credits;

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
					await interaction.reply({content: `This ship doesn't exist`, ephemeral: true});
					return;
				}
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
				await interaction.reply({content: `Use /fleet view to see all your ships`, ephemeral: true});

			// SHOW ALL SHIPS
			} else {
				let shipDisplay = fleet.showAllShips();
				
				const fleetDisplay = new EmbedBuilder()
				.setTitle(`Exploration Team ${member.displayName}`)
				.setDescription(`Fleet Overview\nBank: ${credits}C\n`)
				.addFields(
					{ name: 'Location', value: `${locationDisplay}`},
					{ name: 'Ships', value: `${shipDisplay}` },
					// { name: 'Drone Ships', value: `${drones}`},
					// { name: 'Available Modules', value: `${modules}`},
					// { name: 'Attack Test', value: `Rolled: ${newFleet[0].attack}\nTotal Damage: ${damage[0]} | Dice Rolled: ${damage[1]}`},
				)

				channel.send({ embeds: [fleetDisplay] });

				// Obligatory reply
				await interaction.reply({content: `Use /view fleet ship # to see individual ship details`, ephemeral: true});

			}

		} else if (manageOption === 'active') {
			if (!shipOption) {
				await interaction.reply({content: `Specify a # to select your ship`, ephemeral: true});
				return;
			}

			let target;
			try {
				target = fleet.ships[shipOption - 1];
			} catch (err) {
				// console.log(err);
				await interaction.reply({content: `This ship doesn't exist`, ephemeral: true});
				return;
			}

			fleet.setActiveShip(target);
			db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
			await interaction.reply({content: `${fleet.getActiveShip().name} is set to ACTIVE.`, ephemeral: true});

		} else if (manageOption === 'rename') {
			if (!shipOption) {
				await interaction.reply({content: `Specify a # to select your ship`, ephemeral: true});
				return;
			}
			if (!nameOption) {
				await interaction.reply({content: `Please specify a name`, ephemeral: true});
				return;
			}

			let target;
			try {
				target = fleet.ships[shipOption - 1];
			} catch (err) {
				// console.log(err);
				await interaction.reply({content: `This ship doesn't exist`, ephemeral: true});
				return;
			}
			const oldName = target.name;
			target.name = nameOption;
			db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
			await interaction.reply({content: `${oldName} has been rechristened as ${target.name}`, ephemeral: true});
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