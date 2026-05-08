const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const StaffMessages = require('../../utils/StaffMessages');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');
const config = require('../../config.json');

module.exports = {
    name: 'smsgs',
    category: 'admin',
    description: 'Sprawdza dzisiejszą ilość wiadomości członka ekipy',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'smsgs')) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        
        if (!UI.isManagement(target)) {
            return message.reply({ embeds: [UI.error('Ten użytkownik nie jest członkiem ekipy!')] });
        }

        const count = await StaffMessages.getDailyCount(target.id);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ name: `' .gg/geekland × Dzienna Aktywność`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setThumbnail(config.brandingThumbnail)
            .setDescription(`\`\`\`📊 Dzisiejsza aktywność\`\`\`\n` +
                `> 🛡️ **× Członek ekipy:** ${target}\n` +
                `> 💬 **× Wiadomości dziś:** \`${count}\``);

        await message.reply({ embeds: [embed] });
    },
};
