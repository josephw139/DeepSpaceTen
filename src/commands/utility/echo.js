const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('echo')
	.setDescription('Replies with your input!')
	.addStringOption(option =>
		option.setName('input')
			.setDescription('The input to echo back')
			// Ensure the text will fit in an embed description, if the user chooses that option
			.setMaxLength(2000))
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('The channel to echo into')
			// Ensure the user can only select a TextChannel for output
			.addChannelTypes(ChannelType.GuildText)),
	async execute(interaction) {
		const input = interaction.options.get('input').value;
		const channelID = interaction.options.get('channel').value;
		const channel = interaction.guild.channels.cache.get(channelID);

		const reply = new EmbedBuilder()
		.setAuthor({name: `${interaction.member.displayName}`})
		.setDescription(`${input}`);

		try {
			channel.send({ embeds: [reply]});
		} catch (e) {
			console.log(e);
		}

		await interaction.reply({ content: 'Message sent!'});

	}
};