const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../../config.json');
const Levels = require('../../utils/Levels');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        // Detect boost start
        if (!oldMember.premiumSince && newMember.premiumSince) {
            const channel = newMember.guild.channels.cache.get(config.boostChannelId);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setColor('#ff73fa') // Typical boost pink
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setDescription(`\`\`\`🚀 ' .gg/geekland × Nowe Ulepszenie!\`\`\`\n` +
                    `> 🚀 × Ogromne dzięki ${newMember} za wsparcie naszego serwera!\n` +
                    `> 💎 × W nagrodę otrzymujesz dostęp do poniższych funkcji:\n` +
                    `> ✨ × **Mnożnik 2x EXP** na czatach tekstowych i głosowych!\n` +
                    `> 🎨 × Możliwość stworzenia **własnej roli**.\n\n` +
                    `**Jak stworzyć własną role:**\n` +
                    `\`\`\`\n` +
                    `,br create [kolor] [nazwa]\n` +
                    `,br [hex] lub ,br random\n` +
                    `,br rename [nazwa]\n` +
                    `,br icon [emotka/link]\n` +
                    `\`\`\``);

            await channel.send({
                content: `${newMember} właśnie ulepszył serwer! 💖`,
                embeds: [embed]
            }).catch(console.error);
        }

        // Detect role changes
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        if (addedRoles.size > 0 || removedRoles.size > 0) {
            const logsChannel = newMember.guild.channels.cache.get(config.memberLogsChannelId);
            if (!logsChannel) return;

            let executor = 'System/Nieznany';
            try {
                const fetchedLogs = await newMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.MemberRoleUpdate,
                });
                const roleLog = fetchedLogs.entries.first();
                if (roleLog && roleLog.target.id === newMember.id && (Date.now() - roleLog.createdAt) < 5000) {
                    executor = roleLog.executor;
                }
            } catch (error) {
                // Ignore errors
            }

            const userData = Levels.getUser(newMember.id);
            const symbol = userData.design === 2 ? '♡' : '✩';

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({ 
                    name: `' .gg/geekland × Aktualizacja Ról`, 
                    iconURL: 'https://i.imgur.com/8N4N89N.png' 
                })
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .addFields(
                    { 
                        name: `👤 **Użytkownik**`, 
                        value: `> ${newMember} \`[${userData.level} ${symbol}]\` (\`${newMember.id}\`)`, 
                        inline: false 
                    },
                    {
                        name: `🛠️ **Wykonawca**`,
                        value: `> ${executor}`,
                        inline: false
                    }
                );

            if (addedRoles.size > 0) {
                embed.addFields({
                    name: `✅ **Dodane Role**`,
                    value: addedRoles.map(role => `> ${role}`).join('\n'),
                    inline: false
                });
            }

            if (removedRoles.size > 0) {
                embed.addFields({
                    name: `❌ **Usunięte Role**`,
                    value: removedRoles.map(role => `> ${role}`).join('\n'),
                    inline: false
                });
            }

            embed.setFooter({ text: `Rola Zmieniona o • ${new Date().toLocaleTimeString('pl-PL')}` })
                 .setTimestamp();

            await logsChannel.send({ embeds: [embed] }).catch(console.error);
        }

        // Detect nickname changes
        if (oldMember.nickname !== newMember.nickname) {
            const logsChannel = newMember.guild.channels.cache.get(config.memberLogsChannelId);
            if (!logsChannel) return;

            let executor = 'System/Nieznany';
            try {
                const fetchedLogs = await newMember.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.MemberUpdate,
                });
                const updateLog = fetchedLogs.entries.first();
                if (updateLog && updateLog.target.id === newMember.id && (Date.now() - updateLog.createdAt) < 5000) {
                    executor = updateLog.executor;
                }
            } catch (error) {
                // Ignore errors
            }

            const userData = Levels.getUser(newMember.id);
            const symbol = userData.design === 2 ? '♡' : '✩';

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({ 
                    name: `' .gg/geekland × Zmiana Nicku`, 
                    iconURL: 'https://i.imgur.com/8N4N89N.png' 
                })
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .addFields(
                    { 
                        name: `👤 **Użytkownik**`, 
                        value: `> ${newMember} \`[${userData.level} ${symbol}]\` (\`${newMember.id}\`)`, 
                        inline: false 
                    },
                    {
                        name: `🛠️ **Wykonawca**`,
                        value: `> ${executor}`,
                        inline: false
                    },
                    {
                        name: `🔴 **Stary Nick**`,
                        value: `\`\`\`${oldMember.nickname || 'Brak (Domyślny)'}\`\`\``,
                        inline: true
                    },
                    {
                        name: `🟢 **Nowy Nick**`,
                        value: `\`\`\`${newMember.nickname || 'Brak (Domyślny)'}\`\`\``,
                        inline: true
                    }
                )
                .setFooter({ text: `Nick zmieniony o • ${new Date().toLocaleTimeString('pl-PL')}` })
                .setTimestamp();

            await logsChannel.send({ embeds: [embed] }).catch(console.error);
        }
    },
};
