const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'giveaway',
    aliases: ['gw'],
    category: 'admin',
    description: 'ZarzÄ…dzanie konkursami na serwerze',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnieńńĹ„ do zarzÄ…dzania konkursami!')] });
        }

        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'start') {
            const timeStr = args[1];
            const winnersCount = parseInt(args[2]);
            const prize = args.slice(3).join(' ');

            if (!timeStr || isNaN(winnersCount) || !prize) {
                return message.reply({ embeds: [UI.error('**UĹĽycie:** `,gw start [czas] [wygrani] [nagroda]`\n*PrzykĹ‚ad: `,gw start 1h 1 Nitro Classic*')] });
            }

            const ms = parseTime(timeStr);
            if (!ms) return message.reply({ embeds: [UI.error('Niepoprawny format czasu! UĹĽyj np. 10m, 2h, 1d.')] });

            const endTime = Date.now() + ms;

            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `\`\`\`' .gg/geekland Ă— Nowy Konkurs\`\`\``, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
                .setThumbnail('https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&') // Optional: generic gift icon
                .setDescription(`\`\`\`đźŽ KONKURS: ${prize.toUpperCase()}\`\`\`\n` +
                    `> đźŹ† **Ă— Wygrani:** \`${winnersCount}\`\n` +
                    `> đź‘¤ **Ă— Host:** ${message.author}\n` +
                    `> âŹ° **Ă— Koniec:** <t:${Math.floor(endTime / 1000)}:R> (<t:${Math.floor(endTime / 1000)}:f>)\n\n` +
                    `Kliknij w reakcjÄ™ đźŽ‰ poniĹĽej, aby doĹ‚Ä…czyÄ‡!`)
                .setFooter({ text: `Konkurs zakoĹ„czÄ… siÄ™ automatycznie.` });

            const gwMsg = await message.channel.send({ embeds: [embed] });
            await gwMsg.react('đźŽ‰');
            await message.delete().catch(() => { });

            // Simple timeout for giveaway ending
            setTimeout(async () => {
                try {
                    const fetchedMsg = await message.channel.messages.fetch(gwMsg.id).catch(() => null);
                    if (!fetchedMsg) return;

                    const reaction = fetchedMsg.reactions.cache.get('đźŽ‰');
                    if (!reaction) return;

                    const users = await reaction.users.fetch();
                    const validUsers = users.filter(u => !u.bot).map(u => u.id);

                    if (validUsers.length === 0) {
                        const noWinnerEmbed = new EmbedBuilder()
                            .setColor('#ff9e9e')
                            .setAuthor({ name: `' .gg/geekland Ă— Konkurs ZakoĹ„czony`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
                            .setDescription(`\`\`\`đźŽ KONKURS: ${prize.toUpperCase()}\`\`\`\n` +
                                `> âťŚ **Ă— Wynik:** Brak uczestnikĂłw.\n` +
                                `> đź‘¤ **Ă— Host:** ${message.author}`)
                            .setFooter({ text: `Konkurs dobiegĹ‚ koĹ„ca.` });

                        return fetchedMsg.edit({ embeds: [noWinnerEmbed] });
                    }

                    // Randomly select winners
                    const winners = [];
                    for (let i = 0; i < Math.min(winnersCount, validUsers.length); i++) {
                        const randomIndex = Math.floor(Math.random() * validUsers.length);
                        winners.push(validUsers.splice(randomIndex, 1)[0]);
                    }

                    const winnersMentions = winners.map(id => `<@${id}>`).join(', ');

                    const endEmbed = new EmbedBuilder()
                        .setColor('#a3d9a5')
                        .setAuthor({ name: `' .gg/geekland Ă— Konkurs ZakoĹ„czony`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
                        .setDescription(`\`\`\`đźŽ KONKURS: ${prize.toUpperCase()}\`\`\`\n` +
                            `> đźŹ† **Ă— ZwyciÄ™zcy:** ${winnersMentions}\n` +
                            `> đź‘¤ **Ă— Host:** ${message.author}\n` +
                            `> âŹ° **Ă— ZakoĹ„czono:** <t:${Math.floor(Date.now() / 1000)}:R>`)
                        .setFooter({ text: `Gratulacje dla zwyciÄ™zcĂłw!` });

                    await fetchedMsg.edit({ embeds: [endEmbed] });
                    await message.channel.send({
                        content: `đźŽŠ Gratulacje ${winnersMentions}! WygraĹ‚eĹ›(aĹ›) **${prize}**!`,
                        reply: { messageReference: fetchedMsg.id }
                    });
                } catch (err) {
                    console.error('BĹ‚Ä…d podczas koĹ„czenia giveaway:', err);
                }
            }, ms);
        } else {
            const helpEmbed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland Ă— Pomoc Giveaway`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
                .setDescription(`Aby rozpoczÄ…Ä‡ konkurs, uĹĽyj poniĹĽszej komendy:\n\n` +
                    `> \`,gw start [czas] [wygrani] [nagroda]\`\n\n` +
                    `**PrzykĹ‚ady:**\n` +
                    `â€˘ \`,gw start 10m 1 Nitro\`\n` +
                    `â€˘ \`,gw start 1h 2 Rola Premium\`\n` +
                    `â€˘ \`,gw start 1d 5 Kody do gry\``);

            message.reply({ embeds: [helpEmbed] });
        }
    }
};

function parseTime(str) {
    if (!str) return null;
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const type = match[2];

    switch (type) {
        case 's': return value * 1000;
        case 'm': return value * 60000;
        case 'h': return value * 3600000;
        case 'd': return value * 86400000;
        default: return null;
    }
}
