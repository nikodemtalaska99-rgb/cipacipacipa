const { EmbedBuilder } = require('discord.js');
const Levels = require('../../utils/Levels');
const Relationship = require('../../utils/Relationship');
const db = require('../../utils/Database');
const config = require('../../config.json');

module.exports = {
    name: 'profil',
    description: 'Pokazuje Twój serwerowy profil',
    category: 'community',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.member;
        
        const stats = Levels.getUser(target.id);
        const relData = Relationship.getRelationship(target.id);
        const rep = await db.get(`rep_${target.id}`) || 0;
        
        let relInfo = 'Brak';
        if (relData) {
            const partner = message.guild.members.cache.get(relData.partnerId);
            const partnerTag = partner ? partner.user.username : 'Nieznany';
            relInfo = `💍 Z użytkownikiem **${partnerTag}**`;
        }

        const symbol = stats.design === 2 ? '♡' : '✩';

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland × Profil użytkownika`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(`\`\`\`👤 Informacje o: ${target.user.username}\`\`\`\n` +
                `> 📊 **× Poziom:** \`${stats.level} ${symbol}\`\n` +
                `> ✨ **× Reputacja:** \`${rep}\`\n` +
                `> 💍 **× Związek:** ${relInfo}\n` +
                `> 📅 **× Dołączył:** <t:${Math.floor(target.joinedTimestamp / 1000)}:R>`)
            .addFields(
                { name: '💰 Doświadczenie', value: `\`${stats.xp} XP\``, inline: true },
                { name: '🔥 Wiadomości', value: `\`${await db.get(`stats_msgs_${message.guild.id}_${target.id}_total`) || 0}\``, inline: true }
            )
            .setFooter({ text: `ID: ${target.id}` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};
