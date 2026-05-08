const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const StaffWarns = require('../../utils/StaffWarns');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');
const config = require('../../config.json');

module.exports = {
    name: 'scheck',
    category: 'admin',
    description: 'Sprawdza warny członka ekipy',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'scheck')) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć członka ekipy!')] });

        const warns = StaffWarns.getWarns()[target.id] || [];
        
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ name: `' .gg/geekland × Lista Warnów`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setThumbnail(config.brandingThumbnail)
            .setTitle(`Warny użytkownika ${target.user.tag}`)
            .setDescription(warns.length > 0 
                ? warns.map((w, i) => `**${i + 1}.** \`${w.reason}\` - <t:${Math.floor(w.timestamp / 1000)}:R>`).join('\n')
                : 'Ten użytkownik nie posiada żadnych warnów.');

        await message.reply({ embeds: [embed] });
    },
};
