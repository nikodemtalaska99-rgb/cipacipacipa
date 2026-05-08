const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'setup_selfrole',
    category: 'community',
    description: 'Konfiguracja panelu ról (Selfrole)',
    async execute(message, args) {
        const imagePath = path.join(__dirname, '../../assets/selfrole_thumbnail.png');
        const file = new AttachmentBuilder(imagePath);

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setTitle('🎭 \' .gg/geekland × Personalizacja Profilu')
            .setDescription(
                `> 🎨 × Zbuduj swoją tożsamość na serwerze!\n` +
                `> Wybierz opcje z rozwijanych menu poniżej,\n` +
                `> aby otrzymać odpowiednie rangi.\n\n` +
                `📦 **Instrukcja:**\n` +
                `> \`\`🔸\`\` Rozwiń wybrane menu i kliknij opcję.\n` +
                `> \`\`🔸\`\` Wybór nowej opcji automatycznie nadpisze starą.\n` +
                `> \`\`🔸\`\` Aby **usunąć** rolę (np. kolor), kliknij menu, odznacz swoją opcję i kliknij na puste miejsce obok.\n\n` +
                `⚙️ *Rangi aktualizują się natychmiastowo.*`
            )
            .setThumbnail('attachment://selfrole_thumbnail.png');

        const rowColor = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selfrole_color')
                .setPlaceholder('🎨 Wybierz swój Kolorek')
                .addOptions([
                    { label: 'Czerwony', value: 'color_red', emoji: '🔴' },
                    { label: 'Niebieski', value: 'color_blue', emoji: '🔵' },
                    { label: 'Zielony', value: 'color_green', emoji: '🟢' },
                    { label: 'Żółty', value: 'color_yellow', emoji: '🟡' },
                    { label: 'Fioletowy', value: 'color_purple', emoji: '🟣' }
                ])
        );

        const rowGender = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selfrole_gender')
                .setPlaceholder('👤 Wybierz swoją Płeć')
                .addOptions([
                    { label: 'Chłopak', value: 'gender_male', emoji: '👦' },
                    { label: 'Dziewczyna', value: 'gender_female', emoji: '👧' }
                ])
        );

        const rowAge = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selfrole_age')
                .setPlaceholder('📅 Wybierz swój Wiek')
                .addOptions([
                    { label: '13-15 lat', value: 'age_13_15', emoji: '👶' },
                    { label: '16-18 lat', value: 'age_16_18', emoji: '🧒' },
                    { label: '18+ lat', value: 'age_18_plus', emoji: '👨' }
                ])
        );

        const rowStatus = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selfrole_status')
                .setPlaceholder('❤️ Wybierz Status Związku')
                .addOptions([
                    { label: 'Wolny/a', value: 'status_single', emoji: '🕊️' },
                    { label: 'Zajęty/a', value: 'status_taken', emoji: '💖' },
                    { label: 'Zakochany/a', value: 'status_in_love', emoji: '😻' },
                    { label: 'To skomplikowane', value: 'status_complicated', emoji: '🧩' }
                ])
        );

        await message.channel.send({
            embeds: [embed],
            components: [rowColor, rowGender, rowAge, rowStatus],
            files: [file]
        });

        if (message.deletable) await message.delete().catch(() => { });
    },
};
