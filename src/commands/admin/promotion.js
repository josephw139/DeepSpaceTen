const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const db = require('../../database/db.js');


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

        // Assign Role
        try {
            await member.roles.add(role);
        } catch (error) {
            console.error(error);
            await interaction.reply('There was an error giving the role.');
        }

        // Send Announcement
        const reply = new EmbedBuilder()
		.setTitle(`U.C.S. Exploration Fleet Promotion`)
        .setDescription(`Congratulations <@${member.id}>! You have been promoted to ${role.name}!`)

        await channel.send({ embeds: [reply]});

        // Create Squadron Role
        // await interaction.guild.roles.create({ name: `${member.displayName}`, permissions: []});
        // const newRole = await interaction.guild.roles.cache.find(r => r.name === `${member.displayName}`);
        // await member.roles.add(newRole).catch(console.log);

        // Save Squadron details to database
        const newSquadron = {
            leader: `${member.id}`,
            officer: ``,
            ships: [],
            modules: [],
            specs: [],
        };

        db.squadrons.set(`${member.id}`, newSquadron);

        // Obligatory reply
        await interaction.reply({content: `${member.displayName} has been promoted to ${role.name}!`, ephemeral: true});

	}
};