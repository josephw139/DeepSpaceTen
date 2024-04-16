const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('map')
	.setDescription('Consult the star charts')
		/*.addIntegerOption(option =>
			option.setName('ship')
			.setDescription('Which ship to view')
			)*/
	,
	async execute(interaction) {
        const member = interaction.member;
		// const modules = db.player.get(`${member.id}`, "modules");
		// const drones = db.player.get(`${member.id}`, "drones");
		const channel = interaction.channel;

		const playerData = getPlayerData(member.id);
		if (typeof playerData === 'string') {
            interaction.reply(playerData);
        }
		const fleet = playerData.fleet;
		const location = playerData.location;
		const locationDisplay = playerData.locationDisplay;
		const activeShip = playerData.activeShip;
		const credits = playerData.credits;

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
			.setDescription(`Frontier Space`)
			.addFields(
				{ name: 'Current Location', value: `${location.currentLocation.name}`},
				{ name: `${location.currentSystem.name}`, value: `${locationsDisplay}`},
			)
			.setImage('attachment://discordjs.png');

		channel.send({ embeds: [exampleEmbed], files: [file] });

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