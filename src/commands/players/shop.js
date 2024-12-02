const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Fleet, generateRandomShip, capitalize } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const shopList = require('../../database/shops/shopList.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { updateHangar, withdrawItemFromHangar, removeItemFromShipInventory } = require('../../database/hangerFuncs.js');
const { shopDialogue } = require('../../database/npcs/shopDialogues.js');
const shopInventories = require('../../database/shops/shopConfigs.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('shop')
	.setDescription('Purchase and sell items. Leave blank to view shop.')
	.addSubcommand(subcommand =>
		subcommand
			.setName('view')
			.setDescription('View the shop')
		)
	.addSubcommand(subcommand =>
		subcommand
			.setName('buy')
			.setDescription('Purchase from the shop')
		)
	.addSubcommand(subcommand =>
		subcommand
			.setName('sell')
			.setDescription('Sell your items')
			.addStringOption(option =>
				option.setName('from')
					.setDescription('Sell from your Hangar or ship')
					.setRequired(true)
					.addChoices(
						{ name: 'Hangar', value: 'hangar' },
						{ name: 'Ship', value: 'ship' },
					))
			.addStringOption(option =>
				option.setName("item")
					.setDescription("Name of item to sell. Leave blank to sell everything (this will not sell purchased items)")
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option.setName("quantity")
					.setDescription("Leave blank for all.")
					.setRequired(false)
			)
		)
	,
	async execute(interaction) {
        const member = interaction.member;
		const playerId = member.id;
		const channel = interaction.channel;

		const subcommand = interaction.options.getSubcommand();
		const itemToSellName = capitalize(interaction.options.getString('item')) || null;
		const quantity = interaction.options.getInteger('quantity') || null;
		const sellFrom = interaction.options.getString('from') || null;

		//console.log(item);

		const playerData = getPlayerData(playerId);
		if (typeof playerData === 'string') {
            interaction.editReply(playerData);
        }
		const { isEngaged, hangar, fleet, location,	locationDisplay, activeShip, credits } = playerData;

		const canShop = location.currentLocation.activities.includes('Shop');

		if (!canShop) {
			await interaction.editReply({ content: `There's nowhere to shop here`, ephemeral: true });
			return;
		}

		const selections = {};

		const locationName = location.currentLocation.name;
		updateShopInventory(locationName);
		const inventory = shopInventories[locationName];
		
		// SHOW ALL
		if (subcommand === 'view') {
	
				const shipsForSale = generateListString(inventory.ships, true);
				const modulesForSale = generateListString(inventory.modules);
				const furnishingsForSale = generateListString(inventory.furnishings);
				const equipmentForSale = generateListString(inventory.furnishings);
	
				const shopNameDesc = shopDialogue(location.currentLocation.name);
	
				const shopView = new EmbedBuilder()
					.setTitle(`${shopNameDesc[0]}`)
					.setDescription(`${shopNameDesc[1]}`)
					.addFields(
						{ name: 'Ships for Sale', value: shipsForSale || 'None available' },
						{ name: '\u200B', value: '\u200B' },
						{ name: 'Modules for Sale', value: `${modulesForSale}` || 'None available' },
						{ name: '\u200B', value: '\u200B' },
						{ name: 'Furnishings for Sale', value: `${furnishingsForSale}` || 'None available' },
						{ name: '\u200B', value: '\u200B' },
						{ name: 'Equipment for Sale', value: `${equipmentForSale}` || 'None available' }
					)
				await interaction.editReply({ embeds: [shopView] });

		} else if (subcommand === 'buy') { // BUY
			try {
				// Create a dropdown menu with items to buy as options
				const typeRow = new ActionRowBuilder()
					.addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('select-type')
							.setPlaceholder('Select type of item it purchase')
							.addOptions([
								{ label: 'Ship', value: 'ships' },
								{ label: 'Module', value: 'modules' },
								{ label: 'Furnishing', value: 'furnishings' },
								{ label: 'Crew Equipment', value: 'equipment' }
							])
					);
			
				// Reply with the dropdown menu
				await interaction.editReply({ content: 'Select category to purchase from:', components: [typeRow] });
			
				const filter = (i) => i.user.id === interaction.user.id;
				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
			
				collector.on('collect', async (i) => {
					await i.deferUpdate();  // Acknowledge the interaction
					if (i.customId === 'select-type') {
						

						const selectedType = i.values[0];
						selections['type'] = selectedType;
						const items = inventory[selectedType];

						if (!items || items.length === 0) {
							await i.editReply({ content: `No items available for purchase in this category.`, components: [] });
							return;
						}
				
						// List shop items
						const itemRow = new ActionRowBuilder().addComponents(
							new StringSelectMenuBuilder()
								.setCustomId('select-item')
								.setPlaceholder('Select item to purchase')
								.addOptions(items.map((item, index) => ({
									label: `${item.name} - ${item.price} C`,
									description: item.description,
									value: `${selectedType}-${index}` // A value combining type and index
								}))
							)
						);
						await i.editReply({ content: `Choose an option to buy:`, components: [itemRow] });
				
					} else if (i.customId === 'select-item') {

						const [type, index] = i.values[0].split('-');
						const item = inventory[type][parseInt(index)];
						selections['item'] = item;

						// Check if the player has enough credits
						if (credits < item.price) {
							await i.editReply({ content: `You do not have enough credits to buy '${item.name}'. You need ${item.price}.`, ephemeral: true });
							return;
						}
		
						await i.editReply({ content: `You have selected to purchase: ${item.name} for ${item.price}.`, components: [] });
						// Here you can handle the logic to actually purchase the item
						collector.stop();
					}
				})

				collector.on('end', () => {
					try {
						const item = selections['item'];	
						const type = selections['type'];				
						
						// Use itemToBuyResult.type to determine action
						if (type === 'ships') {
							// Add ship to fleet
							fleet.ships.push(item);
							// Save the updated fleet or hangar
							db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
						} else if (type === 'modules' || type === 'furnishings') {
							updateHangar(playerId, hangar, item);
						}

						// Update credits
						const newCredits = credits - item.price;
						db.player.set(playerId, newCredits, "credits");
					
						interaction.channel.send({ content: `Successfully bought '${item.name}' for ${item.price} Credits. Your new balance is ${newCredits} credits.`, ephemeral: true });


					} catch (err) {
						console.log(err);
					}
				})
			} catch (err) {
				console.log(err);
			}

		} else if (subcommand === 'sell') { // SELL
			let itemToSell;
			let sellPrice = 0;

			if (itemToSellName) {
				if (sellFrom == "hangar") {
					itemToSell = withdrawItemFromHangar(playerId, hangar, itemToSellName, quantity);
				} else if (sellFrom == "ship") {
					itemToSell = removeItemFromShipInventory(playerId, fleet, activeShip, itemToSellName, quantity);
				}

				if (!itemToSell) {
					await interaction.editReply({ content: `'${itemToSellName}' not found.`, ephemeral: true });
					return;
				}

				sellPrice += itemToSell.quantity * (itemToSell.sell_price || (itemToSell.price * .8));
				db.player.set(playerId, credits + sellPrice, "credits");
				await interaction.editReply({ content: `Sold '${itemToSellName}' for ${sellPrice} Credits. Your new balance is ${credits + sellPrice} Credits.`, ephemeral: true });
			} else {
				if (sellFrom === "hangar") {
					hangar.forEach(item => {
						if (item.type != 'module' && item.type != 'furnishing' && item.type != 'equipment') {
							itemToSell = withdrawItemFromHangar(playerId, hangar, item.name, null);
							sellPrice += itemToSell.quantity * (itemToSell.sell_price || (itemToSell.price * .8));
						}
					})
					await interaction.editReply({ content: `Emptied the Hangar for ${sellPrice} Credits. Your new balance is ${credits + sellPrice} Credits.`, ephemeral: true });
					db.player.set(playerId, credits + sellPrice, "credits");
				} else {
					activeShip.inventory.forEach(item => {
						itemToSell = removeItemFromShipInventory(playerId, fleet, activeShip, item.name, null);
						sellPrice += itemToSell.quantity * (itemToSell.sell_price || (itemToSell.price * .8));
					})

					activeShip.lab.forEach(item => {
						itemToSell = removeItemFromShipInventory(playerId, fleet, activeShip, item.name, null);
						sellPrice += itemToSell.quantity * (itemToSell.sell_price || (itemToSell.price * .8));
					})
					await interaction.editReply({ content: `Emptied the cargo hold for ${sellPrice} Credits. Your new balance is ${credits + sellPrice} Credits.`, ephemeral: true });
					db.player.set(playerId, credits + sellPrice, "credits");
				}
			}
						
		}
	}
};

