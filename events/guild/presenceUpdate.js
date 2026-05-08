const { Events } = require('discord.js');
const db = require('../../utils/Database');

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        if (!newPresence || !newPresence.guild || !newPresence.member) return;
        if (newPresence.member.user.bot) return;

        const guild = newPresence.guild;
        const member = newPresence.member;

        const data = await db.get(`vanity_${guild.id}`);
        if (!data || !data.link || !data.roleId) return;

        const role = guild.roles.cache.get(data.roleId);
        if (!role) return;

        const activities = newPresence.activities;
        const customStatus = activities.find(a => a.type === 4); // Type 4 is Custom Status

        const hasLink = customStatus && customStatus.state && customStatus.state.includes(data.link);
        const hasRole = member.roles.cache.has(data.roleId);

        try {
            if (hasLink && !hasRole) {
                console.log(`[VANITY] Giving role to ${member.user.tag}`);
                await member.roles.add(role, 'Vanity reward status');
            } else if (!hasLink && hasRole) {
                console.log(`[VANITY] Removing role from ${member.user.tag}`);
                await member.roles.remove(role, 'Vanity link removed from status');
            }
        } catch (error) {
            // Silently fail if hierarchy is wrong or other issues
            // console.error(`Error handling vanity for ${member.user.tag}:`, error);
        }
    },
};
