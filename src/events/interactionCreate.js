const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

async function sendInputModal(interaction, title) {
    const modal = new ModalBuilder()
        .setCustomId('userInputModal')
        .setTitle(title);

    const input = new TextInputBuilder()
        .setCustomId('userInput')
        .setLabel("Enter your ship's name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(input);
    modal.addComponents(firstActionRow);

    interaction.showModal(modal).catch(console.error);
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                // Deferring the reply
                await interaction.deferReply({ content: "Processing your command..." });
                // Executing the command
                await command.execute(interaction);
                // You can use interaction.editReply or interaction.followUp here if needed
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
                await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
            }
        } else if (interaction.isSelectMenu()) {
            // Handle the select menu interaction
            try {
                if (interaction.customId === 'select-destination') {
                    const selectedLocation = interaction.values[0];
                    await interaction.update({ content: `Traveling to ${selectedLocation}...`, components: [] });
                }
                // Add more cases for different select menus as needed
            } catch (error) {
                console.error(`Error in select menu interaction`);
                console.error(error);
                await interaction.editReply({ content: 'There was an error processing your selection.', ephemeral: true });
            }
        } else if (interaction.isModalSubmit()) {
            // Handle the modal submission
            switch (interaction.customId) {
                case 'userInputModal':
                    const userInput = interaction.fields.getTextInputValue('userInput');
                    const playerId = interaction.member.id;
                    interaction.client.userInputs = interaction.client.userInputs || {};
                    interaction.client.userInputs[playerId] = interaction.client.userInputs[playerId] || {};
                    interaction.client.userInputs[playerId]['userInput'] = userInput;
                    await interaction.editReply({ content: `You entered: ${userInput}`, ephemeral: true });
                    break;
                default:
                    console.warn(`Unhandled modal submit: ${interaction.customId}`);
            } 
        } else if (interaction.isButton()) {
            if (interaction.customId === 'nameShipButton') {
                // Show the modal when the button is clicked
                await sendInputModal(interaction, "Name your ship");
            }
        }
    },
};
