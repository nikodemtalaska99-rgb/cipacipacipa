const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/Database');
const UI = require('../../utils/UI');

module.exports = {
    name: 'rep',
    aliases: ['+rep', 'reputacja', 'reps'],
    category: 'util',
    description: 'Zarządzanie punktami reputacji (+1 punkt co 8 godzin)',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const COOLDOWN_HOURS = 8;
        const cooldownTime = COOLDOWN_HOURS * 60 * 60 * 1000;

        const formatTime = (ms) => {
            const hours = Math.floor(ms / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((ms % (1000 * 60)) / 1000);
            return `\`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}\``;
        };

        // Jeśli nie podano celu - pokaż statystyki reputacji autora
        if (!target && !args[0]) {
            const userRep = await db.get(`rep_${message.author.id}`) || 0;
            const lastRep = await db.get(`rep_cooldown_${message.author.id}`);
            const timeLeft = lastRep ? (lastRep + cooldownTime) - Date.now() : 0;

            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Twoja Reputacja`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setThumbnail('https://i.imgur.com/8N4N89N.png')
                .setDescription(
                    `> ✨ **× Twoje punkty:** \`${userRep}\` repów\n` +
                    `> ⏳ **× Status limitu:** ${timeLeft > 0 ? `Możesz nadać za **${formatTime(timeLeft)}**` : '✅ Możesz już kogoś docenić!'}`
                )
                .setFooter({ text: `Użyj !rep <@user>, aby nadać punkt komuś innemu. (Limit: co 8h)` });

            return message.reply({ embeds: [embed] });
        }

        // Jeśli podano cel, ale to autor
        if (target && target.id === message.author.id) {
            const userRep = await db.get(`rep_${message.author.id}`) || 0;
            return message.reply({ embeds: [UI.error(`Masz obecnie **${userRep}** punktów reputacji. Nie możesz ich nadawać samemu sobie!`)] });
        }

        // Jeśli podano cel - spróbuj nadać reputację
        if (target) {
            if (target.user.bot) return message.reply({ embeds: [UI.error('Boty nie zbierają reputacji.')] });

            const lastRep = await db.get(`rep_cooldown_${message.author.id}`);
            const timeLeft = lastRep ? (lastRep + cooldownTime) - Date.now() : 0;

            if (lastRep !== null && timeLeft > 0) {
                return message.reply({ embeds: [UI.error(`Wykorzystałeś już swój limit!\n> Ponownie będziesz mógł nadać punkt za: **${formatTime(timeLeft)}**`)] });
            }

            // Nadaj reputację
            await db.add(`rep_${target.id}`, 1);
            await db.set(`rep_cooldown_${message.author.id}`, Date.now());

            const newTotal = await db.get(`rep_${target.id}`);

            const embed = new EmbedBuilder()
                .setColor('#a3d9a5')
                .setAuthor({ name: `' .gg/geekland × Przyznano Reputację`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
                .setDescription(
                    `\`\`\`⭐ +1 PUNKT REPUTACJI\`\`\`\n` +
                    `> 👤 **× Odbiorca:** ${target}\n` +
                    `> 📊 **× Nowy wynik:** \`${newTotal}\` repów\n` +
                    `> 📝 **× Od:** ${message.author}`
                )
                .setFooter({ text: `Kolejny punkt możesz nadać za ${COOLDOWN_HOURS}h.` });

            return message.reply({ embeds: [embed] });
        }

        return message.reply({ embeds: [UI.error('Nie znaleziono takiego użytkownika!')] });
    }
};
