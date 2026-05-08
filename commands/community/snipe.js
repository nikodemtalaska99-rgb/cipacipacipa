const UI = require('../../utils/UI');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'snipe',
    category: 'community',
    aliases: ['s'],
    description: 'Pokazuje ostatnią usuniętą wiadomość na kanale',
    async execute(message, args) {
        const snipe = message.client.snipes.get(message.channel.id);

        if (!snipe) return message.reply({ embeds: [UI.error('Nie ma żadnej wiadomości do podejrzenia!')] });

        const userData = Levels.getUser(snipe.author.id);
        const symbol = userData.design === 2 ? '♡' : '✩';
        const ago = moment(snipe.timestamp).fromNow();

        const embed = new EmbedBuilder()
            .setColor('#262626')
            .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(snipe.content || '*Wiadomość nie zawierała tekstu*')
            .setFooter({ text: `Wysłano ${ago} • [${userData.level} ${symbol}]` });

        if (snipe.image) embed.setImage(snipe.image);

        await message.reply({ embeds: [embed] });
    },
};
