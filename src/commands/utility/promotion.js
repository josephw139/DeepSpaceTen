const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('promote')
	.setDescription('Assigns role to user')
	.addUserOption(option =>
        option
            .setName('user')
            .setDescription('user to assign role')
            .setRequired(true))
    .addRoleOption(option =>
        option
            .setName('role')
            .setDescription('Role to assign')
            .setRequired(true)),
	async execute(interaction) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const channel = interaction.guild.channels.cache.get('1121842315229675610');

        try {
            await member.roles.add(role);
        } catch (error) {
            console.error(error);
            await interaction.reply('There was an error giving the role.');
        }

        const reply = new EmbedBuilder()
		.setTitle(`U.C.S Exploration Fleet Promotion`)
        .setDescription(`Congratulations <@${member.id}>! You have been promoted to ${role.name}!`)

        await channel.send({ embeds: [reply]});
        await interaction.reply({content: `${member.displayName} has been promoted to ${role.name}!`, ephemeral: true});

	}
};