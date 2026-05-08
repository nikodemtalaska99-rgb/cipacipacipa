const { EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const config = require('../../config.json');

function parseTime(timeStr) {
    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    const val = parseInt(match[1]);
    const unit = match[2];
    if (unit === 's') return val * 1000;
    if (unit === 'm') return val * 60 * 1000;
    if (unit === 'h') return val * 60 * 60 * 1000;
    if (unit === 'd') return val * 24 * 60 * 60 * 1000;
    return null;
}

module.exports = {
    name: 'remindme',
    aliases: ['rem', 'przypomnij'],
    description: 'Ustawia przypomnienie na określony czas',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply({ embeds: [UI.error('Musisz podać czas! Przykład: `!rem 10m Wyjmij pizzę`')] });
        }

        const time = parseTime(args[0]);
        if (!time) {
            return message.reply({ embeds: [UI.error('Niepoprawny format czasu! Przykład: `10m`, `1h`, `1d`')] });
        }

        if (time > 14 * 24 * 60 * 60 * 1000) {
            return message.reply({ embeds: [UI.error('Przypomnienie nie może być dłuższe niż 14 dni!')] });
        }

        const reason = args.slice(1).join(' ') || 'Brak powodu (przypomnienie)';

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary || '#ffb6c1')
            .setDescription(`\`\`\`⏰ ' .gg/geekland × Przypomnienie\`\`\`\n> 🔔 **×** Ustawiono przypomnienie!\n> ⏱️ **× Za:** \`${args[0]}\`\n> 📝 **× Treść:** \`${reason}\``);

        await message.reply({ embeds: [embed] });

        setTimeout(async () => {
            const remindEmbed = new EmbedBuilder()
                .setColor(config.colors.primary || '#ffb6c1')
                .setDescription(`\`\`\`⏰ ' .gg/geekland × Przypomnienie!\`\`\`\n> 🔔 **×** ${message.author}, prosiłeś abym Ci o czymś przypomniał:\n> 📝 **× Treść:** \`${reason}\``);

            try {
                await message.author.send({ embeds: [remindEmbed] });
            } catch (error) {
                // Jeśli użytkownik ma zablokowane DM, wyślij na kanał
                await message.channel.send({ content: `<@${message.author.id}>`, embeds: [remindEmbed] });
            }
        }, time);
    }
};
