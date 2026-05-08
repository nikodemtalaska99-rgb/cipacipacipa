const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'ban',
    category: 'admin',
    description: 'Banuje użytkownika z serwera',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do banowania!')] });
        }

        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        let user;

        if (target) {
            user = target.user;
        } else if (args[0]) {
            const id = args[0].replace(/[<@!>]/g, '');
            // Try to fetch as member first
            target = await message.guild.members.fetch(id).catch(() => null);
            if (target) {
                user = target.user;
            } else {
                // Try to fetch as user if not a member (Hackban support)
                user = await message.client.users.fetch(id).catch(() => null);
            }
        }

        if (!user) return message.reply({ embeds: [UI.error('Musisz oznaczyć osobę do zbanowania lub podać jej poprawne ID!')] });

        if (target && target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({ embeds: [UI.error('Nie możesz zbanować osoby z wyższą lub równą rolą!') ] });
        }

        const reason = args.slice(1).join(' ') || 'Brak powodu';

        try {
            if (target) {
                // Send DM if they are in the server
                const dmEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setAuthor({ name: `Zostałeś zbanowany!`, iconURL: message.guild.iconURL() })
                    .addFields(
                        { name: '🌐 Serwer', value: message.guild.name, inline: true },
                        { name: '📝 Powód', value: reason, inline: true }
                    )
                    .setFooter({ text: `Jeśli uważasz, że to błąd, skontaktuj się z administracją.` });

                await target.send({ embeds: [dmEmbed] }).catch(() => {});
                await target.ban({ reason });
            } else {
                // Ban user who is not in the server
                await message.guild.bans.create(user.id, { reason });
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Banicja`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '\u200b', value: `👤 **× Zbanowano:** ${user.tag}`, inline: false },
                    { name: '\u200b', value: `📝 **× Powód:** ${reason}`, inline: false },
                    { name: '\u200b', value: `🛡️ **× Moderator:** ${message.author}`, inline: false }
                )
                .setFooter({ text: `Użytkownik został trwale usunięty z serwera.` });

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            message.reply({ embeds: [UI.error('Nie mogę zbanować tego użytkownika. Sprawdź moją rolę!')] });
        }
    },
};
