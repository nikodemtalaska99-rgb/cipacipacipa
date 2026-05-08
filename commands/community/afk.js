const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/Database');
const config = require('../../config.json');

module.exports = {
    name: 'afk',
    aliases: ['zarazwracam', 'zw'],
    description: 'Ustawia twój status AFK',
    async execute(message, args) {
        const reason = args.join(' ') || 'AFK';

        await db.set(`afk_${message.author.id}`, {
            reason: reason,
            timestamp: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor(config.colors?.success || '#ffb6c1')
            .setDescription(`> ✅ · Pomyślnie ustawiono status AFK: \`${reason}\``);

        await message.reply({ embeds: [embed] });
    }
};
