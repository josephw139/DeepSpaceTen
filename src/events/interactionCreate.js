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
                // Acknowledge the interaction
                await interaction.reply({content: `Processing...`, ephemeral: true});

                // Executing the command
                await command.execute(interaction);
            } catch (error) {
                console.log(error);
                await interaction.channel.send({ content: 'The bot did not crash, just hiccuped, please try again.', ephemeral: true });
                return;
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
                await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
            }
        }
    },
};
