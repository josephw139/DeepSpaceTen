const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');



const technologyFields = [
    { 
        name: 'Retracer Abacus [Technology]', 
        value: `The second half of mechanisms that make interstellar travel within one lifetime possible...` 
    },
    { 
        name: 'RHAILs and Clear Bounds [Technology | Intrastellar]', 
        value: `Heritage sciences defined theories of everything as interplay of space and force...` 
    },
    // Add more fields as necessary
];

function createEmbeds() {
    const embeds = [];
    let currentFields = [];

    technologyFields.forEach(field => {
        if (currentFields.reduce((acc, val) => acc + val.value.length, 0) + field.value.length > 6000) {
            embeds.push(new EmbedBuilder().setTitle('Technology').addFields(currentFields));
            currentFields = [];
        }
        currentFields.push(field);
    });

    if (currentFields.length > 0) {
        embeds.push(new EmbedBuilder().setTitle('Technology').addFields(currentFields));
    }

    return embeds;
}


async function handleTechnologyInteraction(interaction) {
    const embeds = createEmbeds();
    await sendPaginatedEmbed(interaction.channel, embeds);
    interaction.editReply({ content: 'Technology overview:', embeds: [embeds[0]] });
}

// Assuming 'handleTechnologyInteraction' is called appropriately based on the interaction

module.exports = { handleTechnologyInteraction };