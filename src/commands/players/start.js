const { SlashCommandBuilder, ChannelType, ButtonStyle, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Fleet, capitalize, createShip } = require('../../modules/ships/base');
const { sectors } = require('../../database/locations.js')
const db = require('../../database/db.js');
const { generateRandomCrewMember } = require('../../database/crewFuncs.js');
const { updateShipRoles } = require('../../roleManagement.js');


/* TO DO


*/

module.exports = {
	data: new SlashCommandBuilder()
	.setName("start")
	.setDescription('Create your first ship!')
	,
	async execute(interaction) {
        const member = interaction.member
        const playerId = member.id;
        const selections = {};

        // assign Captain role to users who /start
        const role = interaction.guild.roles.cache.get("1121849015856803881");
        if (!role) {
            return interaction.editReply('The role does not exist.');
        }
        await member.roles.add(role);

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`Welcome, ${interaction.member.displayName}`)
            .setDescription(`You have been approved by the Committee of Space Exploration to join the selected few in exploring the vast unknown regions of space, colloquially referred to as the Frontier.
            
            I am General Cordelia, the U.C.S.'s internal ASI (Artifical Sapient Intelligence), here to assist you when needed. I have updated your routes with information on Argus' Beacon, the closest System to civilized space.
            
            Orion Station will be your jump point and resupply fallback until construction is approved further inspace.
            
            Please confirm your ship's details for U.C.S. records, and sign below.\n\n`)
            .addFields(
                // { name: '\u200B', value: '\u200B' },
                { name: 'Frontier Space', value: `The Frontier is filled with many unexplored planets, moons, relics, and more. Some locations can be dangerous, and there's always the risk of pirates. Scanning and probes will allow you to discover new Locations, Systems, and routes to other Sectors.`},
                { name: 'Resources', value: `What's the point of exploration without profit? Depending on your ship's capabilities, you may be able to Mine, Research, find valuables, or follow other paths to sell your hard work and time to make your fortune.` },
                { name: 'Starting Ships', value: `*The Mining Ship* will allow you to mine at locations rich with minerals and gases, able to be sold for decent prices.
                
                *The Science Vessel* comes equipped with a laboratory, and excels at studying foreign and cosmic anomolies. The U.C.S. offers a high price for new information.
                
                *The Scout ship* is fast and able to discover hidden details and objects, as well as new locations and systems.
                
                You'll be able to buy other ships from the shop, although only one ship can be active at a time.`},
                { name: 'General Cordelia', value: `Some helpful commands to get started are /help, /fleet, /map, /databanks.`},
            )

    
        // Create a dropdown menu with ships as options
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select-ship')
                    .setPlaceholder('Select your starting ship')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Mining Ship')
                            .setDescription('Capable of performing mining operations.')
                            .setValue('mining_ship'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Science Vessel')
                            .setDescription('Capable of studying and researching planets, stars, and more.')
                            .setValue('science_vessel'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Scout Ship')
                            .setDescription('Small and fast, capable of discovering new places and hidden details.')
                            .setValue('scout'),
                    )
            );


        // Reply with the dropdown menu
        await interaction.editReply({ embeds: [welcomeEmbed], components: [row] });

		// Handle the dropdown selection
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            
            selections[i.customId] = i.values[0];
            await i.deferUpdate(); // Acknowledge the interaction
        
            if (i.customId === 'select-ship') {
                // Respond with sponsor dropdown
                const sponsorRow = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('select-sponsor')
                            .setPlaceholder('Which manufacturer is your ship registered by?')
                            .addOptions([
                                {
                                    label: 'Atlas Exploration',
                                    description: 'Lighter ships, but faster.',
                                    value: 'Atlas_Exploration',
                                },
                                {
                                    label: 'Martian Manufacturing LLC',
                                    description: 'Blocky, made of more durable material.',
                                    value: 'Martian_Manufacturing_LLC',
                                },
                                {
                                    label: 'Wright-Yuan Corporation',
                                    description: 'Corporate grays, a touch faster and better material than most ships.',
                                    value: 'Wright-Yuan_Corporation',
                                },
                                {
                                    label: 'Voidway Aeronautics',
                                    description: 'Esoteric designs, with more crew and cargo space.',
                                    value: 'Voidway_Aeronautics',
                                },
                                {
                                    label: 'Bright Future Industries',
                                    description: 'Expensive ships, pushing the edge of innovation.',
                                    value: 'Bright_Future_Industries',
                                },
                                {
                                    label: "Conglomerate of Liberated Peoples' Steelworks",
                                    description: 'Cheaply made, but with an eye for crew comfort.',
                                    value: "Conglomerate_of_Liberated_Peoples'_Steelworks",
                                },
                            ]),
                    );
                await i.followUp({ content: 'Ship type verified.', components: [sponsorRow] });
            } else if (i.customId === 'select-sponsor') {
                // Respond with career dropdown
                const careerRow = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('select-career')
                            .setPlaceholder('What is your background?')
                            .addOptions([
                                {
                                    label: 'Academic',
                                    description: 'Astronomy, Biology, or maybe another field. You want to push the bounds of human knowledge.',
                                    value: 'Academic',
                                },
                                {
                                    label: 'Bounty Hunter',
                                    description: "Maybe a mercenary. You have a knack for violence, and you like getting paid for it.",
                                    value: 'Bounty_Hunter',
                                },
                                {
                                    label: 'Businessman',
                                    description: "An entrapeneur? A corporate man? Exploration is opportunity, and opportunity is money.",
                                    value: 'Businessman',
                                },
                                {
                                    label: 'Pilot',
                                    description: "The cockpit of a ship is your home, and exploring space is where you belong.",
                                    value: 'Pilot',
                                },
                            ]),
                    );

                await i.followUp({ content: "Your ship's manufacturer been noted.", components: [careerRow] });
            } else if (i.customId === 'select-career') {
                /*const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('nameShipButton')
                        .setLabel('Name Your Ship')
                        .setStyle(ButtonStyle.Primary)
                ); */
        
                await i.followUp({ content: "The U.C.S. has verified all relevant data. Use /fleet manage: rename to name your ship.", components: [] });
                collector.stop();
            } /*
            } else if (i.isModalSubmit()) {
                // Currently doesn't work
                const userInput = i.fields.getTextInputValue('userInput');
                selections['shipName'] = userInput;
                await i.reply({ content: `Welcome, Captain of the ${userInput}`, ephemeral: true }); // Respond to the modal submission
                collector.stop();
            } */
        });

        collector.on('end', () => {
            console.log('Selections:', selections);
            const selectedShip = selections['select-ship'];
            const selectedSponsor = selections['select-sponsor'];
            console.log(interaction.member.user.username);
            const memberName = interaction.member.nickname || interaction.member.user.username;
            const shipName = `${memberName}'s ${capitalize(selectedShip)}`
            //const shipName = interaction.client.userInputs && interaction.client.userInputs[playerId] ? interaction.client.userInputs[playerId]['userInput'] : null;
            const selectedCareer = selections['select-career'];

            const fleet = new Fleet();
            const flagship = createShip(`${selectedShip}`, `${shipName}`, `${capitalize(selectedSponsor)}`); // new fleet.Cruiser(`U.C.S. ${flagshipName}`);
            fleet.saveShipToFleet(flagship);
            fleet.setActiveShip(`${shipName}`);
            const activeShip = fleet.getActiveShip();
            console.log(activeShip);

            updateShipRoles(member, activeShip.capabilities);

            for (let i = 0; i < activeShip.crewCapacity[0]; i++) {
                activeShip.crew.push(generateRandomCrewMember());
            }

            const starterSystem = sectors.Southeast.systems.find(system => system.name === "Argus' Beacon");
            const starterLocation = starterSystem ? starterSystem.locations[0] : null;

            // Set up Database file for the player
            // Set up Database file for the player
            try {
                db.player.set(`${playerId}`, false, "engaged");
                db.player.set(`${playerId}`, "Crew on standby, ship conserving power", "activity");
                db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
                db.player.set(`${playerId}`, {
                    currentSector: 'Southeast',
                    currentSystem: starterSystem,
                    currentLocation: starterLocation
                }, "location");
                db.player.set(`${playerId}`, [], "hangar");
                db.player.set(`${playerId}`, 1000, "credits");
                db.player.set(`${playerId}`, selectedCareer, "career");
            } catch (e) {
                console.log(e);
            }
            initializeNewPlayer(playerId);

            
        });






       /* 
        
        interaction.channel.awaitMessageComponent({ filter, time: 990000 }) // 990-second wait for response
            .then(i => {
                const selectedShip = i.values[0];

                const fleet = new Fleet();

                const flagship = createShip(`${selectedShip}`, `Model K`, "Conglomerate of Liberated Peoples' Steelworks", 'Light'); // new fleet.Cruiser(`U.C.S. ${flagshipName}`);
                fleet.saveShipToFleet(flagship);
                fleet.setActiveShip(`Model K`);
                const activeShip = fleet.getActiveShip();
                console.log(activeShip);

                for (let i = 0; i < activeShip.crewCapacity[0]; i++) {
                    activeShip.crew.push(generateRandomCrewMember());
                }

                const starterSystem = sectors.Southeast.systems.find(system => system.name === "Argus' Beacon");
                const starterLocation = starterSystem ? starterSystem.locations[0] : null;

                // Set up Database file for the player
                db.player.set(`${playerId}`, false, "engaged");
                db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
                db.player.set(`${playerId}`, {
                    currentSector: 'Southeast',
                    currentSystem: starterSystem,
                    currentLocation: starterLocation
                }, "location");
                db.player.set(`${playerId}`, [], "hangar");
                db.player.set(`${playerId}`, 50000, "credits");
                initializeNewPlayer(playerId);
            })
            .catch(e => {
                if (e.code === 'InteractionCollectorError') {
                    channel.send({ content: `Character creation has timed out, please start again.` });
                } else {
                    // Log other errors for debugging
                    console.error('Error in awaitMessageComponent:', e);
                }
            });


            */
        // Assign Fleet
        /* Plan: Get private channel of member, send them first
        time setup dialogue to pick starter ships & ship modules */


        // Obligatory reply
       //  await interaction.reply({content: `Your ship has been deployed! Welcome to Frontier Space, and may the suns shine on you.`, ephemeral: false});
	}
};

function initializeNewPlayer(playerId) {
    const defaultDiscovery = {
        discoveredSectors: [
            "Southeast", // starter sector is discovered by default
        ],
        discoveredSystems: [
            "Argus' Beacon" // starter system is discovered by default
        ]
    };

    // Other player initialization code...

    db.player.set(`${playerId}`, defaultDiscovery, "discoveries");
}

