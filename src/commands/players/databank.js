const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../locations/locations.js');
const db = require('../../database/db.js');
const schedule = require('node-schedule');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('databank')
        .setDescription('U.C.S. Information Center')
        .addSubcommand(subcommand =>
			subcommand
				.setName('help')
				.setDescription('Command help')
				)
		.addSubcommand(subcommand =>
			subcommand
				.setName('ships')
				.setDescription('Ship types, manufactures, and how they operate.')
				)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ucs')
                .setDescription('The U.C.S.')
                )
            ,
    async execute(interaction) {
		const member = interaction.member;
		const channel = interaction.channel;

        if (interaction.options.getSubcommand() === 'help') {
            const helpEmbed = new EmbedBuilder()
                    .setTitle('U.C.S. Information Center')
                    .setDescription(`Welcome to Frontier Space!\n
                    Use /start to begin playing. Select a ship and name it.
                    `)
                    .addFields(
                        { name: 'View Commands', value: `Use /view fleet to see a list of ships you own.
                        Use /view fleet ship # to view the specfics
                        Use /view map to see a map of your current System.`},
                        { name: 'Travel Commands', value: `Use /travel to select a known location within your current System to travel to.
                        Ships with higher Speeds take less time to reach their destinations.`},
                    );
            channel.send({ embeds: [helpEmbed] });
        } else if (interaction.options.getSubcommand() === 'ships') {
            const shipsEmbed = new EmbedBuilder()
                    .setTitle('U.C.S. Information Center')
                    .setDescription(`Welcome to Frontier Space!\n
                    There are many different types of ships, built by various governments and corps.
                    `)
                    .addFields(
                        { name: 'Different types of ships', value: `__Mining Ships__ - Specially equipped to harvest minerals and gases from asteroids, barren plants, and other mineral rich sites.\n
                        __Science Vessels__ - Equipped with state of the art labs and faciltiies, able to research anomalies, lost civilzations, relics, and more.\n
                        __Scouts__ - Using highly specialized Abacus Retracers and warp facilities, these ships are the fastest for exploring the unknown regions of space.\n
                        __Freighters__ - Large cargo ships designed to carry enormous amounts of materials to their destinations.\n`},
                    );
            channel.send({ embeds: [shipsEmbed] });
        } else if (interaction.options.getSubcommand() === 'ucs') {
            const ucsEmbed = new EmbedBuilder()
                    .setTitle('U.C.S. Information Center')
                    .setDescription(`Welcome to Frontier Space!\n
                    The United Confederacy of Systems is blah blah blah
                    `)
                    .addFields(
                        { name: 'Lore', value: `Lore moment`},
                    );
            channel.send({ embeds: [ucsEmbed] });
        }







        // Obligatory reply
		await interaction.reply({content: `Use the /databank command to learn more about the Frontier`, ephemeral: true});
    },
};