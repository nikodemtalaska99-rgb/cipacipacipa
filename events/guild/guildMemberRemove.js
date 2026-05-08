const { Events, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const Levels = require('../../utils/Levels');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const logsChannel = member.guild.channels.cache.get(config.memberLogsChannelId);
        if (!logsChannel) return;

        const userData = Levels.getUser(member.id);
        const symbol = userData.design === 2 ? '♡' : '✩';
        const roleCount = member.roles.cache.size - 1; // Exclude @everyone

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: `' .gg/geekland × Użytkownik Opuścił Serwer`, 
                iconURL: 'https://i.imgur.com/8N4N89N.png' 
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { 
                    name: `👤 **Informacje o Użytkowniku**`, 
                    value: `> **Użytkownik:** ${member.user.tag}\n` +
                           `> **ID:** \`${member.id}\` \`[${userData.level} ${symbol}]\``, 
                    inline: false 
                },
                { 
                    name: `🏷️ **Posiadane Role (${roleCount})**`, 
                    value: member.roles.cache.size > 1 
                        ? member.roles.cache.filter(r => r.id !== member.guild.id).map(r => `${r}`).join(', ').substring(0, 1024) 
                        : '> *Brak ról*', 
                    inline: false 
                },
                { 
                    name: `📊 **Statystyki Serwerowe**`, 
                    value: `> **Aktualna liczba osób:** ${member.guild.memberCount}`, 
                    inline: false 
                }
            )
            .setFooter({ text: `Opuścił o • ${new Date().toLocaleTimeString('pl-PL')}` })
            .setTimestamp();

        await logsChannel.send({ embeds: [embed] });
    },
};
