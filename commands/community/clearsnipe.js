const UI = require('../../utils/UI');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'clearsnipe',
    category: 'community',
    aliases: ['cs'],
    description: 'Czyści pamięć usuniętych wiadomości na kanale',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do czyszczenia snipa!')] });
        }

        message.client.snipes.delete(message.channel.id);
        await message.reply({ embeds: [UI.success('Pomyślnie wyczyszczono pamięć usuniętych wiadomości na tym kanale.')] });
    },
};
