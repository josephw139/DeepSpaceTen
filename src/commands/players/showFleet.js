const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Cruiser } = require('../../modules/ships/cruiser');
const db = require('../../database/db.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('fleet')
	.setDescription('Display Fleet Details')
	,
	async execute(interaction) {
        const member = interaction.member.id;
        const fleet = db.squadrons.get(`${member}`, "ships");
		const modules = db.squadrons.get(`${member}`, "modules");
		const specs = db.squadrons.get(`${member}`, "specs");
		console.log(fleet);
        // Obligatory reply
        await interaction.reply({content: `Fleet: ${fleet[0]}, ${fleet[1]}\nModules: ${modules}\nSpecs: ${specs}`, ephemeral: false});

	}
};