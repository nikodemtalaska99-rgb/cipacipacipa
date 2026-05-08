const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const StaffWarns = require('../../utils/StaffWarns');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');
const config = require('../../config.json');

module.exports = {
    name: 'swarn',
    category: 'admin',
    description: 'Nadaje warna członkowi ekipy',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'swarn')) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć członka ekipy!')] });

        const reason = args.slice(1).join(' ') || 'Brak powodu';
        const totalWarns = StaffWarns.addWarn(target.id, reason);

        const embed = new EmbedBuilder()
            .setColor('#ff9e9e') // Czerwony/Error color
            .setAuthor({ name: `' .gg/geekland × Ostrzeżenie Ekipy`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setThumbnail(config.brandingThumbnail)
            .setDescription(`\`\`\`⚠️ Ostrzeżenie Ekipy\`\`\`\n` +
                `> 🛡️ **× Użytkownik:** ${target}\n` +
                `> 📝 **× Powód:** \`${reason}\`\n` +
                `> 📊 **× Suma warnów:** \`${totalWarns}/3\``);

        await message.reply({ embeds: [embed] });
    },
};
