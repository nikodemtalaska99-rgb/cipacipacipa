const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../../config.json');
const Levels = require('../../utils/Levels');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (message.author?.bot || !message.guild) return;

        // Snipe Storage
        message.client.snipes.set(message.channel.id, {
            content: message.content,
            author: message.author,
            timestamp: Date.now(),
            image: message.attachments.first() ? message.attachments.first().proxyURL : null
        });

        const logsChannel = message.guild.channels.cache.get(config.textLogsChannelId);
        if (!logsChannel) return;

        // Fetch Audit Logs to see who deleted the message
        let deletedBy = 'Autor';
        try {
            const fetchedLogs = await message.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MessageDelete,
            });
            const deletionLog = fetchedLogs.entries.first();
            if (deletionLog) {
                const { executor, target } = deletionLog;
                if (target.id === message.author.id && (Date.now() - deletionLog.createdAt) < 5000) {
                    const executorData = Levels.getUser(executor.id);
                    const excSymbol = executorData.design === 2 ? '♡' : '✩';
                    deletedBy = `Moderator (${executor.tag} [${executorData.level} ${excSymbol}])`;
                }
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        }

        const userData = Levels.getUser(message.author.id);
        const symbol = userData.design === 2 ? '♡' : '✩';

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: `' .gg/geekland × Usunięto Wiadomość`, 
                iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' 
            })
            .addFields(
                { 
                    name: `👤 **Informacje o Autorze**`, 
                    value: `> **Użytkownik:** ${message.author} \`[${userData.level} ${symbol}]\`\n` +
                           `> **ID:** \`${message.author.id}\`\n` +
                           `> **Usunięte przez:** \`${deletedBy}\``, 
                    inline: false 
                },
                { 
                    name: `💬 **Informacje o Kanale**`, 
                    value: `> **Kanał:** ${message.channel} (\`${message.channel.id}\`)`, 
                    inline: false 
                }
            );

        if (message.content) {
            embed.addFields({ 
                name: `📝 **Treść Wiadomości**`, 
                value: `\`\`\`${message.content}\`\`\``, 
                inline: false 
            });
        } else if (message.attachments.size === 0) {
            embed.addFields({ 
                name: `📝 **Treść Wiadomości**`, 
                value: `\`\`\`Brak treści (np. tylko załącznik lub wiadomość spoza cache)\`\`\``, 
                inline: false 
            });
        }

        if (message.attachments.size > 0) {
            embed.addFields({ 
                name: `📎 **Załączniki (${message.attachments.size})**`, 
                value: message.attachments.map(a => `> [${a.name}](${a.url})`).join('\n'), 
                inline: false 
            });

            const firstAttachment = message.attachments.first();
            if (firstAttachment.contentType?.startsWith('image/')) {
                embed.setImage(firstAttachment.proxyURL);
            }
        }

        embed.setFooter({ text: `Wiadomość ID: ${message.id} • ${new Date().toLocaleTimeString('pl-PL')}` })
             .setTimestamp();

        await logsChannel.send({ embeds: [embed] }).catch(console.error);
    },
};
