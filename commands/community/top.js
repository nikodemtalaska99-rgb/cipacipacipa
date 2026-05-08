const { EmbedBuilder } = require('discord.js');
const Levels = require('../../utils/Levels');
const UI = require('../../utils/UI');

module.exports = {
    name: 'top',
    aliases: ['leaderboard', 'ranking'],
    description: 'Zobacz ranking najaktywniejszych osób',
    async execute(message, args) {
        const top = Levels.getLeaderboard(10);
        if (top.length === 0) return message.reply({ embeds: [UI.error('Brak danych w rankingu!')] });

        const allUsers = Levels.getLeaderboard(9999);
        const userRank = allUsers.findIndex(u => u.id === message.author.id) + 1;
        const totalPlayers = allUsers.length;

        let description = '';
        for (let i = 0; i < top.length; i++) {
            const user = message.guild.members.cache.get(top[i].id) || await message.guild.members.fetch(top[i].id).catch(() => null);
            const name = user ? `${user.displayName}` : 'Nieznany';
            const medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : `\`${i + 1}.\``));
            
            description += `${medal} ${user ? user : name} — **${top[i].level} poziom** \`(${top[i].xp} XP)\` \n`;
        }

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setDescription(`\`\`\`🏆 ' .gg/geekland × Ranking Poziomów\`\`\`\n` +
                description +
                `\n**🎯 Twoje statystyki:**\n` +
                `> Zmierzając na szczyt zajmujesz **#${userRank || '?'}** miejsce na **${totalPlayers}** graczy.`
            )
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};
