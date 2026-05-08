const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'setup_rekrutacja',
    category: 'admin',
    description: 'Konfiguracja panelu rekrutacji do administracji',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland × Rekrutacja do Ekipy`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32AF80D52D&' })
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(
                `\`\`\`💥 SZUKAMY OSÓB DO EKIPY!\`\`\`\n` +
                `> Jeśli chcesz pomóc w rozwoju naszego serwera i masz odpowiednią dozę cierpliwości oraz czasu – to miejsce dla Ciebie.\n\n` +
                `**🛠️ Wymagania podstawowe:**\n` +
                `• Minimum 16 lat (lub dojrzałość emocjonalna)\n` +
                `• Sprawny mikrofon i komunikatywność\n` +
                `• Wysoka aktywność na czacie (min. 500 wiadomości/tydzień)\n` +
                `• Umiejętność pracy w stresujących sytuacjach\n\n` +
                `**📝 Jak aplikować?**\n` +
                `Kliknij przycisk poniżej, aby otworzyć formularz zgłoszeniowy. Twoje podanie zostanie wysłane bezpośrednio do Zarządu.`
            )
            .setFooter({ text: `Zarząd zastrzega sobie prawo do kontaktu z wybranymi osobami.` });

        const button = new ButtonBuilder()
            .setCustomId('recruit_start')
            .setLabel('Aplikuj do Administracji')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(button);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        if (message.deletable) await message.delete().catch(() => { });
    },
};
