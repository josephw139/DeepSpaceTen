const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Fleet, capitalize, applyModule, removeModule } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { updateShipRoles } = require('../../roleManagement.js');
const { removeItemFromShipInventory, updateHangar, withdrawItemFromHangar, addItemToShipInventory } = require('../../database/hangerFuncs.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('fleet')
	.setDescription('Manage your fleet')
	.addStringOption(option =>
        option.setName("manage")
            .setDescription("View by itself will show all ships. Use ships' number to select individual ships.")
            .setRequired(true)
            .addChoices(
				{ name: 'overview', value: 'overview' },
                { name: 'inspect', value: 'inspect' },
                { name: 'active', value: 'active' },
                { name: 'rename', value: 'rename' },
				{ name: 'equip', value: 'equip' },
				{ name: 'unequip', value: 'unequip' },
            ))
	/*.addIntegerOption(option => option.setName('ship').setDescription('Select a ship'))*/
	.addStringOption(option => option.setName('rename').setDescription("Use when Renaming your ship"))
	,
	async execute(interaction) {
        const member = interaction.member;
		const playerId = member.id
		const channel = interaction.channel;
		const playerData = getPlayerData(playerId);
		
		if (typeof playerData === 'string') {
            interaction.editReply(playerData);
        }

		const { 
			hangar, fleet, activeShip, isEngaged,
			location, activity, locationDisplay, credits 
		} = playerData;

		const manageOption = interaction.options.getString('manage');
		const nameOption = interaction.options.getString('rename');

		const selections = {};

		let target;
		let shipOption;

		// FLEET VIEW 
		if (manageOption === 'inspect') {
			// VIEW SPECIFIC SHIP
			//console.log(fleet.ships);

			// Create a dropdown menu with ships as options
			const shipRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ship-inspect')
                    .setPlaceholder('Select ship')
                    .addOptions(fleet.ships.map((ship, index) => ({
                        label: ship.name,
                        value: String(index)
                    }))),
            );

			// Reply with the dropdown menu
			await interaction.editReply({ content: 'Select ship to inspect:', components: [shipRow] });

			const filter = (i) => i.customId === 'ship-inspect' && i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async (i) => {
				await i.deferUpdate(); // Acknowledge the interaction
				//console.log("Collected values:", i.values);
				selections[i.customId] = parseInt(i.values[0]);
				//console.log(selections['ship-inspect']);
				i.followUp({content: `Use /fleet manage:overview to see all your ships`, ephemeral: true});
				collector.stop();
			})
            
			collector.on('end', () => {
				shipOption = selections['ship-inspect'];
				//console.log(shipOption);

				try {
					target = fleet.ships[shipOption];
					//console.log(fleet.ships);
				} catch (err) {
					// console.log(err);
					interaction.channel.send({ content: `This ship doesn't exist`, ephemeral: true });
					return;
				}
				try {
					//console.log(target);
					let activeShipString = '';
					if (target === activeShip) {
						activeShipString += `\n*${activity}*\n`;
						activeShipString += 'STATUS: ACTIVE\n';
					}
					const shipView = new EmbedBuilder()
					.setTitle(`Exploration Team ${member.displayName}`)
					.setDescription(`${target.shipDisplay()}\n${activeShipString}`)
					.addFields(
						{ name: 'Location', value: `${locationDisplay}`},
						{ name: 'Stats', value: `${target.shipDisplay(true)}` },
					)
				
					channel.send({ embeds: [shipView] });
				} catch (err) {
					console.log(err);
				}
				
				//interaction.channel.send({content: `Use /fleet manage:overview to see all your ships`, ephemeral: true});
	
			})
		} else if (manageOption === 'overview') {
			// SHOW ALL SHIPS
			let shipDisplay = fleet.showAllShips();
			//console.log(fleet.ships[1].location);
				
			const fleetDisplay = new EmbedBuilder()
			.setTitle(`Captain ${member.displayName}`)
			.setDescription(`__Fleet Overview__\nBank: ${credits} C`)
			.addFields(
				//{ name: 'Location', value: `${locationDisplay}`},
				{ name: 'Ships', value: `${shipDisplay}` },
				// { name: 'Drone Ships', value: `${drones}`},
				// { name: 'Available Modules', value: `${modules}`},
				// { name: 'Attack Test', value: `Rolled: ${newFleet[0].attack}\nTotal Damage: ${damage[0]} | Dice Rolled: ${damage[1]}`},
			)

			channel.send({ embeds: [fleetDisplay] });

			// Obligatory reply
			await interaction.editReply({content: `Use /fleet:manage inspect to see individual ship details`, ephemeral: true});

		} else if (manageOption === 'active') {

			// Create a dropdown menu with ships as options
			const shipRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ship-active')
                    .setPlaceholder('Select ship')
                    .addOptions(fleet.ships.map((ship, index) => ({
                        label: ship.name,
                        value: String(index)
                    }))),
            );

			// Reply with the dropdown menu
			await interaction.editReply({ content: 'Select ship to activate:', components: [shipRow] });

			const filter = (i) => i.customId === 'ship-active' && i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async (i) => {
				await i.deferUpdate(); // Acknowledge the interaction
				selections[i.customId] = parseInt(i.values[0]);
				i.followUp({content: `Ship set to ACTIVE.`, ephemeral: true});
				collector.stop();
			})
            
			collector.on('end', () => {
				shipOption = selections['ship-active'];


				try {
					target = fleet.ships[shipOption];
				} catch (err) {
					console.log(err);
					interaction.channel.send({content: `This ship doesn't exist`, ephemeral: true});
					return;
				}
	
				fleet.setActiveShip(target);
				db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
				updateShipRoles(member, target.capabilities, true);

				// interaction.channel.send({content: `${fleet.getActiveShip().name} is set to ACTIVE.`, ephemeral: true});
			})
		} else if (manageOption === 'rename') {
			
			if (!nameOption) {
				await interaction.editReply({content: `Please specify a name`, ephemeral: true});
				return;
			}

			fleet.ships.forEach(ship => {
				if (ship.name === nameOption) {
					interaction.channel.send({content: `You already have a ship with this name.`, ephemeral: true});
					return;
				}
			})

			// Create a dropdown menu with ships as options
			const shipRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ship-rename')
                    .setPlaceholder('Select ship')
                    .addOptions(fleet.ships.map((ship, index) => ({
                        label: ship.name,
                        value: String(index)
                    }))),
            );

			// Reply with the dropdown menu
			await interaction.editReply({ content: 'Select ship to rename:', components: [shipRow] });

			const filter = (i) => i.customId === 'ship-rename' && i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async (i) => {
				await i.deferUpdate(); // Acknowledge the interaction
				selections[i.customId] = parseInt(i.values[0]);
				//await i.followUp({content: `Your ship has been rechristened as ${nameOption}`, ephemeral: true});
				collector.stop();
			})
            
			collector.on('end', () => {
				shipOption = selections['ship-rename'];

				try {
					target = fleet.ships[shipOption];
					const oldName = target.name;
					const oldActiveName = activeShip.name;
					target.name = nameOption;

					//console.log('RENAMING SHIP AND SAVING TO FLEET');
					//console.log(fleet);
					db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");

					const updatedFleet = new Fleet(db.player.get(`${playerId}`, "fleet"));
					//console.log(updatedFleet);
					//console.log('RENAME')
					//console.log(target);
					interaction.followUp({content: `${oldName} has been rechristened as ${target.name}`, ephemeral: true});
				} catch (err) {
					// console.log(err);
					interaction.followUp({content: `This ship doesn't exist`, ephemeral: true});
					return;
				}
			})

		} else if (manageOption === 'equip') {

			let isHangar;
			
			try {
				isHangar = location.currentLocation.activities.includes('Hangar');
			} catch (err) {
				isHangar == null;
			}

			if (!isHangar) {
				await interaction.editReply(`You can't access your hangar here.`);
				return;
			}

			let modulesExists = false; let moduleList = [];
			let furnishingExists = false; let furnishingList = [];

			hangar.forEach(item => {
				if (item.type === "module") {
					modulesExists = true;
					moduleList.push(item);
				}
				if (item.type === "furnishing") {
					furnishingExists = true;
					furnishingList.push(item);
				}
			});

			if (!modulesExists && !furnishingExists) {
				await interaction.editReply(`You have nothing to equip.`);
				return;
			}

			// Create a dropdown menu with ships as options
			const shipRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select-ship')
                    .setPlaceholder('Select ship')
                    .addOptions(fleet.ships.map((ship, index) => ({
                        label: ship.name,
                        value: String(index)
                    }))),
            );

			// Reply with the dropdown menu
			await interaction.editReply({ content: 'Select ship to equip:', components: [shipRow] });

			const filter = (i) => i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async (i) => {
				await i.deferUpdate();  // Acknowledge the interaction immediately for all cases
			
				if (i.customId === 'select-ship') {
					selections['ship'] = parseInt(i.values[0]);
			
					// Choose between Module and Furnishing
					const typeRow = new ActionRowBuilder().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('select-type')
							.setPlaceholder('Select module or furnishing to equip')
							.addOptions([
								{ label: 'Module', value: 'module' },
								{ label: 'Furnishing', value: 'furnishing' }
							])
					);
					await i.editReply({ content: `Ship selected. Choose type of equipment to add:`, components: [typeRow] });
			
				} else if (i.customId === 'select-type') {
					selections['type'] = i.values[0];  // Assign directly without parseInt
			
					// Dynamically generate the item dropdown based on the first selection
					const itemsList = selections['type'] === "module" ? moduleList : furnishingList;
					const equipRow = new ActionRowBuilder().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('select-equip')
							.setPlaceholder('Select item to equip')
							.addOptions(itemsList.map((item, index) => ({
								label: item.name, value: String(index)
							})))
					);
					await i.editReply({ content: `Choose an item to equip:`, components: [equipRow] });
			
				} else if (i.customId === 'select-equip') {
					selections['equip'] = parseInt(i.values[0]);
					await i.editReply({ content: `Item selected.`, components: [] });
					collector.stop(); // Optionally stop the collector if no further input is needed
				}
			});
			

			collector.on('end', () => {
				try {
					shipOption = selections['ship'];
					let moduleOption = selections['equip'];
					let typeOption = selections['type'];

					target = fleet.ships[shipOption];
					//console.log(target);

					try {
						if (!target.location.currentLocation.activities.includes("Hangar")) {
							interaction.channel.send({content: `${target.name} is not at a Hangar.`, ephemeral: true});
							return;
						}
					} catch (err) {
						interaction.channel.send({content: `${target.name} is not at a Hangar.`, ephemeral: true});
						return;
					}
	
					if (typeOption === "module") {
						if (target.modules.length >= target.modCapacity) {
							interaction.channel.send({content: `You don't have the capacity to add more modules to this ship.`, ephemeral: true});
							return;
						}
						
						//console.log(moduleList);
						//console.log(moduleList[moduleOption]);
						const moduleToEquip = withdrawItemFromHangar(playerId, hangar, capitalize(moduleList[moduleOption].name), 1);
						if (!moduleToEquip) {
							interaction.channel.send({content: `Module not found`, ephemeral: true});
							return;
						}
		
						const moduleApplied = applyModule(target, moduleToEquip);
						if (!moduleApplied) {
							interaction.channel.send({content: `${moduleList[moduleOption].name} is not stackable.`, ephemeral: true});
							updateHangar(playerId, hangar, moduleToEquip);
							return;
						}
						
						db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
						interaction.channel.send({content: `${target.name} has been equipped with ${moduleList[moduleOption].name}`, ephemeral: true});
						return;
					
					} else if (typeOption === "furnishing") {
						interaction.channel.send({content: `Placeholder`, ephemeral: true});
						return;
		
						if (target.furnishings.length >= target.furnishingsCapacity) {
							interaction.channel.send({content: `You don't have the capacity to add more furnishings to this ship.`, ephemeral: true});
							return;
						}
		
						const moduleToEquip = withdrawItemFromHangar(playerId, hangar, capitalize(furnishingList[moduleOption].name), 1);
						if (!moduleToEquip) {
							interaction.channel.send({content: `Furnishing not found`, ephemeral: true});
							return;
						}
		
						const moduleApplied = applyFurnishing(target, moduleToEquip);
						if (!moduleApplied) {
							interaction.channel.send({content: `${furnishingList[moduleOption].name} is not stackable.`, ephemeral: true});
						}
						
						db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
						interaction.channel.send({content: `${target.name} has been equipped with ${furnishingList[moduleOption].name}`, ephemeral: true});
		
					}
				} catch (err) {
					console.log(err);
					interaction.channel.send({content: `This ship doesn't exist`, ephemeral: true});
					return;
				}
			})
			
		} else if (manageOption === 'unequip') {

			let isHangar;

			try {
				isHangar = location.currentLocation.activities.includes('Hangar');
			} catch (err) {
				isHangar == null;
			}

			if (!isHangar) {
				await interaction.editReply(`You can't access your hangar here.`);
				return;
			}
		
			// Create a dropdown menu with ships as options
			const shipRow = new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('select-ship')
						.setPlaceholder('Select ship')
						.addOptions(fleet.ships.map((ship, index) => ({
							label: ship.name,
							value: String(index)
						}))),
				);
		
			// Reply with the dropdown menu
			await interaction.editReply({ content: 'Select ship to unequip from:', components: [shipRow] });
		
			const filter = (i) => i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
		
			collector.on('collect', async (i) => {
				await i.deferUpdate();  // Acknowledge the interaction immediately for all cases
				
				if (i.customId === 'select-ship') {
					selections['ship'] = parseInt(i.values[0]);
		
					// Choose between Module and Furnishing
					const typeRow = new ActionRowBuilder().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('select-type')
							.setPlaceholder('Select module or furnishing to unequip')
							.addOptions([
								{ label: 'Module', value: 'module' },
								{ label: 'Furnishing', value: 'furnishing' }
							])
					);
					await i.editReply({ content: `Ship selected. Choose type of equipment to remove:`, components: [typeRow] });
				
				} else if (i.customId === 'select-type') {
					selections['type'] = i.values[0];
					const itemsList = selections['type'] === "module" ? fleet.ships[selections['ship']].modules : fleet.ships[selections['ship']].furnishings;
		
					const unequipRow = new ActionRowBuilder().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('select-unequip')
							.setPlaceholder('Select item to unequip')
							.addOptions(itemsList.map((item, index) => ({
								label: item.name,
								value: String(index)
							})))
					);
					await i.editReply({ content: `Choose an item to unequip:`, components: [unequipRow] });
		
				} else if (i.customId === 'select-unequip') {
					selections['unequip'] = parseInt(i.values[0]);
					await i.editReply({ content: `Item selected.`, components: [] });
					collector.stop(); // Optionally stop the collector if no further input is needed
				}
			});
		
			collector.on('end', () => {
				try {
					shipOption = selections['ship'];
					target = fleet.ships[shipOption];

					let typeOption = selections['type'];
					let moduleOption = target.modules[selections['unequip']].name;
					


					if (typeOption === 'module') {
						const removedModule = removeModule(target, capitalize(moduleOption));
						if (!removedModule) {
							interaction.channel.send({content: `Module ${moduleOption} was not found on the ship`, ephemeral: true});
							return;
						}
			
						db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
						updateHangar(playerId, hangar, removedModule);
			
						interaction.channel.send({content: `Module ${moduleOption} has been removed from ${target.name} and stored in your Hangar.`, ephemeral: true});
					}
				} catch (err) {
					console.log(err);
				}	
			})

		}

		// TESTS
		/*
		const shipOne = ships.createShip(fleet[0].type, fleet[0]);
		const shipTwo = ships.createShip(fleet[1].type, fleet[1]);
		console.log(shipOne.toArray());
		const damage = shipOne.rollAttack();
		*/
		// END TESTS

	}
};