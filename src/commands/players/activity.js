const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const schedule = require('node-schedule');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('activity')
	.setDescription('Will remove this command later')
		.addSubcommand(subcommand =>
			subcommand
				.setName('research')
				.setDescription('Study anomolies, ruins, relics and more')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('shop')
				.setDescription('Buy & sell at a trading outpost')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('trade')
				.setDescription('Trade cargo, modules, ships, etc with other players')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('build')
				.setDescription('Construct items you have access to')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('learn')
				.setDescription('Use your research to unlock new things to build')
		)
	,
	async execute(interaction) {
        const member = interaction.member;
		const channel = interaction.channel;

		const playerData = getPlayerData(member.id);
		const fleet = playerData.fleet;
		const location = playerData.location;
		const locationDisplay = playerData.locationDisplay;
		const activeShip = playerData.activeShip;

		
	}
}