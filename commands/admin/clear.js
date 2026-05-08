const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');

module.exports = {
    name: 'clear',
    aliases: ['purge', 'c'],
    category: 'admin',
    description: 'Masowo usuwa wiadomości z kanału',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'clear', PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do usuwania wiadomości!')] });
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply({ embeds: [UI.error('Podaj liczbę od 1 do 100!')] });
        }

        try {
            const deleted = await message.channel.bulkDelete(amount, true);
            
            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Czyszczenie`, iconURL: 'https://i.imgur.com/K6Yv79O.png' })
                .setDescription(`\`\`\`🧹 Sukces!\`\`\`\n> 🗑️ **× Usunięto:** \`${deleted.size}\` wiadomości\n> 👤 **× Moderator:** ${message.author}`);

            const msg = await message.channel.send({ embeds: [embed] });
            setTimeout(() => msg.delete().catch(() => {}), 5000);

        } catch (error) {
            message.reply({ embeds: [UI.error('Nie mogę usunąć wiadomości starszych niż 14 dni.')] });
        }
    },
};
