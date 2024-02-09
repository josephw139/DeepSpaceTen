const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('user')
	.setDescription('user manipulation')
	.addUserOption(option =>
        option
            .setName('user')
            .setDescription('user to assign role')
            .setRequired(true))
	.addBooleanOption(option =>
        option
            .setName('reset')
            .setDescription('resets squadron database')
            .setRequired(true))
	,
	async execute(interaction) {
        const member = interaction.options.getMember('user');

        // Save Squadron details to database
        const newSquadron = {
            leader: `${member.displayName}`,
            /*officer: ``,
            fleet: [],
            modules: [],
            specs: [],*/
        };

        // db.player.set(`${member.id}`, newSquadron);

        // Obligatory reply
        await interaction.reply({content: `${member.displayName} has been reset`, ephemeral: true});

	}
};