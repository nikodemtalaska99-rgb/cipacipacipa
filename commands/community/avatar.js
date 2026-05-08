const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'avatar',
    description: 'Wyświetla awatar użytkownika.',
    aliases: ['av', 'pfp'],
    async execute(message, args) {
        const target = message.mentions.users.first() || 
                       message.client.users.cache.get(args[0]) || 
                       message.author;

        const avatarURL = target.displayAvatarURL({ dynamic: true, size: 2048 });

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setDescription(`\`\`\`🖼️ ' .gg/geekland × Awatar Użytkownika\`\`\`\n` +
                `> 👤 **× Użytkownik:** ${target}\n` +
                `> 🆔 **× ID:** \`${target.id}\``
            )
            .setImage(avatarURL)
            .setFooter({ text: `Wywołano przez: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Link do awatara')
                    .setURL(avatarURL)
                    .setStyle(ButtonStyle.Link)
            );

        await message.reply({ embeds: [embed], components: [row] });
    },
};
