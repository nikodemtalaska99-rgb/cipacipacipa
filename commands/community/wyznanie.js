const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/Database');
const UI = require('../../utils/UI');
const config = require('../../config.json');

module.exports = {
    name: 'wyznanie',
    aliases: ['confess', 'w'],
    description: 'Wysyła anonimowe wyznanie na specjalny kanał',
    async execute(message, args) {
        // Natychmiast usuwa wiadomość wywołującą
        if (message.deletable) {
            await message.delete().catch(() => {});
        }

        const confessionText = args.join(' ');

        if (!confessionText) {
            const errorMsg = await message.channel.send({ embeds: [UI.error('Musisz wpisać treść swojego wyznania! Przykład: `!wyznanie Kocham ten serwer`')] });
            return setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
        }

        const channelId = await db.get(`confession_channel_${message.guild.id}`);
        if (!channelId) {
            const errorMsg = await message.channel.send({ embeds: [UI.error('Kanał wyznań nie został jeszcze skonfigurowany przez Administrację! (`?setup_wyznania`)')] });
            return setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
        }

        const confessionChannel = message.guild.channels.cache.get(channelId);
        if (!confessionChannel) {
            const errorMsg = await message.channel.send({ embeds: [UI.error('Skonfigurowany kanał wyznań nie istnieje. Ustaw go ponownie!')] });
            return setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors?.primary || '#ffb6c1')
            .setDescription(`\`\`\`💬 ' .gg/geekland × Anonimowe Wyznanie\`\`\`\n> 🤫 **×** ${confessionText}`)
            .setFooter({ text: 'To wyznanie jest w 100% anonimowe. Nikt nie wie, kto je napisał!' });

        await confessionChannel.send({ embeds: [embed] });
        
        // Poinformowanie uzytkownika o wyslaniu
        const successMsg = await message.channel.send({ embeds: [UI.success('Twoje wyznanie zostało pomyślnie wysłane!')] });
        setTimeout(() => successMsg.delete().catch(() => {}), 3000);
    }
};
