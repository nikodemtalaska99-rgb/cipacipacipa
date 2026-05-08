const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const StaffMessages = require('../../utils/StaffMessages');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');
const config = require('../../config.json');

module.exports = {
    name: 'sinfo',
    category: 'admin',
    description: 'Pokazuje statystyki tygodniowe członka ekipy',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'sinfo')) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        
        if (!UI.isManagement(target)) {
            return message.reply({ embeds: [UI.error('Ten użytkownik nie jest członkiem ekipy!')] });
        }

        const stats = await StaffMessages.getStaffStats(target.id);
        const norm = 500; // Weekly norm

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ name: `' .gg/geekland × Statystyki Ekipy`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setThumbnail(config.brandingThumbnail)
            .setTitle(`Statystyki: ${target.user.tag}`)
            .addFields(
                { name: '💬 Wiadomości (Tydzień)', value: `\`${stats.weeklyCount} / ${norm}\``, inline: true },
                { name: '📊 Procent normy', value: `\`${Math.floor((stats.weeklyCount / norm) * 100)}%\``, inline: true },
                { name: '📅 Ostatnia aktywność', value: stats.lastMessage ? `<t:${Math.floor(stats.lastMessage / 1000)}:R>` : 'Brak', inline: false }
            );

        await message.reply({ embeds: [embed] });
    },
};
