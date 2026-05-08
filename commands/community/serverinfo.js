const { EmbedBuilder, ChannelType } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'serverinfo',
    description: 'Wyświetla statystyki serwera.',
    aliases: ['si', 'guildinfo'],
    async execute(message) {
        const { guild } = message;

        const channels = guild.channels.cache;
        const members = guild.members.cache;

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .setDescription(`\`\`\`📊 ' .gg/geekland × Informacje o Serwerze\`\`\`\n` +
                `> 🏠 **× Nazwa:** \`${guild.name}\`\n` +
                `> 🆔 **× ID:** \`${guild.id}\`\n` +
                `> 👑 **× Właściciel:** <@${guild.ownerId}>\n` +
                `> 📅 **× Powstanie:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>\n\n` +
                `** Statystyki Użytkowników**\n` +
                `> 👥 **× Razem:** \`${guild.memberCount}\` osób\n` +
                `> 👤 **× Ludzie:** \`${members.filter(m => !m.user.bot).size}\` osób\n` +
                `> 🤖 **× Boty:** \`${members.filter(m => m.user.bot).size}\` botów\n\n` +
                `** Statystyki Kanałów**\n` +
                `> 💬 **× Tekstowe:** \`${channels.filter(c => c.type === ChannelType.GuildText).size}\` kanałów\n` +
                `> 🔊 **× Głosowe:** \`${channels.filter(c => c.type === ChannelType.GuildVoice).size}\` kanałów\n` +
                `> 📁 **× Kategorie:** \`${channels.filter(c => c.type === ChannelType.GuildCategory).size}\` kategorii\n\n` +
                `** Pozostałe**\n` +
                `> 💎 **× Boosty:** \`${guild.premiumSubscriptionCount || 0}\` (Poziom ${guild.premiumTier})\n` +
                `> 🎭 **× Role:** \`${guild.roles.cache.size}\` ról\n` +
                `> ✨ **× Emoji:** \`${guild.emojis.cache.size}\` emotek`
            );

        await message.reply({ embeds: [embed] });
    },
};
