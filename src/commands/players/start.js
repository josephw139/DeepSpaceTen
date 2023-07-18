const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Fleet, capitalize } = require('../../modules/ships/base');
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
                { name: 'Science Vessel', value: 'science vessel' },
            ))
    .addStringOption(option =>
        option.setName("name")
            .setDescription('Name your new ship!')
            .setRequired(true))
    .addStringOption(option =>
        option.setName("drone")
            .setDescription("Choose your fleet's Drone Ship")
            .setRequired(true)
            .addChoices(
                { name: 'Mining Platform', value: 'mining platform' },
                { name: 'Comm Relay', value: 'comm relay' },
            ))
    .addStringOption(option =>
        option.setName("module")
            .setDescription("Choose a Module to upgrade one of your ships with")
            .setRequired(true)
            .addChoices(
                { name: 'Cargo Storage', value: 'cargo storage' },
                { name: 'Weapon Silos', value: 'weapon silos' },
                // { name: 'Shields', value: 'shields' },
                // { name: 'Hangar Bay', value: 'hanger bay' },

            ))
    .addStringOption(option =>
        option.setName("upgrade")
            .setDescription("Choose which ship to attach your chosen Module to")
            .setRequired(true)
            .addChoices(
                // { name: 'Hangar Bay', value: 'hanger bay' },
                { name: 'Flagship', value: 'flagship' },
                { name: 'Secondary', value: 'secondary' },
            ))
	,
	async execute(interaction) {
        const member = interaction.member.id;
        const flagshipName = interaction.options.get('flagship').value;
        const starterShip = interaction.options.get('secondary').value;
        const secondName = interaction.options.get('name').value;
        const drone = capitalize(interaction.options.get('drone').value);
        const module = capitalize(interaction.options.get('module').value);
        const upgrade = interaction.options.get('upgrade').value;

        // TESTING
        //const test = Fleet.createShip("cruiser", `${flagshipName}`);
        //test.toArray();

        // Check to see if they already have ships
        if ((db.squadrons.get(`${member}`, "fleet"))) {
            await interaction.reply({content: "You've already created your fleet!", ephemeral: true});
            return;
        }

        // const channel = interaction.guild.channels.cache.get('1121842315229675610');


        // Assign Fleet
        /* Plan: Get private channel of member, send them first
        time setup dialogue to pick starter ships & ship modules */

        const fleet = new Fleet();
        if (true === true) { //role.name === "Squadron Leader"

            // Create starting fleet loadout
            // console.log(`${flagshipName}`)

            const flagship = fleet.createShip("cruiser", `${flagshipName}`); // new fleet.Cruiser(`U.C.S. ${flagshipName}`);
            const secondShip = fleet.createShip(`${starterShip}`, `${secondName}`);

            if (upgrade === 'flagship') {
                flagship.modules.push(module);
            } else {
                secondShip.modules.push(module);
            }

            db.squadrons.set(`${member}`, fleet.fleetSave(), "fleet");


            //db.squadrons.push(`${member}`, cruiser.toArray(), "ships");
            //db.squadrons.push(`${member}`, secondShip.toArray(), "ships");
            //db.squadrons.push(`${member}`, `${module}`, "modules");
            db.squadrons.set(`${member}`, `${drone}`, "drones");
        }

        // Obligatory reply
        await interaction.reply({content: `Flagship Cruiser U.C.S. ${capitalize(flagshipName)} has been deployed, alongside U.C.S. ${capitalize(starterShip)} ${capitalize(secondName)}`, ephemeral: false});
	}
};