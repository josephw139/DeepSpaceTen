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
			.setName('buy')
			.setDescription('View and purchase from the shop')
			.addStringOption(option =>
				option.setName("item")
					.setDescription("Name of item to buy. Blank to view shop.")
					.setRequired(false)
			)
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
					.setDescription("Name of item to sell.")
					.setRequired(true)
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
		const item = capitalize(interaction.options.getString('item')) || null;
		const quantity = interaction.options.getInteger('quantity') || null;
		const from = interaction.options.getString('from') || null;

		//console.log(item);

		const playerData = getPlayerData(playerId);
		if (typeof playerData === 'string') {
            interaction.editReply(playerData);
        }
		const { isEngaged, hangar, fleet, location,	locationDisplay, activeShip, credits } = playerData;

		const canShop = location.currentLocation.activities.includes('Shop');

		if (!canShop) {
			await interaction.editReply({ content: `There's nowhere to shop here`, ephemeral: true });
		}

		// BUY
		if (subcommand === 'buy') {
			if (!item) { // SHOW ALL 
				const locationName = location.currentLocation.name;
				updateShopInventory(locationName);
				const inventory = shopInventories[locationName];
	
				const shipsForSale = generateListString(inventory.ships, true);
				const upgradesForSale = generateListString(inventory.upgrades);
				const furnishingsForSale = generateListString(inventory.furnishings);
	
				const shopNameDesc = shopDialogue(location.currentLocation.name);
	
				const shopView = new EmbedBuilder()
					.setTitle(`${shopNameDesc[0]}`)
					.setDescription(`${shopNameDesc[1]}`)
					.addFields(
						{ name: 'Ships for Sale', value: shipsForSale || 'None available' },
						{ name: '\u200B', value: '\u200B' },
						{ name: 'Upgrades for Sale', value: `${upgradesForSale}` || 'None available' },
						{ name: '\u200B', value: '\u200B' },
						{ name: 'Furnishings for Sale', value: `${furnishingsForSale}` || 'None available' }
					)
				await interaction.editReply({ embeds: [shopView] });
			} else {
			
				const itemToBuyResult = findItemInShop(item, location.currentLocation.name);
				// Check if item exists
				if (!itemToBuyResult) {
					await interaction.editReply({ content: `'${item}' not found in the shop.`, ephemeral: true });
					return;
				}
				const itemToBuy = itemToBuyResult.item;
			
				// Check if the player has enough credits
				if (credits < itemToBuy.price) {
					await interaction.editReply({ content: `You do not have enough credits to buy '${item}'. You need ${itemToBuy.price}.`, ephemeral: true });
					return;
				}

				// Update credits
				const newCredits = credits - itemToBuy.price;
				db.player.set(playerId, newCredits, "credits");
				
				// Use itemToBuyResult.type to determine action
				if (itemToBuyResult.type === 'ship') {
					// Add ship to fleet
					fleet.ships.push(itemToBuy);
					// Save the updated fleet or hangar
					db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
				} else if (itemToBuyResult.type === 'upgrade' || itemToBuyResult.type === 'furnishing') {
					updateHangar(playerId, hangar, itemToBuy);
				}
			
				await interaction.editReply({ content: `Successfully bought '${item}' for ${itemToBuy.price} Credits. Your new balance is ${newCredits} credits.`, ephemeral: false });
			}
			
		} else if (subcommand === 'sell') { // SELL
			let itemToSell;
			if (from == "hangar") {
				itemToSell = withdrawItemFromHangar(playerId, hangar, item, quantity);
			} else if (from == "ship") {
				itemToSell = removeItemFromShipInventory(playerId, fleet, activeShip, item, quantity);
			}

			if (!itemToSell) {
				await interaction.editReply({ content: `'${item}' not found.`, ephemeral: true });
				return;
			}

			const sellPrice = itemToSell.quantity * (itemToSell.sell_price || (itemToSell.price * .8));
			db.player.set(playerId, credits + sellPrice, "credits");
			await interaction.editReply({ content: `Sold '${item}' for ${sellPrice} Credits. Your new balance is ${credits + sellPrice} Credits.`, ephemeral: true });

			
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
			const classType = item.classType ? `${item.classType} ` : ""; // If classType is null, use an empty string
			return `__${classType}${item.name} (${item.manufacturer})- ${item.price}C__\n${item.description}`;
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
		inventory.upgrades.length = 0;
		inventory.furnishings.length = 0;

		// Generate two new random ships and add them to the inventory
        for (let i = 0; i < inventory.config.ships; i++) {
            const newShip = generateRandomShip();
            inventory.ships.push(newShip);
        }

		inventory.upgrades = generateRandomItemsFromObject(shopList.shopList.upgrades, inventory.config.upgrades);
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

    // Search upgrades
    const foundUpgrade = inventory.upgrades.find(upgrade => upgrade.name.toLowerCase() === itemName.toLowerCase());
    if (foundUpgrade) return { item: foundUpgrade, type: 'upgrade' };

    // Search furnishings
    const foundFurnishing = inventory.furnishings.find(furnishing => furnishing.name.toLowerCase() === itemName.toLowerCase());
    if (foundFurnishing) return { item: foundFurnishing, type: 'furnishing' };

    // Return null if not found
    return null;
};


