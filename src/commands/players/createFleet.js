const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Cruiser } = require('../../modules/ships/cruiser');
const squadrons = require('../../database/db.js');

/* TO DO

- Add name option subcommand for second ship

*/

module.exports = {
	data: new SlashCommandBuilder()
	.setName('Create Fleet')
	.setDescription('Create your ship fleet')
    .addStringOption(option =>
        option.setName('Flagship Name')
            .setDescription('Name your flagship Cruiser')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('Starting Starship')
            .setDescription("Choose your fleet's secondary ship"))
            .setRequired(true)
            .addChoices(
                { name: 'Freighter', value: 'freighter' },
                { name: 'Scout', value: 'scout' },
                { name: 'Science Vessel', value: 'science_vessel' },
            )
    .addStringOption(option =>
        option.setName('Specialized Ship')
            .setDescription("Choose your fleet's Specialized Ship"))
            .setRequired(true)
            .addChoices(
                { name: 'Mining Platform', value: 'mining_platform' },
                { name: 'Comm Relay', value: 'comm_relay' },
                { name: 'Fighter Squad', value: 'fighter_squad' },
            )
    .addStringOption(option =>
        option.setName('Starting Module')
            .setDescription("Choose a module to gain, attachable to a Starship"))
            .setRequired(true)
            .addChoices(
                { name: 'Hangar Bay', value: 'hanger_bay' },
                { name: 'Weapon Silos', value: 'weapon_silos' },
                { name: 'Shields', value: 'shields' },
                { name: 'Cargo Storage', value: 'cargo_storage' },
            )
	,
	async execute(interaction) {
        const member = interaction.member.id;
        const flagship = interaction.options.get('Flagship Name').value;
        const starterShip = interaction.options.get('Starting Starship').value;
        const specShip = interaction.options.get('Specialized Ship').value;
        const module = interaction.options.get('Starting Module').value;

        // const channel = interaction.guild.channels.cache.get('1121842315229675610');


        // Assign Fleet
        /* Plan: Get private channel of member, send them first
        time setup dialogue to pick starter ships & ship modules */

        if (true === true) { //role.name === "Squadron Leader"

            // Create starting fleet loadout
            const cruiser = new Cruiser(`Starship ${flagship}`);
            let secondary;

            switch(starterShip) {
                case "freighter":
                    secondary = "freighter"
                    break;
                case "scout":
                    secondary = "scout"
                    break;
                case "science_vessel":
                    secondary = "science_vessel"
                    break;
            }
            squadrons.push(`${member}`, `Starship ${flagship}`, "ships");
        }

        // Obligatory reply
        await interaction.reply({content: `Flagship ${flagship} has been deployde, alongside Starship ${secondary}`, ephemeral: false});
	}
};