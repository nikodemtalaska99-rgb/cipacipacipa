const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

class UI {
    static base() {
        return new EmbedBuilder()
            .setColor(config.colors.primary);
    }

    static success(content) {
        return this.base()
            .setColor(config.colors.success || '#a3d9a5')
            .setDescription(`\`\`\`✅ ' .gg/geekland × Sukces\`\`\`\n> 🌸 **×** ${content}`);
    }

    static error(content) {
        return this.base()
            .setColor(config.colors.error || '#ff9e9e')
            .setDescription(`\`\`\`❌ ' .gg/geekland × Wystąpił błąd\`\`\`\n> 🩸 **×** ${content}`);
    }

    static noPermission(content = 'Tylko Zarząd może zarządzać ekipą!') {
        return new EmbedBuilder()
            .setColor(config.colors.error || '#ff9e9e')
            .setDescription(`\`\`\`🛡️ ' .gg/geekland × Brak uprawnień\`\`\`\n> ⛔ **×** ${content}`);
    }

    static createDashboard(title, fields, thumbnail = null) {
        const embed = this.base()
            .setAuthor({ name: title.toLowerCase() })
            .setThumbnail(thumbnail);

        fields.forEach(f => {
            embed.addFields({
                name: `\u200b`,
                value: `**${f.name.toLowerCase()}**\n${f.value}`,
                inline: f.inline !== undefined ? f.inline : true
            });
        });

        return embed;
    }

    static createUserProfile(user, fields, footer = null) {
        const embed = this.base()
            .setAuthor({ name: `${user.username} · information`, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }));

        fields.forEach(f => {
            embed.addFields({
                name: `\u200b`,
                value: `**${f.name.toLowerCase()}**\n${f.value}`,
                inline: f.inline !== undefined ? f.inline : true
            });
        });

        if (footer) embed.setFooter({ text: footer });

        return embed;
    }

    static isManagement(member) {
        const managementRoles = config.managementRoles || ["Zarząd", "Owner", "Admin"];
        return member.roles.cache.some(r => managementRoles.includes(r.name) || managementRoles.includes(r.id)) || 
               member.id === config.ownerId || 
               member.id === member.guild.ownerId;
    }
}

module.exports = UI;
