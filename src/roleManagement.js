// roleManagement.js

const { Guild, GuildMember } = require('discord.js');

/**
 * Updates ship roles for a user based on the active ship's capabilities.
 * @param {GuildMember} member The guild member whose roles need to be updated.
 * @param {Array} capabilities The capabilities of the active ship.
 */
async function updateShipRoles(member, capabilities, removeAll) {

    if (removeAll) {
        const rolesToRemove = ['1301935269305389178', '1301935368664518737', '1301935428160716861', '1301935457436831754'];
        await member.roles.remove(rolesToRemove);
    }
    

    // Add new roles based on the ship's capabilities
    capabilities.forEach(async (capability) => {
        switch (capability) {
            case 'Mining':
                await member.roles.add('1301935269305389178');
                break;
            case 'Research':
                await member.roles.add('1301935368664518737');
                break;
            case 'Light Scan':
                await member.roles.add('1301935428160716861');
                break;
            case 'Deep Scan':
                await member.roles.add('1301935457436831754');
                break;
        }
    });
}

module.exports = { updateShipRoles };
