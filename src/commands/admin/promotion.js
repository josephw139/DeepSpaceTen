const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Cruiser } = require('../../modules/ships/cruiser');
const squadrons = require('../../database/db.js');


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

        // Obligatory reply
        await interaction.reply({content: `${member.displayName} has been promoted to ${role.name}!`, ephemeral: true});

        // Assign Fleet
        /* Plan: Get private channel of member, send them first
        time setup dialogue to pick starter ships & ship modules */
        if (role.name === "Squadron Leader") {

            // Create Squadron Role
            // interaction.guild.roles.create({ name: `${member.displayName}`, permissions: []});
            // const newRole = interaction.guild.roles.cache.find(r => r.name === `${member.displayName}`);
            // member.roles.add(newRole).catch(console.log);

            // Create new Cruiser
            const cruiser = new Cruiser(`Starship ${member.displayName}`);

            // Save Squadron details to database
            const newSquadron = {
                leader: `${member.id}`,
                officer: ``,
                ships: [cruiser],
            };

            squadrons.set(`${newRole.id}`, newSquadron);

            const getCruiser = db.get(`${newRole.id}`, "ships");

            const squadronEmbed = new EmbedBuilder()
            .setTitle(`${getCruiser[0]}`);

            await channel.send({ embeds: [squadronEmbed]});
        }
	}
};