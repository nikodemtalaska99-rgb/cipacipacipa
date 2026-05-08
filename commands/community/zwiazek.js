const { EmbedBuilder } = require('discord.js');
const Relationship = require('../../utils/Relationship');
const UI = require('../../utils/UI');
const config = require('../../config.json');

module.exports = {
    name: 'zwiazek',
    aliases: ['marryinfo', 'małżeństwo'],
    description: 'Pokazuje informacje o Twoim związku',
    category: 'community',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.member;
        const rel = Relationship.getRelationship(target.id);

        if (!rel) {
            return message.reply({ embeds: [UI.error('Ten użytkownik nie jest obecnie w żadnym związku!')] });
        }

        const partner = message.guild.members.cache.get(rel.partnerId);
        const partnerName = partner ? partner.user.tag : 'Nieznany Użytkownik';

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland × Informacje o związku`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`\`\`\`💍 Związek: ${target.user.username} & ${partnerName.split('#')[0]}\`\`\`\n` +
                `> ❤️ **× Partner:** ${partner || partnerName}\n` +
                `> 📅 **× Razem od:** <t:${Math.floor(rel.timestamp / 1000)}:R>\n` +
                `> 💒 **× Status:** Małżeństwo`)
            .setFooter({ text: 'Miłość jest piękna!' });

        return message.reply({ embeds: [embed] });
    },
};
