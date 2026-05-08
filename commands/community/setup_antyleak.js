const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'setup_antyleak',
    category: 'admin',
    description: 'Konfiguracja panelu AntiLeak',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setDescription(`\`\`\`🛡️ ' .gg/geekland × AntiLeak System\`\`\`\n\n` +
                `> Jeśli ktoś wrzuca Twoje **zdjęcie twarzy, nazwisko**\n` +
                `> lub **inne dane osobowe** — zgłoś to tutaj.\n\n` +
                `> Po zaakceptowaniu zgłoszenia przez moderację,\n` +
                `> bot będzie **automatycznie usuwał** te dane\n\n` +
                `**Jak to działa:**\n` +
                `> \`\`📸\`\` **Zbanuj Twarz** — podaj link do zdjęcia, bot będzie rozpoznawał i usuwał to zdjęcie (i podobne)\n` +
                `> \`\`📝\`\` **Zbanuj Nazwisko** — podaj frazę, bot będzie filtrował wiadomości tekstowe i warianty\n` +
                `> \`\`🔒\`\` **Zbanuj Inne** — telefon, adres, konto IG, itd.\n\n` +
                `**⬇️ Wybierz opcję z menu poniżej:**`)
            .setFooter({ text: `.gg/geekland • Bezpieczeństwo` });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('antyleak_setup_menu')
            .setPlaceholder('🛡️ Wybierz co chcesz ochronić...')
            .addOptions([
                {
                    label: 'Zbanuj Twarz',
                    description: 'Zgłoś zdjęcie do automatycznego usuwania',
                    value: 'ban_face',
                    emoji: '📸'
                },
                {
                    label: 'Zbanuj Nazwisko',
                    description: 'Zgłoś dane tekstowe do filtrowania',
                    value: 'ban_name',
                    emoji: '📝'
                },
                {
                    label: 'Zbanuj Inne',
                    description: 'Zgłoś inne dane (IG, telefon itp.)',
                    value: 'ban_other',
                    emoji: '🔒'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        if (message.deletable) await message.delete().catch(() => { });
    },
};