// Function to generate list strings for embed fields
function generateListString(items, isShip = false) {
    if (!items || items.length === 0) {
        return 'None available';
    }

	if (!isShip) {
		return items.map(item => {
			return `__${item.name} - ${item.price}C__\n${item.description}`;
		}).join('\n\n');
	} else {
		return items.map(item => {
			const sizeType = item.sizeType ? `${item.sizeType} ` : ""; // If sizeType is null, use an empty string
			return `__${sizeType} ${item.name} (${item.manufacturer}) - ${item.price}C__\n${item.description}`;
		}).join('\n\n');
		
	}
    
};



function updateShopInventory(location) {
    const now = new Date();
	let inventory = shopInventories[location];

	if (!inventory) {
        console.error(`No inventory found for location: ${location}`);
        return;
    }

    if (!inventory.lastUpdateTime || now - inventory.lastUpdateTime >= 3 * 24 * 60 * 60 * 1000) { // 3 days in milliseconds
        inventory.ships = [];
		inventory.modules.length = 0;
		inventory.furnishings.length = 0;

		// Generate two new random ships and add them to the inventory
        for (let i = 0; i < inventory.config.ships; i++) {
            const newShip = generateRandomShip();
            inventory.ships.push(newShip);
        }

		inventory.modules = generateRandomItemsFromObject(shopList.shopList.modules, inventory.config.modules);
		inventory.furnishings = generateRandomItemsFromObject(shopList.shopList.furnishings, inventory.config.furnishings);

        inventory.lastUpdateTime = now;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

function generateRandomItemsFromObject(itemsObj, count) {
    let itemsWithWeights = [];
    Object.entries(itemsObj).forEach(([key, item]) => {
        const weight = 1 / (item.rarity || 1);
        for (let i = 0; i < weight * 10; i++) {
            itemsWithWeights.push(item);
        }
    });

    // Shuffle the entire array to randomize item positions
    shuffleArray(itemsWithWeights);

    const selectedItems = [];
    while (selectedItems.length < count && itemsWithWeights.length > 0) {
        // Always take the first item from the shuffled array
        const selectedItem = itemsWithWeights.shift();
        selectedItems.push(selectedItem);

        // Remove all other instances of the selected item
        itemsWithWeights = itemsWithWeights.filter(item => item !== selectedItem);
    }

    return selectedItems;
}





// Function to find an item in the shop list by name, ignoring case
const findItemInShop = (itemName, locationName) => {
	const inventory = shopInventories[locationName];
	if (!inventory) {
        console.log(`No inventory found for location: ${locationName}`);
        return null;
    }

    // Search ships
    const foundShip = inventory.ships.find(ship => ship.name.toLowerCase() === itemName.toLowerCase());
    if (foundShip) return { item: foundShip, type: 'ship' };

    // Search modules
    const foundModules = inventory.modules.find(modules => modules.name.toLowerCase() === itemName.toLowerCase());
    if (foundModules) return { item: foundModules, type: 'module' };

    // Search furnishings
    const foundFurnishing = inventory.furnishings.find(furnishing => furnishing.name.toLowerCase() === itemName.toLowerCase());
    if (foundFurnishing) return { item: foundFurnishing, type: 'furnishing' };

    // Return null if not found
    return null;
};


