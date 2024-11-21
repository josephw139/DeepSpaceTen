const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
const { Fleet, capitalize } = require('../../modules/ships/base.js');
const { sectors } = require('../../database/locations.js')
const db = require('../../database/db.js');
const { getPlayerData, calculateWeight } = require('../../database/playerFuncs.js');
const { removeItemFromShipInventory, updateHangar, withdrawItemFromHangar, addItemToShipInventory } = require('../../database/hangerFuncs.js')


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

        if (typeof playerData === 'string') {
            interaction.editReply(playerData);
        }
        
		const fleet = playerData.fleet;
        const hangar = playerData.hangar;
        // console.log(hangar);
		const location = playerData.location;
		const locationDisplay = playerData.locationDisplay;
		const activeShip = playerData.activeShip;
		const isEngaged = playerData.isEngaged;
        const credits = playerData.credits;

        const isHangar = location.currentLocation.activities.includes('Hangar');
        if (!isHangar && subcommand != "view") {
            await interaction.editReply(`You can't access your hangar here.`);
            return;
        }

        if (isEngaged && subcommand != "view") {
            await interaction.editReply(`You're currently engaged in another activity.`);
            return;
        }

        const item = capitalize(interaction.options.getString('item')) || null;
        const quantity = interaction.options.getInteger('quantity') || null;

        switch (subcommand) {
            case 'deposit':
                // Remove items from ship
                const itemToDeposit = removeItemFromShipInventory(playerId, fleet, activeShip, item, quantity, "hangar");
                if (!itemToDeposit) {
                    await interaction.editReply({ content: `Item not found or insufficient quantity in ship's inventory.`, ephemeral: true });
                    return;
                }
                if (itemToDeposit == 10) { // 10 arbitrarily means research is trying to be deposited
                    await interaction.editReply({ content: "You can't deposit research into the hangar.", ephemeral: true });
                    return;
                }

                updateHangar(playerId, hangar, itemToDeposit);

                // Update player's hangar in the database
                db.player.set(`${playerId}`, hangar, "hangar");

                await interaction.editReply(`Successfully deposited ${itemToDeposit.quantity} of ${itemToDeposit.name} into the hangar.`);
                break;
            case 'withdraw':
                // Withdraw item from hangar
                const itemToWithdraw = withdrawItemFromHangar(playerId, hangar, item, quantity);
                if (!itemToWithdraw) {
                    await interaction.editReply({ content: `Item not found or insufficient quantity in hangar.`, ephemeral: true });
                    return;
                }

                // Add item to active ship's inventory
                addItemToShipInventory(playerId, fleet, activeShip, itemToWithdraw);

                await interaction.editReply(`Successfully withdrew ${itemToWithdraw.quantity} of ${itemToWithdraw.name} from the hangar.`);
                break;
            case 'view':
                // Create an embed for the hangar view
                const hangarEmbed = new EmbedBuilder()
                    .setTitle(`${interaction.member.displayName}'s Hangar`)
                    .setDescription(`Here are the items and goods stored in your hangar:
                    Bank: ${credits}C`)
                    .setColor('#0099ff');

                    // Check if the hangar is empty
                    if (Object.keys(hangar).length === 0) {
                        hangarEmbed.addFields({ name: 'Empty Hangar', value: 'You currently have no items in your hangar.' });
                    } else {
                        // Iterate through each item in the hangar array and add it to the embed
                        hangar.forEach(item => {
                            // console.log(item);
                            const itemInfo = `Quantity: ${item.quantity}` + (item.weight ? ` | Weight: ${item.weight}kg` : '') +
                            ` | Value: ${item.sell_price ? (item.sell_price * item.quantity) : (item.price * .8 * item.quantity)} C` + 
                            `\nDescription: ${item.description}`;
                            
                            hangarEmbed.addFields({ name: `${item.name}`, value: itemInfo });
                        });
                    }

                await interaction.editReply({ embeds: [hangarEmbed] });
                break;
            default:
                await interaction.editReply('Unknown command, please try again!');
                break;
        }
    }
};