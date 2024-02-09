const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Fleet, capitalize } = require('../../modules/ships/base.js');
const { sectors } = require('../../locations/locations.js')
const db = require('../../database/db.js');
const { getPlayerData, calculateWeight } = require('../../database/utilityFuncs.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hangar')
        .setDescription('Manage your U.C.S. assigned HyperHangar, accessible on any stations registered with the U.C.S.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('deposit')
                .setDescription('Deposit items and goods into your hangar')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Name of the item to deposit')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('quantity')
                        .setDescription('Quantity to deposit. Leave blank for all.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('withdraw')
                .setDescription('Withdraw items and goods from your hangar')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Name of the item to withdraw')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('quantity')
                        .setDescription('Quantity to withdraw. Leave blank for all.')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your hangar')),
    async execute(interaction) {
        const playerId = interaction.member.id;
        const subcommand = interaction.options.getSubcommand();
        const playerData = getPlayerData(playerId);
		const fleet = playerData.fleet;
        const hangar = playerData.hangar;
        // console.log(hangar);
		const location = playerData.location;
		const locationDisplay = playerData.locationDisplay;
		const activeShip = playerData.activeShip;
		const isEngaged = playerData.isEngaged;

        const isHangar = location.currentLocation.activities.includes('Hangar');
        if (!isHangar && subcommand != "view") {
            await interaction.reply(`You can't access your hangar here.`);
            return;
        }

        if (isEngaged) {
            await interaction.reply(`You're currently engaged in another activity.`);
            return;
        }

        const item = capitalize(interaction.options.getString('item')) || null;
        const quantity = interaction.options.getInteger('quantity') || null;

        switch (subcommand) {
            case 'deposit':
                // Remove items from ship
                const itemToDeposit = removeItemFromShipInventory(playerId, fleet, activeShip, item, quantity);
                if (!itemToDeposit) {
                    await interaction.reply({ content: `Item not found or insufficient quantity in ship's inventory.`, ephemeral: true });
                    return;
                }

                updateHangar(playerId, hangar, itemToDeposit);

                // Update player's hangar in the database
                db.player.set(`${playerId}`, hangar, "hangar");

                await interaction.reply(`Successfully deposited ${itemToDeposit.quantity} of ${itemToDeposit.name} into the hangar.`);
                break;
            case 'withdraw':
                // Withdraw item from hangar
                const itemToWithdraw = withdrawItemFromHangar(playerId, hangar, item, quantity);
                if (!itemToWithdraw) {
                    await interaction.reply({ content: `Item not found or insufficient quantity in hangar.`, ephemeral: true });
                    return;
                }

                // Add item to active ship's inventory
                addItemToShipInventory(playerId, fleet, activeShip, itemToWithdraw);

                await interaction.reply(`Successfully withdrew ${itemToWithdraw.quantity} of ${itemToWithdraw.name} from the hangar.`);
                break;
            case 'view':
                // Create an embed for the hangar view
                const hangarEmbed = new EmbedBuilder()
                    .setTitle(`${interaction.member.displayName}'s Hangar`)
                    .setDescription('Here are the items and goods stored in your hangar:')
                    .setColor('#0099ff');

                    // Check if the hangar is empty
                    if (Object.keys(hangar).length === 0) {
                        hangarEmbed.addFields({ name: 'Empty Hangar', value: 'You currently have no items in your hangar.' });
                    } else {
                        // Iterate through each item in the hangar array and add it to the embed
                        hangar.forEach(item => {
                            const itemInfo = `Quantity: ${item.quantity} | Weight: ${item.weight}\nDescription: ${item.description}`;
                            hangarEmbed.addFields({ name: item.name, value: itemInfo });
                        });
                    }

                await interaction.reply({ embeds: [hangarEmbed] });
                break;
            default:
                await interaction.reply('Unknown command, please try again!');
                break;
        }
    }
};

// DEPOSIT 
function removeItemFromShipInventory(playerId, fleet, activeShip, itemName, quantityToRemove) {
    // Find the ship and item
    const shipIndex = fleet.ships.findIndex(s => s.name === activeShip.name);
    const ship = fleet.ships[shipIndex];
    const itemIndex = ship.inventory.findIndex(i => i.name === itemName);
    if (itemIndex === -1) return null; // Item not found
    
    const item = ship.inventory[itemIndex];

    const quantity = quantityToRemove !== null ? quantityToRemove : item.quantity;

    if (item.quantity < quantity) return null; // Not enough quantity
    console.log("Fleet:");
    // Adjust quantity or remove item from inventory
    if (item.quantity > quantity) {
        ship.inventory[itemIndex] = {
            ...item,
            quantity: item.quantity - quantity,
            weight: calculateWeight(item.name, item.quantity - quantity)
        };
        
        console.log(fleet);
        db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
        // Return a new object representing the removed portion
        return {
            ...item,
            quantity: quantity,
            weight: calculateWeight(item.name, quantity)
        };
    } else {
        // Remove the item entirely if quantity matches
        fleet.ships[shipIndex].inventory.splice(itemIndex, 1);
        console.log(fleet);
        db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
        return item; // Item matches the quantity to remove, so return it as is
    }
}

function updateHangar(playerId, hangar, itemToAdd) {
    // Check if the item already exists in the hangar
    const itemIndex = hangar.findIndex(item => item.name === itemToAdd.name);

    if (itemIndex !== -1) {
        // Item exists, update its quantity and weight
        hangar[itemIndex].quantity += itemToAdd.quantity;
        hangar[itemIndex].weight += itemToAdd.weight;
    } else {
        // Item does not exist, add it as a new entry
        hangar.push(itemToAdd);
    }

    console.log("Updated Hangar:");
    console.log(hangar);
    db.player.set(`${playerId}`, hangar, "hangar");
}

// WITHDRAW

function withdrawItemFromHangar(playerId, hangar, itemName, quantityToRemove) {
    // Check if the item exists in the hangar
    const itemIndex = hangar.findIndex(item => item.name === itemName);
    if (itemIndex === -1) return null; // Item not found

    const item = hangar[itemIndex];

    // Determine the quantity to withdraw
    const quantity = quantityToRemove !== null ? Math.min(quantityToRemove, item.quantity) : item.quantity;

    // Adjust or remove item from hangar
    if (item.quantity > quantity) {
        hangar[itemIndex].quantity -= quantity;
        hangar[itemIndex].weight -= calculateWeight(item.name, quantity);
    } else {
        hangar.splice(itemIndex, 1); // Remove the item if all of it is withdrawn
    }

    // Update the hangar in the database
    db.player.set(`${playerId}`, hangar, "hangar");

    return {
        ...item,
        quantity, // Return the actual quantity withdrawn
    };
}

function addItemToShipInventory(playerId, fleet, activeShip, itemToAdd) {
    const ship = fleet.ships.find(s => s.name === activeShip.name);
    const itemIndex = ship.inventory.findIndex(i => i.name === itemToAdd.name);

    if (itemIndex !== -1) {
        // Item exists in ship's inventory, update quantity
        ship.inventory[itemIndex].quantity += itemToAdd.quantity;
        ship.inventory[itemIndex].weight += itemToAdd.weight;
    } else {
        // Item does not exist, add it
        ship.inventory.push(itemToAdd);
    }

    // Update the fleet in the database
    db.player.set(`${playerId}`, fleet.fleetSave(), "fleet");
}