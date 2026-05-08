const { PermissionsBitField } = require('discord.js');
const db = require('../../utils/Database');
const UI = require('../../utils/UI');

module.exports = {
    name: 'setup_wyznania',
    category: 'admin',
    description: 'Konfiguruje kanał do anonimowych wyznań',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.noPermission('Musisz być Administratorem, aby ustawić kanał wyznań!')] });
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        if (!channel) {
            return message.reply({ embeds: [UI.error('Musisz oznaczyć kanał! Przykład: `!setup_wyznania #wyznania`')] });
        }

        await db.set(`confession_channel_${message.guild.id}`, channel.id);

        message.reply({ embeds: [UI.success(`Pomyślnie ustawiono kanał wyznań na ${channel}!`)] });
    }
};
