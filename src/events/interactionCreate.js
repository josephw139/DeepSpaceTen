const { Events } = require('discord.js');

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
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
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
                // Optionally, reply to the user if there's an error
                await interaction.reply({ content: 'There was an error processing your selection.', ephemeral: true });
            }
        }
        // Handle other types of interactions as needed
    },
};


