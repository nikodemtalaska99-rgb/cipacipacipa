const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'setup_ticket',
    aliases: ['setupticket', 'ticketpanel'],
    description: 'WysyĹ‚a panel do tworzenia ticketĂłw',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnieńńĹ„ do uĹĽycia tej komendy!')] });
        }

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland Ă— Centrum Pomocy`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setDescription(`\`\`\`đź’¬ Potrzebujesz pomocy administracji?\`\`\`\n> đźŽ« Kliknij przycisk poniĹĽej, aby otworzyÄ‡ prywatny kanaĹ‚ z AdministracjÄ….\n> âš ď¸Ź PamiÄ™taj, aby nie otwieraÄ‡ ticketĂłw bez powodu!`)
            .setFooter({ text: 'System TicketĂłw' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_open')
                .setLabel('OtwĂłrz Ticket')
                .setEmoji('đźŽ«')
                .setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => { });
    }
};
