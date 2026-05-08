const { Events, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const Levels = require('../../utils/Levels');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (oldMessage.author?.bot || !oldMessage.guild) return;
        if (oldMessage.content === newMessage.content) return;

        const logsChannel = oldMessage.guild.channels.cache.get(config.textLogsChannelId);
        if (!logsChannel) return;

        const userData = Levels.getUser(oldMessage.author.id);
        const symbol = userData.design === 2 ? '♡' : '✩';

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: `' .gg/geekland × Edytowano Wiadomość`, 
                iconURL: 'https://i.imgur.com/vH97Z9B.png' 
            })
            .addFields(
                { 
                    name: `👤 **Użytkownik**`, 
                    value: `> ${oldMessage.author} \`[${userData.level} ${symbol}]\` (\`${oldMessage.author.id}\`)`, 
                    inline: false 
                },
                { 
                    name: `💬 **Kanał**`, 
                    value: `> ${oldMessage.channel} (\`${oldMessage.channel.id}\`)`, 
                    inline: false 
                },
                { 
                    name: `🔴 **Stara Treść**`, 
                    value: `\`\`\`${oldMessage.content || 'Brak (np. tylko załącznik)'}\`\`\``, 
                    inline: false 
                },
                { 
                    name: `🟢 **Nowa Treść**`, 
                    value: `\`\`\`${newMessage.content || 'Brak (np. tylko załącznik)'}\`\`\``, 
                    inline: false 
                }
            )
            .setFooter({ text: `Wiadomość ID: ${oldMessage.id} • ${new Date().toLocaleTimeString('pl-PL')}` })
            .setTimestamp();

        await logsChannel.send({ embeds: [embed] }).catch(console.error);
    },
};
