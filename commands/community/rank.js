const { EmbedBuilder } = require('discord.js');
const Levels = require('../../utils/Levels');
const UI = require('../../utils/UI');

module.exports = {
    name: 'rank',
    aliases: ['level', 'lvl'],
    description: 'Sprawdź swój poziom i doświadczenie',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.member;
        const stats = Levels.getUser(target.id);
        const nextLevelXP = Levels.getXPForLevel(stats.level);

        // Calculate cumulative XP
        let totalXP = 0;
        for (let i = 0; i < stats.level; i++) {
            totalXP += Levels.getXPForLevel(i);
        }
        totalXP += stats.xp;

        // Calculate rank
        const allUsers = Levels.getLeaderboard(9999);
        const userRank = allUsers.findIndex(u => u.id === target.id) + 1;
        const totalPlayers = allUsers.length;

        const progress = Math.floor((stats.xp / nextLevelXP) * 10);
        const bar = '🟢'.repeat(progress) + '⚪'.repeat(10 - progress);

        const symbol = stats.design === 2 ? '♡' : '✩';

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setDescription(`\`\`\`⭐ ' .gg/geekland × Karta Poziomu\`\`\`\n` + 
                `> 👤 **× Gracz:** ${target} \`[${stats.level} ${symbol}]\`\n` +
                `> 🏆 **× Poziom:** \`${stats.level}\`\n` +
                `> 📊 **× Doświadczenie:** \`${stats.xp} / ${nextLevelXP} XP\`\n` +
                `> 🌍 **× Ranking Serwerowy:** \`#${userRank || '?'} na ${totalPlayers}\`\n\n` +
                `📈 **Postęp do kolejnego poziomu:**\n` +
                `> ${bar}\n\n` +
                `Całkowite zdobyte XP: \`${totalXP}\``
            )
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 512 }));

        if (target.premiumSince) {
            embed.setFooter({ text: '🚀 Aktywny mnożnik 2x EXP (Booster)' });
        }

        return message.reply({ embeds: [embed] });
    },
};
