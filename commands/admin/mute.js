const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');

module.exports = {
    name: 'mute',
    category: 'admin',
    description: 'Wycisza użytkownika (timeout)',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'mute', PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do wyciszania użytkowników!')] });
        }

        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        
        if (!target && args[0]) {
            const id = args[0].replace(/[<@!>]/g, '');
            target = await message.guild.members.fetch(id).catch(() => null);
        }

        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć użytkownika lub podać jego ID!')] });

        const durationStr = args[1] || '10m';
        const reason = args.slice(2).join(' ') || 'Brak powodu';

        const timeMatches = durationStr.match(/^(\d+)([smhd])$/);
        if (!timeMatches) return message.reply({ embeds: [UI.error('Niepoprawny format czasu! Przykład: 10m, 1h, 1d')] });

        const value = parseInt(timeMatches[1]);
        const unit = timeMatches[2];
        
        let duration = value * 60 * 1000; // default minutes
        if (unit === 's') duration = value * 1000;
        if (unit === 'h') duration = value * 60 * 60 * 1000;
        if (unit === 'd') duration = value * 24 * 60 * 60 * 1000;

        try {
            await target.timeout(duration, reason);
            
            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({ name: `' .gg/geekland × Wyciszenie`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '\u200b', value: `👤 **× Wyciszono:** ${target}`, inline: false },
                    { name: '\u200b', value: `⏱️ **× Czas:** ${durationStr}`, inline: false },
                    { name: '\u200b', value: `📝 **× Powód:** ${reason}`, inline: false }
                )
                .setFooter({ text: `Użytkownik stracił możliwość pisania i rozmawiania.` });

            await message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [UI.error('Nie mogę wyciszyć tego użytkownika.')] });
        }
    },
};
