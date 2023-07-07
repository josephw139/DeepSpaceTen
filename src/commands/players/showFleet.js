const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const ships = require('../../modules/ships/cruiser');
const db = require('../../database/db.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('fleet')
	.setDescription('Display Fleet Details')
	,
	async execute(interaction) {
        const member = interaction.member;
        const fleet = db.squadrons.get(`${member.id}`, "ships");
		const modules = db.squadrons.get(`${member.id}`, "modules");
		const specs = db.squadrons.get(`${member.id}`, "specs");
		const channel = interaction.channel;
		console.log(fleet[0].name);

		let shipDisplay = '';
		for (i = 0; i < fleet.length; i++) {
			shipDisplay += `${i + 1} - ${fleet[i].name} (${fleet[i].type})\n`;
		}

		const fleetDisplay = new EmbedBuilder()
		.setTitle(`Exploration Team ${member.displayName}`)
        .setDescription(`Your Squadron's Overview`)
		.addFields(
			// { name: '\u200B', value: '\u200B' },
			{ name: 'Ships', value: `${shipDisplay}` },
			{ name: 'Spec Ships', value: `${specs}`},
			{ name: 'Available Modules', value: `${modules}`},
		)

		channel.send({ embeds: [fleetDisplay] });

        // Obligatory reply
         await interaction.reply({content: `Use /fleet ship # to see individual ship details`, ephemeral: true});

	}
};