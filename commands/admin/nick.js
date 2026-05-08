const UI = require('../../utils/UI');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'nick',
    category: 'admin',
    description: 'Zmienia pseudonim gracza',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do zarządzania pseudonimami!')] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć użytkownika!')] });

        const newNick = args.slice(1).join(' ');
        if (!newNick) return message.reply({ embeds: [UI.error('Musisz podać nowy nick!')] });

        try {
            await target.setNickname(newNick);
            
            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setDescription(`✅ Pomyślnie zmieniono nick użytkownikowi ${target} na **${newNick}**`);

            await message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply({ embeds: [UI.error('Nie mogę zmienić nicku temu użytkownikowi (prawdopodobnie ma wyższą rangę).')] });
        }
    },
};
