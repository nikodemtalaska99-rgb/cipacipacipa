const { EmbedBuilder } = require('discord.js');
const Invites = require('../../utils/Invites');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'invites',
    aliases: ['inv'],
    description: 'Sprawdź swoje statystyki zaproszeń',
    async execute(message, args) {
        const targetUser = message.mentions.users.first() || 
                           message.client.users.cache.get(args[0]) || 
                           message.author;
        
        const stats = Invites.getUser(targetUser.id);
        const levelData = Levels.getUser(targetUser.id);
        const total = stats.joins - stats.leaves + stats.bonus;
        const symbol = levelData.design === 2 ? '♡' : '✩';

        // Fetch active codes
        const guildInvites = await message.guild.invites.fetch().catch(() => new Map());
        const userInvites = guildInvites.filter(i => i.inviter && i.inviter.id === targetUser.id);
        
        let activeCodesText = 'Brak aktywnych zaproszeń';
        if (userInvites.size > 0) {
            activeCodesText = userInvites.map(inv => `**${inv.code}** (\`${inv.uses}\` użyć)`).join(', ');
        }

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: `${targetUser.username} [${levelData.level}${symbol}] — Zaproszenia`, 
                iconURL: targetUser.displayAvatarURL({ dynamic: true }) 
            })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(
                `📊 **Statystyki**\n` +
                `┃ ➥ ✅ **Dołączenia:** \`${stats.joins}\`\n` +
                `┃ ➥ ❌ **Odejścia:** \`${stats.leaves}\`\n` +
                `┃ ➥ 🚫 **Fałszywe:** \`${stats.fakes}\`\n` +
                `┃ ➥ ⚖️ **Bonusowe:** \`${stats.bonus}\`\n\n` +
                `┃ ✔️ Masz **${total}** zaproszeń!\n\n` +
                `🔗 **Aktywne kody**\n` +
                `┃ ➥ ${activeCodesText}`
            )
            .setFooter({ 
                text: `.gg/geekland • Invite Tracker • Dziś o ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`, 
                iconURL: message.guild.iconURL() 
            });

        return message.reply({ embeds: [embed] });
    },
};
