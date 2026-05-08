const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');

module.exports = {
    name: 'nuke',
    category: 'admin',
    description: 'Resetuje kanał – usuwa i tworzy go od nowa z tymi samymi ustawieniami',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'nuke', PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do nukeowania kanałów!')] });
        }

        const channel = message.mentions.channels.first() || message.channel;

        // Confirmation check
        const confirmEmbed = new EmbedBuilder()
            .setColor('#ff4444')
            .setAuthor({ name: `' .gg/geekland × Nuke`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
            .setDescription(`\`\`\`💣 Potwierdzenie\`\`\`\n> ⚠️ **×** Czy na pewno chcesz zresetować kanał ${channel}?\n> 🗑️ **×** Zostaną usunięte **wszystkie** wiadomości!\n\n> Odpowiedz \`tak\` aby potwierdzić lub \`nie\` aby anulować.`)
            .setFooter({ text: 'Masz 15 sekund na odpowiedź.' });

        const confirmMsg = await message.reply({ embeds: [confirmEmbed] });

        const filter = m => m.author.id === message.author.id && ['tak', 'nie'].includes(m.content.toLowerCase());
        let collected;

        try {
            collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
        } catch {
            await confirmMsg.edit({ embeds: [UI.error('Czas minął. Nuke anulowany.')] });
            return;
        }

        const response = collected.first().content.toLowerCase();
        collected.first().delete().catch(() => {});

        if (response === 'nie') {
            return confirmMsg.edit({ embeds: [UI.error('Nuke anulowany.')] });
        }

        try {
            // Clone channel with same settings
            const position = channel.position;
            const newChannel = await channel.clone({
                reason: `Nuke wykonany przez ${message.author.tag}`,
            });

            // Move cloned channel to same position
            await newChannel.setPosition(position).catch(() => {});

            // Delete original channel
            await channel.delete(`Nuke wykonany przez ${message.author.tag}`);

            // Send success embed in the new channel
            const nukeEmbed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Nuke`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
                .setDescription(`\`\`\`💣 Kanał został zresetowany!\`\`\`\n> 🧹 **× Kanał:** ${newChannel}\n> 👤 **× Moderator:** ${message.author}\n> ✅ **×** Wszystkie wiadomości usunięte.`)
                .setFooter({ text: `' .gg/geekland · ${new Date().toLocaleDateString('pl-PL')}` });

            await newChannel.send({ embeds: [nukeEmbed] });

        } catch (error) {
            console.error('[NUKE]', error);
            message.channel.send({ embeds: [UI.error('Nie udało się wykonać nuke. Sprawdź uprawnienia bota!')] }).catch(() => {});
        }
    },
};
