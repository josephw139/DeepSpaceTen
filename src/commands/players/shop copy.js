const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Fleet, generateRandomShip } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const shopList = require('../../database/shops/shopList.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { updateHangar } = require('../../database/hangerFuncs.js');
const { shopDialogue } = require('../../database/npcs/shopDialogues.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('shopcopy')
	.setDescription('Purchase and sell items. Leave blank to view shop.')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addStringOption(option =>
        option.setName("goal")
            .setDescription("Leave blank to view shop")
            .setRequired(false)
            .addChoices(
                { name: 'buy', value: 'buy' },
                { name: 'sell', value: 'sell' },
            ))
	.addStringOption(option =>
		option.setName("item")
			.setDescription("Name of item to buy or sell")
			.setRequired(false)
	)
	,
	async execute(interaction) {
        const member = interaction.member;
		const playerId = member.id;
		const channel = interaction.channel;
		const goal = interaction.options.getString('goal') || null;
		const item = interaction.options.getString('item') || null;
		//console.log(item);

		const playerData = getPlayerData(playerId);
		if (typeof playerData === 'string') {
            interaction.reply(playerData);
        }
		const { isEngaged, hangar, fleet, location,	locationDisplay, activeShip, credits } = playerData;

		const canShop = location.currentLocation.activities.includes('Shop');

		if (!canShop) {
			await interaction.reply({ content: `There's nowhere to shop here`, ephemeral: true });
		}

		// BUY
		if (goal === 'buy') {
			if (!item) {
				await interaction.reply({ content: `Please specify an item to buy.`, ephemeral: true });
				return;
			}
			const itemToBuyResult = findItemInShop(item, location.currentLocation.name);
			// Check if item exists
			if (!itemToBuyResult) {
				await interaction.reply({ content: `'${item}' not found in the shop.`, ephemeral: true });
				return;
			}
			const itemToBuy = itemToBuyResult.item;
		
			// Check if the player has enough credits
			if (credits < itemToBuy.price) {
				await interaction.reply({ content: `You do not have enough credits to buy '${item}'. You need ${itemToBuy.price}.`, ephemeral: true });
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
		
			await interaction.reply({ content: `Successfully bought '${item}' for ${itemToBuy.price} credits. Your new balance is ${newCredits} credits.`, ephemeral: false });
		
			
		} else if (goal === 'sell') { // SELL
				const sellRow = new ActionRowBuilder()
					.addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('select-sell-source')
							.setPlaceholder('Sell from your active ship or hangar')
							.addOptions([
								{
									label: 'Active Ship Inventory',
									description: 'Sell from your active ship',
									value: 'active_ship',
								},
								{
									label: 'Hangar',
									description: 'Sell from your hangar',
									value: 'hangar',
								},
							]),
					);
				
				await interaction.reply({ content: `Choose where to sell items from:`, components: [sellRow] });


		} else { // SHOW ALL 
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
			await interaction.reply({ embeds: [shopView] });
		}

		collector.on('collect', async (i) => {
			if (i.customId === 'select-sell-source') {
				await i.deferUpdate();
				const source = i.values[0]; // 'active_ship' or 'hangar'
				let itemsToSell = [];
		
				if (source === 'active_ship') {
					itemsToSell = activeShip.inventory.map(item => ({
						label: item.name,
						description: item.description,
						value: item.name,
					}));
				} else if (source === 'hangar') {
					itemsToSell = hangar.items.map(item => ({
						label: item.name,
						description: `Sell ${item.name} from the hangar.`,
						value: item.name,
					}));
				}
		
				const itemSellRow = new ActionRowBuilder()
					.addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('select-item-sell')
							.setPlaceholder('Select an item to sell')
							.addOptions(itemsToSell),
					);
		
				await i.followUp({ content: `Select an item to sell from ${source === 'active_ship' ? 'your active ship' : 'the hangar'}:`, components: [itemSellRow] });
			}
		});
		
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


let shopInventories = {
    "Orion Station": {
        ships: [],
        upgrades: [],
        furnishings: [],
        lastUpdateTime: null,
        config: {
            ships: 2,
            upgrades: 3,
            furnishings: 2,
        }
    },
    "Kaysatha": {
        ships: [],
        upgrades: [],
        furnishings: [],
        lastUpdateTime: null,
        config: {
            ships: 1,
            upgrades: 2,
            furnishings: 6,
        }
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


