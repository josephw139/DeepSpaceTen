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
	.setDescription('Purchase and sell items')
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
				await interaction.reply({ content: `Item '${item}' not found in the shop.`, ephemeral: true });
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
			} else if (itemToBuyResult.type === 'upgrade') {
				updateHangar(playerId, hangar, itemToBuy);
			}
		
			await interaction.reply({ content: `Successfully bought '${item}' for ${itemToBuy.price} credits. Your new balance is ${newCredits} credits.`, ephemeral: false });
		
			
		} else if (goal === 'sell') { // SELL
				


		} else { // SHOW ALL 
			const shipsForSale = generateListString(shopList.shopList.ships);
			const upgradesForSale = generateListString(shopList.shopList.upgrades);

			const shopView = new EmbedBuilder()
				.setTitle(`Shop`)
				.setDescription(`This is a shop`)
				.addFields(
					{ name: 'Ships for Sale', value: shipsForSale},
					{ name: 'Upgrades for Sale', value: upgradesForSale },
				)
			await interaction.reply({ embeds: [shopView] });
		}

	}
};

// Function to generate list strings for embed fields
const generateListString = (items) => {
    // Check if items is null, undefined, or empty
    if (!items || Object.keys(items).length === 0) {
        return 'None available';
    }

    return Object.entries(items).map(([key, item]) => {
        return `__${item.name} - ${item.price}C__\n${item.desc}`;
    }).join('\n\n');
};

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

    // Return null if not found
    return null;
};