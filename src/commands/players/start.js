const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const ships = require('../../modules/ships/base');
const db = require('../../database/db.js');

/* TO DO

- Add name option subcommand for second ship

*/

module.exports = {
	data: new SlashCommandBuilder()
	.setName("start")
	.setDescription('Create your ship fleet')
    .addStringOption(option =>
        option.setName("flagship")
            .setDescription('Name your flagship Cruiser')
            .setRequired(true))
    .addStringOption(option =>
        option.setName("secondary")
            .setDescription("Choose your fleet's secondary ship")
            .setRequired(true)
            .addChoices(
                { name: 'Freighter', value: 'freighter' },
                { name: 'Scout', value: 'scout' },
                { name: 'Science Vessel', value: 'science_vessel' },
            ))
    .addStringOption(option =>
        option.setName("name")
            .setDescription('Name your new ship!')
            .setRequired(true))
    .addStringOption(option =>
        option.setName("specialized")
            .setDescription("Choose your fleet's Specialized Ship")
            .setRequired(true)
            .addChoices(
                { name: 'Mining Platform', value: 'mining_platform' },
                { name: 'Comm Relay', value: 'comm_relay' },
                { name: 'Fighter Squad', value: 'fighter_squad' },
            ))
    .addStringOption(option =>
        option.setName("module")
            .setDescription("Choose a module to gain, attachable to a Starship")
            .setRequired(true)
            .addChoices(
                { name: 'Hangar Bay', value: 'hanger_bay' },
                { name: 'Weapon Silos', value: 'weapon_silos' },
                { name: 'Shields', value: 'shields' },
                { name: 'Cargo Storage', value: 'cargo_storage' },
            ))
	,
	async execute(interaction) {
        const member = interaction.member.id;
        const flagship = interaction.options.get('flagship').value;
        const starterShip = interaction.options.get('secondary').value;
        const secondName = interaction.options.get('name').value;
        const specShip = interaction.options.get('specialized').value;
        const module = interaction.options.get('module').value;

        // TESTING
        const test = ships.createShip(false, "cruiser", `${flagship}`);
        test.toArray();

        // Check to see if they already have ships
        if ((db.squadrons.get(`${member}`, "ships")).length > 0) {
            await interaction.reply({content: "You've already created your fleet!", ephemeral: true});
            return;
        }

        // const channel = interaction.guild.channels.cache.get('1121842315229675610');


        // Assign Fleet
        /* Plan: Get private channel of member, send them first
        time setup dialogue to pick starter ships & ship modules */

        if (true === true) { //role.name === "Squadron Leader"

            // Create starting fleet loadout
            const cruiser = ships.createShip(false, "cruiser", `${flagship}`); // new ships.Cruiser(`U.C.S. ${flagship}`);
            const secondShip = ships.createShip(false, `${starterShip}`, `${secondName}`);

            db.squadrons.push(`${member}`, `${cruiser.toArray()}`, "ships");
            db.squadrons.push(`${member}`, `${secondShip.toArray()}`, "ships");
            db.squadrons.push(`${member}`, `${module}`, "modules");
            db.squadrons.push(`${member}`, `${specShip}`, "specs");
        }

        // Obligatory reply
        await interaction.reply({content: `Flagship ${flagship} has been deployde, alongside U.C.S. ${secondName}`, ephemeral: false});
	}
};