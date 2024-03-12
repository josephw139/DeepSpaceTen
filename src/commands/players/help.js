const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectorsData = require('../../database/locations.js');
const db = require('../../database/db.js');
const schedule = require('node-schedule');
const { getPlayerData } = require('../../database/playerFuncs.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Learn to play the game')
        .addStringOption(option =>
            option.setName("with")
                .setDescription("Leave blank to learn the basics")
                .setRequired(false)
                .addChoices(
                    { name: 'Commands', value: 'commands' },
                ))
            ,
    async execute(interaction) {
		const channel = interaction.channel;
        const helpWith = interaction.options.getString('with') || null;
        

        if (helpWith === null) {
            const helpEmbed = new EmbedBuilder()
                    .setTitle('U.C.S. New Arrival Center')
                    .setDescription(`Welcome to the United Confederacy of Systems!\n
                    This is an idle game centered around exploring and exploiting unexplored space on the Frontiers.
                    
                    Certain spacecraft are better suited towards different goals, and each manufacturer has their own ship style.

                    
                    Mining Ships are capable of mining Ores, Gases, and other materials, able to be used to build and construct things.
                    
                    Science Vessels research and study fauna, cosmic phenomenon, ancient relics and more, able to be used for unlocking new areas of science and tech to study and implement.
                    
                    Scout ships are fast and nimble, best suited for exploring new Systems and locations or delivering goods quickly.

                    Use /start to begin playing.
                    `);
            interaction.reply({ embeds: [helpEmbed] });
        } else if (helpWith === 'commands') {
            const helpEmbed = new EmbedBuilder()
                    .setTitle('U.C.S. New Arrival Center')
                    .setDescription(`Welcome to the United Confederacy of Systems!\n`)
                    .addFields(
                        { name: 'All Commands', value: `/start (starts a new game or resets your game)
                        /view
                        /databank
                        /hangar
                        /shop
                        /mine
                        /research (not implemented)
                        /travel
                        `},
                        { name: 'View Commands', value: `Use /view fleet to see a list of ships you own.
                        Use /view fleet ship # to view the specfics
                        Use /view map to see a map of your current System.`},
                        { name: 'Databank Commands', value: `Use /databank lore:X to learn more about the setting.
                        More lore will fill in as you discover more about locations, systems, and the setting`},
                        { name: 'Hangar Commands', value: `Can only be used on locations with the Hangar Activity.
                        Use /hangar view to all items in your Hangar, /hangar deposit to place items in from your Active Ship, /hangar withdraw to add items to your Active Ship.`},
                        { name: 'Shop Commands', value: `Can only be used in locations with the Shop Activity.
                        Use /shop to view all items in your location, /shop buy or sell to purchase from the shop or sell from your Active Ship.`},
                        { name: 'Mining Commands', value: `Can only be used in locations with the Mining Activity.
                        Use /mine job: start to begin mining and /mine job: stop to cancel it.`},
                        { name: 'Research Commands (not implemented)', value: `Can only be used in locations with the Research Activity.
                        Use /research job: start to begin mining and /research job: stop to cancel it.`},
                        { name: 'Travel Commands', value: `Use /travel to select a known location within your current System to travel to.
                        Ships with higher Speeds take less time to reach their destinations.`},
                       
                    );
            interaction.reply({ embeds: [helpEmbed] });
        }
    }
}