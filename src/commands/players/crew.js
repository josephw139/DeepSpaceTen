const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { generateRandomCrewMember } = require('../../database/crewFuncs.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('crew')
	.setDescription('Manage your crew, hire, retire.')
	.addStringOption(option =>
		option.setName("manage")
			.setDescription("Leave blank to see all crew, view to see a specific crew member.")
			.addChoices(
				{ name: 'view', value: 'view' },
				{ name: 'assign', value: 'assign' },
				{ name: 'hire', value: 'hire' },
				{ name: 'retire', value: 'retire' },
			))
		,
	async execute(interaction) {
		const playerId = interaction.member.id;
		const channel = interaction.channel;
		const manage = interaction.options.getString('manage') || null;
		
		const playerData = getPlayerData(playerId);
		if (typeof playerData === 'string') {
            interaction.editReply(playerData);
        }
		const { isEngaged, hangar, fleet, location,	locationDisplay, activeShip, credits } = playerData;

		

		const crewEmbed = new EmbedBuilder()
				.setTitle(`Exploration Team ${interaction.member.displayName}`)
				.setDescription(`Your Fleet's Crew`)

		if (manage == null) {
			activeShip.crew.forEach(crewMember => {
				// Prepare strings for equipment
				const weapon = crewMember.equipment.weapon.name || 'None';
				const armor = crewMember.equipment.armor.name || 'None';
				const suit = crewMember.equipment.suit.name || 'None';
				const utility = crewMember.equipment.utility.name || 'None';
		
				// Add crew member info and equipment to the embed
				crewEmbed.addFields({
					name: `${crewMember.name}`,
					value: `*${crewMember.age} years old. ${crewMember.career}. ${crewMember.attitude}.*\n${crewMember.appearance} ${crewMember.personality}\n\nWeapon: ${weapon}\nArmor: ${armor}\nSuit: ${suit}\nUtility: ${utility}`
				});
			});
			await interaction.editReply({ embeds: [crewEmbed] });
		}
		else if (manage == "view") {
			await interaction.editReply("not yet");
		}
		else if (manage == "assign") {
			await interaction.editReply("Crew Member has been assigned to Ship");
		}
		else if (manage == "hire") {
			if (!location.currentLocation.activities.includes('Shop')) {
				await interaction.editReply("There's nowhere to hire people here.");
				return;
			}
			let currentLocationName = location.currentLocation.name;
			
			updateHiringBoard(currentLocationName); // Refresh the board if needed
			const currentHiringBoard = hiringBoards[currentLocationName];

			const hiringBoardEmbed = new EmbedBuilder()
				.setTitle("Hiring Board")
				.setDescription("Here are the potential crew members available for hire:");

			currentHiringBoard.forEach(crew => {
				hiringBoardEmbed.addFields({ name: crew.name, value: `Hiring Cost: ${crew.cost}C\nAge: ${crew.age}\nAppearance: ${crew.appearance}\nPersonality: ${crew.personality}\nAttitude: ${crew.attitude}` });
			});

			await channel.send({ embeds: [hiringBoardEmbed] });

			// Create a dropdown menu with hires as options
			const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select-hire')
                    .setPlaceholder('Hire Crew')
                    .addOptions(currentHiringBoard.map((crew, index) => ({
                        label: crew.name,
                        value: `hire_${index}`
                    }))),
            );

			if (activeShip.crew.length >= activeShip.crewCapacity[1]) {
				await interaction.editReply("Your ship is at crew capacity. Please reassign or retire a crew member.");
				return;
			}

			// Reply with the dropdown menu
			await interaction.editReply({ content: 'Hire Crew:', components: [row] });
			
			// Handle the dropdown selection
			const filter = (i) => i.customId === 'select-hire' && i.user.id === interaction.user.id;
			interaction.channel.awaitMessageComponent({ filter, time: 1200000 }) // 1200-second wait for response
				.then( async i => {

					const selectedIndex = parseInt(i.values[0].split('_')[1]);
					const selectedCrew = currentHiringBoard[selectedIndex];

					if (!selectedCrew) {
						await i.reply({ content: "Selected crew member not found on the hiring board.", ephemeral: true });
						return;
					}

					// Deduct credits and check if the player has enough
					const cost = selectedCrew.cost; // Assuming each crew member object has a 'cost' property
					if (credits < cost) {
						await i.reply({ content: `You do not have enough credits to hire ${selectedCrew.name}. Needed: ${cost} credits.`, ephemeral: true });
						return;
					}

					// Update credits
					db.player.set(`${playerId}`, credits - cost, "credits");
					
					// Add crew to ship & fleet
					activeShip.crew.push(selectedCrew);	
					console.log(selectedCrew);			
					db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");

					// Remove hired crew from hiring board
					currentHiringBoard.splice(selectedIndex, 1);
					
					i.reply({ content: `Successfully hired ${selectedCrew.name}`, components: [] });
				})
				.catch(e => {
					if (e.code === 'InteractionCollectorError') {
						channel.send({ content: `Hire selection has timed out.` });
					} else {
						// Log other errors for debugging
						console.error('Error in awaitMessageComponent:', e);
					}
				});
		}
	}
}



let lastUpdateTime = null;
let hiringBoards = {
    "Orion Station": [],
    "Kaysatha": [],
    // Add other locations as needed
};

function updateHiringBoard(location) {
    const now = new Date();
    if (!hiringBoards[location]) {
        hiringBoards[location] = [];
    }

    let locationBoard = hiringBoards[location];
    let lastUpdate = locationBoard.lastUpdateTime;

    if (!lastUpdate || now - lastUpdate >= 3 * 24 * 60 * 60 * 1000 || locationBoard.length <= 3) {
        if (!lastUpdate || now - lastUpdate >= 3 * 24 * 60 * 60 * 1000) {
            locationBoard.length = 0; // Clear the board for this location
        }
        for (let i = locationBoard.length; i < 6; i++) {
            locationBoard.push(generateRandomCrewMember());
        }
        hiringBoards[location].lastUpdateTime = now;
    }
}


