const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'kick',
    category: 'admin',
    description: 'Wyrzuca użytkownika z serwera',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do wyrzucania osób!')] });
        }

        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        
        if (!target && args[0]) {
            const id = args[0].replace(/[<@!>]/g, '');
            target = await message.guild.members.fetch(id).catch(() => null);
        }

        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć osobę do wyrzucenia lub podać jej ID!')] });

        if (target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({ embeds: [UI.error('Nie możesz wyrzucić osoby z wyższą lub równą rolą!')] });
        }

        const reason = args.slice(1).join(' ') || 'Brak powodu';

        try {
            await target.kick(reason);

            const successEmbed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Wyrzucenie`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '\u200b', value: `👤 **× Wyrzucono:** ${target.user.tag}`, inline: false },
                    { name: '\u200b', value: `📝 **× Powód:** ${reason}`, inline: false },
                    { name: '\u200b', value: `🛡️ **× Moderator:** ${message.author}`, inline: false }
                )
                .setFooter({ text: `Użytkownik został usunięty z serwera, ale może wrócić.` });

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            message.reply({ embeds: [UI.error('Nie mogę wyrzucić tego użytkownika.')] });
        }
    },
};
