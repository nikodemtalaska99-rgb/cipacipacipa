const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const StaffWarns = require('../../utils/StaffWarns');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');
const config = require('../../config.json');

module.exports = {
    name: 'sunwarn',
    category: 'admin',
    description: 'Zdejmuje warna członkowi ekipy',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'sunwarn')) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć członka ekipy!')] });

        const removed = StaffWarns.removeWarn(target.id);

        if (!removed) {
            return message.reply({ embeds: [UI.error('Ten użytkownik nie posiada żadnych warnów do zdjęcia!')] });
        }

        const warns = StaffWarns.getWarns()[target.id] || [];
        const totalWarns = warns.length;

        const embed = new EmbedBuilder()
            .setColor(config.colors.success)
            .setAuthor({ name: `' .gg/geekland × Zdjęto Warna`, iconURL: 'https://i.imgur.com/K6Yv79O.png' })
            .setThumbnail(config.brandingThumbnail)
            .setDescription(`\`\`\`✅ Pomyślnie zdjęto warna!\`\`\`\n` +
                `> 🛡️ **× Użytkownik:** ${target}\n` +
                `> 📊 **× Aktualna suma:** \`${totalWarns}/3\``);

        await message.reply({ embeds: [embed] });
    },
};
