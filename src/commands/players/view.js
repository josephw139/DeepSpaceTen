const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../locations/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/utilityFuncs.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('view')
	.setDescription('View your fleet, ships, maps, lore & more')
		/*.addIntegerOption(option =>
			option.setName('ship')
			.setDescription('Which ship to view')
			)*/
		.addSubcommand(subcommand =>
			subcommand
				.setName('fleet')
				.setDescription('Show details of a specific ship. Leave blank to see them all.')
				.addIntegerOption(option => option.setName('ship').setDescription('Which ship to view'))
				)
		.addSubcommand(subcommand =>
			subcommand
				.setName('map')
				.setDescription('Consult the star charts')
				)
	,
	async execute(interaction) {
        const member = interaction.member;
		// const modules = db.player.get(`${member.id}`, "modules");
		// const drones = db.player.get(`${member.id}`, "drones");
		const channel = interaction.channel;

		const playerData = getPlayerData(member.id);
		const fleet = playerData.fleet;
		const location = playerData.location;
		const locationDisplay = playerData.locationDisplay;
		const activeShip = playerData.activeShip;

		// VIEW FLEET
		if (interaction.options.getSubcommand() === 'fleet') {

			// VIEW SPECIFIC SHIP
			if (interaction.options.get('ship')) {
				let target = interaction.options.get('ship').value;
				try {
					target = fleet.ships[target - 1];
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
				await interaction.reply({content: `Use /view fleet to see all your ships`, ephemeral: true});

			// SHOW ALL SHIPS
			} else {
				let shipDisplay = fleet.showAllShips();
				
				const fleetDisplay = new EmbedBuilder()
				.setTitle(`Exploration Team ${member.displayName}`)
				.setDescription(`Fleet Overview`)
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

		} else if (interaction.options.getSubcommand() === 'map') {
			let locationsDisplay = ``;

			location.currentSystem.locations.forEach((location, index) => {
				// Append details of each location to the display string
				locationsDisplay += `${index + 1}. __${location.name}__\n`;
				locationsDisplay += `   Description: ${location.description}\n`;
				locationsDisplay += `   Activities: ${location.activities.join(', ')}\n\n`; // Join the activities array into a comma-separated string
			  });
			const file = new AttachmentBuilder('./assets/StartingSystem.png');
			const exampleEmbed = new EmbedBuilder()
				.setTitle('Map')
				.setDescription(`woah`)
				.addFields(
					{ name: 'Current Location', value: `${location.currentLocation.name}`},
					{ name: `${location.currentSystem.name}`, value: `${locationsDisplay}`},
				)
				.setImage('attachment://discordjs.png');

			channel.send({ embeds: [exampleEmbed], files: [file] });
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