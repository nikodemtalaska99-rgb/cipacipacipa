const db = require('./Database');
const config = require('../config.json');

class Permissions {
    /**
     * Get list of role IDs allowed for a command
     */
    static async getAllowedRoles(commandName) {
        return await db.get(`cmd_perms_${commandName}`) || [];
    }

    /**
     * Toggle a role's access to a command
     */
    static async toggleRole(commandName, roleId) {
        let roles = await this.getAllowedRoles(commandName);
        let added = false;

        if (roles.includes(roleId)) {
            roles = roles.filter(id => id !== roleId);
        } else {
            roles.push(roleId);
            added = true;
        }

        await db.set(`cmd_perms_${commandName}`, roles);
        return added;
    }

    /**
     * Centralized permission check
     */
    static async canExecute(member, commandName, requiredPermission = null) {
        // 1. Bot/Server Owner always allowed
        if (member.id === config.ownerId || member.id === member.guild.ownerId) return true;

        // 2. Management roles always allowed
        const managementRoles = config.managementRoles || ["Zarząd", "Owner", "Admin"];
        if (member.roles.cache.some(r => managementRoles.includes(r.name) || managementRoles.includes(r.id))) return true;

        // 3. Custom roles allowed for this command
        const allowedRoles = await this.getAllowedRoles(commandName);
        if (member.roles.cache.some(r => allowedRoles.includes(r.id))) return true;

        // 4. Default Discord permission check
        if (requiredPermission && member.permissions.has(requiredPermission)) return true;

        return false;
    }
}

module.exports = Permissions;
