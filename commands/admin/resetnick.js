const UI = require('../../utils/UI');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'resetnick',
    category: 'admin',
    description: 'Przywraca domyślny nick użytkownika',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do zarządzania pseudonimami!')] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć użytkownika!')] });

        try {
            await target.setNickname(null);
            
            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`✅ Pomyślnie zresetowano nick użytkownikowi ${target}`);

            await message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [UI.error('Nie mogę zresetować nicku temu użytkownikowi.')] });
        }
    },
};
