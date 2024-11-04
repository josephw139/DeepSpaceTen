const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Fleet } = require('../../modules/ships/base.js');
const sectorsData = require('../../database/locations.js');
const db = require('../../database/db.js');
const schedule = require('node-schedule');
const { getPlayerData } = require('../../database/playerFuncs.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('databank')
        .setDescription('U.C.S. Information Center')
        .addStringOption(option =>
            option.setName("lore")
                .setDescription("Query the local databanks")
                .setRequired(true)
                .addChoices(
                    { name: 'Ships', value: 'ships' },
                    { name: 'United Confederacy of Systems', value: 'ucs' },
                    { name: 'Sectors', value: 'sectors' },
                    { name: 'Systems', value: 'systems' },
                    { name: 'Locations', value: 'locations' },
                ))
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Enter a search term for Sectors, Systems, or Locations (optional)')
                .setRequired(false))
            ,
    async execute(interaction) {
		const playerId = interaction.member.id;
		const channel = interaction.channel;
        const lore = interaction.options.getString('lore');
        const searchTerm = interaction.options.getString('search') || null;
        
        const playerData = getPlayerData(playerId);
        const discoveredSectors = playerData.discoveries.discoveredSectors;
        const discoveredSystems = playerData.discoveries.discoveredSystems;
        

        if (typeof playerData === 'string') {
            interaction.editReply(playerData);
        }


        if (lore === 'ships') {
            const shipsEmbed = new EmbedBuilder()
                    .setTitle('U.C.S. Information Center')
                    .setDescription(`Welcome to Frontier Space!\n
                    There are many different types of ships, built by various governments and corps.
                    `)
                    .addFields(
                        { name: 'Different types of ships', value: `__Mining Ships__ - Specially equipped to harvest minerals and gases from asteroids, barren plants, and other mineral rich sites.\n
                        __Science Vessels__ - Equipped with state of the art labs and faciltiies, able to research anomalies, lost civilzations, relics, and more.\n
                        __Scouts__ - Using highly specialized Abacus Retracers and warp facilities, these ships are the fastest for exploring the unknown regions of space.\n
                        __Freighters__ - Large cargo ships designed to carry enormous amounts of materials to their destinations.\n`},
                    );
            interaction.editReply({ embeds: [shipsEmbed] });
        } else if (lore === 'ucs') {
            const ucsEmbed = new EmbedBuilder()
                    .setTitle('U.C.S. Information Center')
                    .setDescription(`Welcome to Frontier Space!\n
                    The United Confederacy of Systems is blah blah blah
                    `)
                    .addFields(
                        { name: 'Lore', value: `Lore moment`},
                    );
            interaction.editReply({ embeds: [ucsEmbed] });
        } else if (lore === 'sectors') {
            const sectorsEmbed = new EmbedBuilder()
                .setTitle('Frontier Space')
                .setDescription(`This region of Frontier Space has been divided into 9 sectors.\n\nOrion Station, the established jump-point from the Outer Rim, is in the Southeast Sector, in Argus' Beacon.`);
            
            if (searchTerm) {
                // If a search term is provided, find and display only the matching sector
                const sectorInfo = sectorsData.sectors[searchTerm];
                if (sectorInfo && discoveredSectors.includes(searchTerm)) {
                    let discoveredSystemsInSector = sectorInfo.systems
                        .filter(system => discoveredSystems.includes(system.name))
                        .map(system => system.name)
                        .join(", ");
                    if (!discoveredSystemsInSector) discoveredSystemsInSector = "No systems discovered yet.";
                    let sectorValue = `${sectorInfo.description || "A sector waiting to be explored."}\n\nDiscovered Systems: ${discoveredSystemsInSector}`;
                    sectorsEmbed.addFields({ name: searchTerm, value: sectorValue });
                } else {
                    sectorsEmbed.addFields({ name: "Search Result", value: `No discovered sector matches the search term: "${searchTerm}"` });
                }
            } else {
                // No search term provided, display all discovered sectors as before
                Object.entries(sectorsData.sectors).forEach(([sectorName, sectorInfo]) => {
                    if (discoveredSectors.includes(sectorName)) {
                        let discoveredSystemsInSector = sectorInfo.systems
                            .filter(system => discoveredSystems.includes(system.name))
                            .map(system => system.name)
                            .join(", ");
                        if (!discoveredSystemsInSector) discoveredSystemsInSector = "No systems discovered yet.";
                        let sectorValue = `${sectorInfo.description || "A sector waiting to be explored."}\n\nDiscovered Systems: ${discoveredSystemsInSector}`;
                        sectorsEmbed.addFields({ name: sectorName, value: sectorValue });
                    }
                });
            }
        
            await interaction.editReply({ embeds: [sectorsEmbed] });
        } else if (lore === 'systems') {
            const systemsEmbed = new EmbedBuilder()
                .setTitle('Frontier Space')
                .setDescription(`There are a multitude of Systems throughout Frontier Space. Below are currently discovered systems.`);
        
            if (searchTerm) {
                // If a search term is provided, find and display only the matching system
                let found = false;
                discoveredSectors.forEach(sectorName => {
                    const sector = sectorsData.sectors[sectorName];
                    if (sector && sector.systems) {
                        const system = sector.systems.find(system => system.name.toLowerCase() === searchTerm.toLowerCase());
                        if (system && discoveredSystems.includes(system.name)) {
                            found = true;
                            let systemDescription = system.description || "A system waiting to be explored.";
                            const locationDescriptions = system.locations.map(location => `*${location.name}`);
                            systemsEmbed.addFields({ name: `${system.name} - ${sectorName} Sector`, value: `${systemDescription}\n\n${location.name}` });
                        }

                        /* 
                            const locationDescriptions = system.locations.map(location => `*${location.name}:* ${location.description}
                            Activities: ${location.activities.join(', ')}`).join("\n\n");
                            systemsEmbed.addFields({ name: `${system.name} - ${sectorName} Sector`, value: `${systemDescription}\n\n${locationDescriptions}` });
                        */
                    }
                });
                if (!found) {
                    systemsEmbed.addFields({ name: "Search Result", value: `No discovered system matches the search term: "${searchTerm}"` });
                }
            } else {
                // No search term provided, display all discovered systems as before
                discoveredSectors.forEach(sectorName => {
                    const sector = sectorsData.sectors[sectorName];
                    if (sector && sector.systems) {
                        sector.systems.forEach(system => {
                            if (discoveredSystems.includes(system.name)) {
                                let systemDescription = system.description || "A system waiting to be explored.";
                                const locationDescriptions = system.locations.map(location => `*${location.name}:* ${location.description}
                                `).join("\n\n");
                                systemsEmbed.addFields({ name: `${system.name} - ${sectorName} Sector`, value: `${systemDescription}\n\n${locationDescriptions}` });
                            }

                            /*
                                const locationDescriptions = system.locations.map(location => `*${location.name}:* ${location.description}
                                Activities: ${location.activities.join(', ')}`).join("\n\n");
                                systemsEmbed.addFields({ name: `${system.name} - ${sectorName} Sector`, value: `${systemDescription}\n\n${locationDescriptions}` });
                            */
                        });
                    }
                });
            }
        
            await interaction.editReply({ embeds: [systemsEmbed] });
        } else if (lore === 'locations') {
            const locationsEmbed = new EmbedBuilder()
                .setTitle('Planets, Moons, Space Stations and more')
                .setDescription(`Below are currently discovered locations of note in the Frontier:`);
            
            discoveredSystems.forEach(systemName => {
                // Use Object.entries to also get the sector names
                Object.entries(sectorsData.sectors).forEach(([sectorName, sector]) => {
                    // Find the system within the sector
                    const system = sector.systems.find(system => system.name === systemName);
                    if (system) {
                        // Filter locations if a search term is provided, else use all locations
                        const locations = system.locations.filter(location => !searchTerm || location.name.toLowerCase().includes(searchTerm.toLowerCase()));
                
                        if (locations.length > 0) {
                            locations.forEach(location => {
                                let locationInfo = `${location.description}\n*Activities: ${location.activities.join(', ')}*`;
                                locationsEmbed.addFields({ name: `${location.name} (${sectorName} Sector, ${system.name} System)`, value: locationInfo });
                            });
                        }
                    }
                });
            });
            
            if (locationsEmbed.data.fields.length === 0) {
                // No locations found or no locations match the search term
                locationsEmbed.setDescription(`No locations found${searchTerm ? ` matching "${searchTerm}"` : ''}.`);
            }
            
            await interaction.editReply({ embeds: [locationsEmbed] });
        }

        // Obligatory reply
		// await interaction.reply({content: `Use the /databank command to learn more about the Frontier`, ephemeral: true});
    },
};