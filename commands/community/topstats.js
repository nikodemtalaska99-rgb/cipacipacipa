const { EmbedBuilder } = require('discord.js');
const Levels = require('../../utils/Levels');
const db = require('../../utils/Database');
const config = require('../../config.json');

module.exports = {
    name: 'topstats',
    aliases: ['top', 'leaderboard'],
    description: 'Pokazuje rankingi serwerowe',
    category: 'community',
    async execute(message, args) {
        const type = args[0]?.toLowerCase();

        if (type === 'levels' || type === 'poziomy') {
            const top = Levels.getLeaderboard(10);
            
            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Ranking Poziomów`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
                .setThumbnail(config.brandingThumbnail)
                .setDescription(top.map((u, i) => `**${i + 1}.** <@${u.id}> — \`Lvl ${u.level}\` (\`${u.xp} XP\`)`).join('\n') || 'Brak danych.');

            return message.reply({ embeds: [embed] });
        }

        if (type === 'messages' || type === 'wiadomosci') {
            // This requires fetching all users from db or having a pre-built list
            // For now, let's show a placeholder or handle it if we have the data
            return message.reply({ embeds: [new EmbedBuilder().setColor('#ffb6c1').setDescription('❌ Ranking wiadomości jest obecnie przetwarzany.')] });
        }

        const helpEmbed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland × Rankingi`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setDescription(`**Dostępne rankingi:**\n` +
                `> \`${config.prefix}topstats levels\` — Ranking poziomów\n` +
                `> \`${config.prefix}topstats messages\` — Ranking wiadomości\n` +
                `> \`${config.prefix}topstats voice\` — Ranking czasu na kanałach głosowych`);

        return message.reply({ embeds: [helpEmbed] });
    },
};
