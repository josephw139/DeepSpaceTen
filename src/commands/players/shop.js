const { SlashCommandBuilder, ChannelType, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectors = require('../../database/locations.js');
const shopList = require('../../database/shopList.js');
const db = require('../../database/db.js');
const { getPlayerData } = require('../../database/playerFuncs.js');
const { updateHangar } = require('../../database/hangerFuncs.js');


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
			const itemToBuyResult = findItemInShop(item);
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
				fleet.ships.push(createNewShip(itemToBuy));
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

			const shipsForSale = generateListString(inventory.ships);
			const upgradesForSale = generateListString(inventory.upgrades);
			const furnishingsForSale = generateListString(inventory.furnishings);

			let shopDesc = ``;
			let shopName = ``;

			switch (location.currentLocation.name) {
				case 'Orion Station':
					shopDesc = orionString + orionShop[Math.floor(Math.random() * orionShop.length)];
					shopName = `Wixzys' Wares - Orion Station`;
			}

			const shopView = new EmbedBuilder()
				.setTitle(`${shopName}`)
				.setDescription(`${shopDesc}`)
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
const generateListString = (items) => {
    if (!items || items.length === 0) {
        return 'None available';
    }

    return items.map(item => {
        return `__${item.name} - ${item.price}C__\n${item.description}`;
    }).join('\n\n');
};



let lastUpdateTime = null;

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


function updateShopInventory(location) {
    const now = new Date();
	let inventory = shopInventories[location];

	if (!inventory) {
        console.error(`No inventory found for location: ${location}`);
        return;
    }

    if (!inventory.lastUpdateTime || now - inventory.lastUpdateTime >= 3 * 24 * 60 * 60 * 1000) { // 3 days in milliseconds
        inventory.ships.length = 0;
		inventory.upgrades.length = 0;
		inventory.furnishings.length = 0;

		inventory.ships = [];
		inventory.upgrades = generateRandomItemsFromObject(shopList.shopList.upgrades, 4);
		inventory.furnishings = generateRandomItemsFromObject(shopList.shopList.furnishings, 4);

        inventory.lastUpdateTime = now;
    }
}

function generateRandomItemsFromObject(itemsObj, count) {
    const keys = Object.keys(itemsObj);
    let selectedItems = [];
    for (let i = 0; i < count; i++) {
        if(keys.length === 0) break; // Avoid infinite loop if no items
        const randomIndex = Math.floor(Math.random() * keys.length);
        const key = keys[randomIndex];
        selectedItems.push(itemsObj[key]);
        keys.splice(randomIndex, 1); // Remove selected key to avoid duplicates
    }
    return selectedItems;
}

// Function to find an item in the shop list by name, ignoring case
const findItemInShop = (itemName) => {
    // Check ships first
    let foundItem = Object.values(shopList.shopList.ships).find(ship => ship.name.toLowerCase() === itemName.toLowerCase());
    if (foundItem) {
        return { item: foundItem, type: 'ship' };
    }

    // Check upgrades if not found in ships
    foundItem = Object.values(shopList.shopList.upgrades).find(upgrade => upgrade.name.toLowerCase() === itemName.toLowerCase());
    if (foundItem) {
        return { item: foundItem, type: 'upgrade' };
    }

	// Check furnishings if not found in ships
    foundItem = Object.values(shopList.shopList.furnishings).find(furnishing => furnishing.name.toLowerCase() === itemName.toLowerCase());
    if (foundItem) {
        return { item: foundItem, type: 'furnishing' };
    }

    // Return null if not found
    return null;
};


// Shopkeepers

const orionShop = [
	`Stay away from the lower levels tonight, word around is things are getting rowdy."`,
	`How goes the Exploration? Find any neat planets, alien life, robots? There's gotta be robots out there somewhere, man."`,
	`Did you hear about the Conglomerate assassination? People are pointing fingers at the Martians."`
]
const orionString = `A large gray-skinned humanoid greets you with a great smile, "Welcome to Wixzys' Wares, Orion Station's premier shopping outlet! `