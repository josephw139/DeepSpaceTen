const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base');
const db = require('../../database/db.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('fleet')
	.setDescription('Display Fleet Details')
		/*.addIntegerOption(option =>
			option.setName('ship')
			.setDescription('Which ship to view')
			)*/
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('Show details of a specific ship. Leave blank to see them all.')
				.addIntegerOption(option => option.setName('view').setDescription('Which ship to view'))
				)
		.addSubcommand(subcommand =>
			subcommand
				.setName('equip')
				.setDescription('Upgrade your ship with a Module')
				.addIntegerOption(option => option.setName('ship').setDescription('Ship to upgrade').setRequired(true))
				.addIntegerOption(option => option.setName('module').setDescription('Module to equip').setRequired(true))
				)
	,
	async execute(interaction) {
        const member = interaction.member;
		// const modules = db.squadrons.get(`${member.id}`, "modules");
		const drones = db.squadrons.get(`${member.id}`, "drones");
		const channel = interaction.channel;
		let fleetArray;
		let fleet;
		try {
			fleetArray = db.squadrons.get(`${member.id}`, "fleet");
			// recreate class instances
			fleet = new Fleet(fleetArray);
		} catch (e) {
			await interaction.reply({content: `You haven't created your fleet yet! Use /start to begin!`, ephemeral: true});
			return;
		}
		// console.log(fleetArray);

		// FLEET VIEW
		if (interaction.options.getSubcommand() === 'view') {

			// VIEW SPECIFIC SHIP
			if (interaction.options.get('view')) {
				let target = interaction.options.get('view').value;
				try {
					target = fleet.fleet[target - 1];
				} catch (err) {
					// console.log(err);
					await interaction.reply({content: `This ship doesn't exist`, ephemeral: true});
					return;
				}
				const shipView = new EmbedBuilder()
				.setTitle(`Exploration Team ${member.displayName}`)
				.setDescription(`${target.shipDisplay()}`)
				.addFields(
					// { name: '\u200B', value: '\u200B' },
					{ name: 'Stats', value: `${target.shipDisplay(true)}` },
				)
				channel.send({ embeds: [shipView] });
				await interaction.reply({content: `Use /fleet to see all your ships`, ephemeral: true});


			} else { // SHOW ALL SHIPS
				let shipDisplay = fleet.showAllShips();

				const fleetDisplay = new EmbedBuilder()
				.setTitle(`Exploration Team ${member.displayName}`)
				.setDescription(`Your Squadron's Overview`)
				.addFields(
					// { name: '\u200B', value: '\u200B' },
					{ name: 'Ships', value: `${shipDisplay}` },
					{ name: 'Drone Ships', value: `${drones}`},
					// { name: 'Available Modules', value: `${modules}`},
					// { name: 'Attack Test', value: `Rolled: ${newFleet[0].attack}\nTotal Damage: ${damage[0]} | Dice Rolled: ${damage[1]}`},
				)

				channel.send({ embeds: [fleetDisplay] });

				// Obligatory reply
				await interaction.reply({content: `Use /fleet show # to see individual ship details`, ephemeral: true});

			}

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