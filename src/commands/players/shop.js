const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet, generateRandomShip } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const shopList = require('../../database/shopList.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { updateHangar } = require('../../database/hangerFuncs.js');
const { shopDialogue } = require('../../database/npcs/shopDialogues.js');


module.exports = {
	data: new SlashCommandBuilder()
	.setName('shop')
	.setDescription('Purchase and sell items. Leave blank to view shop.')
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
				db.player.set(`${playerId}`, fleet, "fleet");
			} else if (itemToBuyResult.type === 'upgrade' || itemToBuyResult.type === 'furnishing') {
				updateHangar(playerId, hangar, itemToBuy);
			}
		
			await interaction.reply({ content: `Successfully bought '${item}' for ${itemToBuy.price} credits. Your new balance is ${newCredits} credits.`, ephemeral: false });
		
			
		} else if (goal === 'sell') { // SELL
				


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
		lastUpdateTime: null
	},
	"Kaysatha": {
        ships: [],
        upgrades: [],
        furnishings: [],
        lastUpdateTime: null
    }
}

const shopConfigurations = {
    "Orion Station": {
        ships: 2,
        upgrades: 3,
        furnishings: 2,  // Example of no furnishings
    },
    "Kaysatha": {
        ships: 1,
        upgrades: 2,
        furnishings: 6,  // Example of more furnishings
    }
};



function updateShopInventory(location) {
    const now = new Date();
	let inventory = shopInventories[location];
	let config = shopConfigurations[location];

	if (!inventory) {
        console.error(`No inventory found for location: ${location}`);
        return;
    }
	if (!config) {
        console.error(`No configuration found for location: ${location}`);
        return;
    }

    if (!inventory.lastUpdateTime || now - inventory.lastUpdateTime >= 3 * 24 * 60 * 60 * 1000) { // 3 days in milliseconds
        inventory.ships = [];
		inventory.upgrades.length = 0;
		inventory.furnishings.length = 0;

		// Generate two new random ships and add them to the inventory
        for (let i = 0; i < config.ships; i++) {
            const newShip = generateRandomShip();
            inventory.ships.push(newShip);
        }

		inventory.upgrades = generateRandomItemsFromObject(shopList.shopList.upgrades, config.upgrades);
		inventory.furnishings = generateRandomItemsFromObject(shopList.shopList.furnishings, config.furnishings);

        inventory.lastUpdateTime = now;
    }
}

function generateRandomItemsFromObject(itemsObj, count) {
    const itemsWithWeights = [];
    Object.entries(itemsObj).forEach(([key, item]) => {
        // Calculate the inverse of rarity as weight; more common items have higher weights
        const weight = 1 / (item.rarity || 1);
        for (let i = 0; i < weight * 10; i++) { // Multiply by 10 or other factor to adjust granularity
            itemsWithWeights.push(item);
        }
    });

    const selectedItems = [];
    for (let i = 0; i < count; i++) {
        if (itemsWithWeights.length === 0) break;
        const randomIndex = Math.floor(Math.random() * itemsWithWeights.length);
        selectedItems.push(itemsWithWeights[randomIndex]);
        // Remove selected item to avoid duplicates
        itemsWithWeights.splice(randomIndex, 1);
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


