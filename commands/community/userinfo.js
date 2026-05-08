const { EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'userinfo',
    description: 'Wyświetla szczegółowe informacje o użytkowniku.',
    aliases: ['ui', 'whois'],
    async execute(message, args) {
        const target = message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.member;

        const { user } = target;
        const userData = Levels.getUser(user.id);
        const designSymbol = userData.design === 2 ? '♡' : '✩';

        const roles = target.roles.cache
            .filter(r => r.id !== message.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(r => r.toString());

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(`\`\`\`👤 ' .gg/geekland × Informacje o Użytkowniku\`\`\`\n` +
                `**Główne informacje**\n` +
                `> 🏷️ **× Tag:** \`${user.tag}\`\n` +
                `> 🆔 **× ID:** \`${user.id}\`\n` +
                `> 🔗 **× Wspomnienie:** ${user}\n\n` +
                `**Ważne daty**\n` +
                `> 📡 **× Dołączenie:** <t:${Math.floor(target.joinedTimestamp / 1000)}:R>\n` +
                `> ✨ **× Utworzenie:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n\n` +
                `**Statystyki i rola**\n` +
                `> ⭐ **× Poziom:** \`${userData.level} ${designSymbol}\`\n` +
                `> 👑 **× Najwyższa rola:** ${target.roles.highest}\n` +
                `> 📁 **× Role:** ${roles.length > 0 ? (roles.length > 3 ? `${roles.slice(0, 3).join(', ')} i ${roles.length - 3} innych` : roles.join(', ')) : 'Brak'}`
            );

        await message.reply({ embeds: [embed] });
    },
};
