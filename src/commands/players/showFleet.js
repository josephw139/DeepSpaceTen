const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Cruiser } = require('../../modules/ships/cruiser');
const squadrons = require('../../database/db.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('Show Fleet')
	.setDescription('Display Fleet Overview')
	,
	async execute(interaction) {
        const member = interaction.member.id;
        const fleet = squadrons.get(`${member}`, "ships");

        // Obligatory reply
        await interaction.reply({content: `Fleet: ${fleet}`, ephemeral: false});

	}
};