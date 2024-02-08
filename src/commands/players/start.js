const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Fleet, capitalize } = require('../../modules/ships/base');
const { sectors } = require('../../locations/locations.js')
const db = require('../../database/db.js');

/* TO DO

- Add name option subcommand for second ship

*/

module.exports = {
	data: new SlashCommandBuilder()
	.setName("start")
	.setDescription('Create your first ship!')
    .addStringOption(option =>
        option.setName("ship")
            .setDescription("Each type of ship has different benefits")
            .setRequired(true)
            .addChoices(
                { name: 'Scout Corvette', value: 'scout' },
                { name: 'Mining Ship', value: 'mining_ship' },
                { name: 'Science Vessel', value: 'science_vessel' },
            ))
    .addStringOption(option =>
        option.setName("name")
            .setDescription('Name your new ship!')
            .setRequired(true))
    /*.addStringOption(option =>
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
            ))*/
	,
	async execute(interaction) {
        const member = interaction.member.id;
        //const flagshipName = interaction.options.get('flagship').value;
        const shipType = interaction.options.get('ship').value;
        const name = interaction.options.get('name').value;
        //const drone = capitalize(interaction.options.get('drone').value);
        //const module = capitalize(interaction.options.get('module').value);
        //const upgrade = interaction.options.get('upgrade').value;

        // TESTING
        //const test = Fleet.createShip("cruiser", `${flagshipName}`);
        //test.toArray();

        // Check to see if they already have ships
        /* if ((db.player.get(`${member}`, "fleet"))) {
            await interaction.reply({content: "You've already created your ship!", ephemeral: true});
            return;
        } */

        // const channel = interaction.guild.channels.cache.get('1121842315229675610');


        // Assign Fleet
        /* Plan: Get private channel of member, send them first
        time setup dialogue to pick starter ships & ship modules */

        const fleet = new Fleet();
        if (true === true) { //role.name === "Squadron Leader"

            // Create starting fleet loadout
            // console.log(`${flagshipName}`)

            const flagship = fleet.createShip(`${shipType}`, `${name}`, 'Atlas Exploration'); // new fleet.Cruiser(`U.C.S. ${flagshipName}`);
            fleet.setActiveShip(`${name}`);

            // const secondShip = fleet.createShip(`${starterShip}`, `${secondName}`);

            /*
            if (upgrade === 'flagship') {
                flagship.modules.push(module);
            } else {
                secondShip.modules.push(module);
            }
            */

            db.player.set(`${member}`, false, "engaged");
            db.player.set(`${member}`, fleet.fleetSave(), "fleet");
            db.player.set(`${member}`, {currentSector: 'Southeast', currentSystem: sectors.Southeast[0], currentLocation: sectors.Southeast[0].locations[0]}, "location")


            //db.player.push(`${member}`, cruiser.toArray(), "ships");
            //db.player.push(`${member}`, secondShip.toArray(), "ships");
            //db.player.push(`${member}`, `${module}`, "modules");
            // db.player.set(`${member}`, `${drone}`, "drones");
        }

        // Obligatory reply
        await interaction.reply({content: `${capitalize(shipType)} ${name} has been deployed! Welcome to Frontier Space, and may the suns shine on you.`, ephemeral: false});
	}
};