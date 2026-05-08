const { Events, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const Levels = require('../../utils/Levels');
const moment = require('moment');
const db = require('../../utils/Database');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // ── Auto-Role ─────────────────────────────────────────────────────
        const autoroles = await db.get(`autoroles_${member.guild.id}`) || [];
        if (autoroles.length > 0) {
            for (const roleId of autoroles) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) await member.roles.add(role).catch(() => {});
            }
        }

        // ── Join Log ──────────────────────────────────────────────────────
        const logsChannel = member.guild.channels.cache.get(config.memberLogsChannelId);
        if (!logsChannel) return;

        const userData = Levels.getUser(member.id);
        const symbol = userData.design === 2 ? '♡' : '✩';
        const createdOn = moment(member.user.createdAt).fromNow();

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: `' .gg/geekland × Użytkownik Dołączył`, 
                iconURL: 'https://i.imgur.com/8N4N89N.png' 
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { 
                    name: `👤 **Informacje o Użytkowniku**`, 
                    value: `> **Użytkownik:** ${member} \`[${userData.level} ${symbol}]\`\n` +
                           `> **Tag:** \`${member.user.tag}\`\n` +
                           `> **ID:** \`${member.id}\``, 
                    inline: false 
                },
                { 
                    name: `📅 **Data Stworzenia Konta**`, 
                    value: `> <t:${Math.floor(member.user.createdTimestamp / 1000)}:R> (\`${createdOn}\`)`, 
                    inline: false 
                },
                { 
                    name: `📊 **Statystyki Serwerowe**`, 
                    value: `> **Pozycja:** #${member.guild.memberCount}\n` +
                           `> **Wspólne Serwery:** N/A`, 
                    inline: false 
                }
            )
            .setFooter({ text: `Dołączył o • ${new Date().toLocaleTimeString('pl-PL')}` })
            .setTimestamp();

        await logsChannel.send({ embeds: [embed] });
    },
};
