const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ComponentType } = require('discord.js');
const UI = require('../../utils/UI');
const config = require('../../config.json');

module.exports = {
    name: 'help',
    category: 'util',
    aliases: ['h', 'pomoc'],
    description: 'szczegółowa pomoc systemowa',
    async execute(message, args) {
        const client = message.client;
        
        const menuCategories = [
            { id: 'main', label: 'Główny panel', description: 'Wróć do strony głównej', emoji: '🏠' },
            { id: 'admin', label: 'Administracja & Ekipa', description: 'Zarządzanie serwerem', emoji: '🛠️' },
            { id: 'levels', label: 'Poziomy', description: 'System doświadczenia', emoji: '⭐' },
            { id: 'rp', label: 'Roleplay Interakcje', description: 'Kiss, Hug, Slap i inne', emoji: '🎭' },
            { id: 'nsfw', label: 'Strefa 18+', description: 'Komendy tylko dla dorosłych', emoji: '🔞' },
            { id: 'social', label: 'Związki', description: 'Shipy, małżeństwa', emoji: '❤️' },
            { id: 'util', label: 'Narzędzia', description: 'Przydatne komendy', emoji: '📌' },
            { id: 'stats', label: 'Statystyki', description: 'Zaproszenia, aktywność', emoji: '📈' },
            { id: 'security', label: 'Zabezpieczenia', description: 'Systemy pasywne', emoji: '🛡️' }
        ];

        const createMainEmbed = () => {
            return new EmbedBuilder()
                .setColor('#ffb6c1')
                .setDescription(`\`\`\`📚 ' .gg/geekland × system pomocy\`\`\`\n\n` +
                    `> Witaj w systemie pomocy!\n` +
                    `> Wybierz interesującą Cię kategorię z menu poniżej,\n` +
                    `> aby zobaczyć listę dostępnych komend.\n\n` +
                    `\n\n**⬇️ Wybierz opcję z menu poniżej:**`)
                .setFooter({ text: `.gg/geekland • system pomocy` });
        };

        const createCategoryEmbed = (categoryId) => {
            const category = menuCategories.find(c => c.id === categoryId);
            if (!category || category.id === 'main') return createMainEmbed();

            const baseEmbed = () => new EmbedBuilder()
                .setColor('#ffb6c1')
                .setFooter({ text: `.gg/geekland • system pomocy` })
                .setThumbnail(config.brandingThumbnail);

            if (category.id === 'nsfw') {
                return baseEmbed()
                    .setDescription(`\`\`\`🔞 ' .gg/geekland × Strefa 18+ (NSFW)\`\`\`\n` + `
> ⚠️ **Uwaga:** Poniższe komendy działają tylko na kanałach oznaczonych jako NSFW.

**🔞 Interakcje 18+**
> \`${config.prefix}sex <@user>\` — Interakcja seksualna
> \`${config.prefix}anal <@user>\` — Interakcja analna
                    `);
            }

            if (category.id === 'rp') {
                return baseEmbed()
                    .setDescription(`\`\`\`🎭 ' .gg/geekland × Roleplay Interakcje\`\`\`\n` + `
**✨ Interakcje Premium**
> \`${config.prefix}kiss <@user>\` — Daje buziaka
> \`${config.prefix}hug <@user>\` — Przytula
> \`${config.prefix}pat <@user>\` — Głaszcze
> \`${config.prefix}slap <@user>\` — Uderza
> \`${config.prefix}cuddle <@user>\` — Wtula się
                    `);
            }

            if (category.id === 'admin') {
                return baseEmbed()
                    .setDescription(`\`\`\`🛠️ ' .gg/geekland × Administracja & Ekipa\`\`\`\n` + `
**🛡️ Moderacja Graczy**
> \`${config.prefix}ban <@user> [powód]\` — Banuje użytkownika
> \`${config.prefix}kick <@user> [powód]\` — Wyrzuca użytkownika
> \`${config.prefix}clear <ilość>\` — Usuwa X wiadomości
> \`${config.prefix}mute <@user> <czas> [powód]\` — Wycisza (np. 10m)
> \`${config.prefix}warn <@user> [powód]\` — Daje ostrzeżenie
> \`${config.prefix}jail <@user> [powód]\` — Przenosi do aresztu

**👮 Zarządzanie Ekipą (Staff)**
> \`${config.prefix}sinfo <@user>\` — Aktywność admina
> \`${config.prefix}smsgs\` — Twoje dzienne wiadomości

**⚙️ Konfiguracja (Setupy)**
> \`${config.prefix}antylink\` — System ochrony przed linkami
> \`${config.prefix}setup_rekrutacja\` — Panel rekrutacji
> \`${config.prefix}setup_selfie\` — Panel weryfikacji selfie
> \`${config.prefix}setup_selfrole\` — Panel wyboru ról
                    `);
            }

            if (category.id === 'levels') {
                return baseEmbed()
                    .setDescription(`\`\`\`⭐ ' .gg/geekland × System Poziomów\`\`\`\n` + `
**👤 Dla Graczy**
> \`${config.prefix}level [@user]\` — Pokazuje kartę poziomu
> \`${config.prefix}design <1/2>\` — Zmienia styl nicku (♡ lub ✩)
> \`${config.prefix}topstats levels\` - Ranking poziomów

**👑 Dla Administracji**
> \`${config.prefix}setlevel <@user> <poziom>\` — Ustawia konkretny lvl
> \`${config.prefix}resetlevel <@user>\` — Zeruje postęp gracza
                    `);
            }

            if (category.id === 'social') {
                return baseEmbed()
                    .setDescription(`\`\`\`❤️ ' .gg/geekland × Związki\`\`\`\n` + `
> \`${config.prefix}slub <@user>\` — Oświadcza się osobie
> \`${config.prefix}zwiazek [@user]\` — Info o małżeństwie
> \`${config.prefix}rozwod\` — Kończy związek
> \`${config.prefix}ship <@user1> [@user2]\` — Dopasowanie miłosne
                    `);
            }

            if (category.id === 'stats') {
                return baseEmbed()
                    .setDescription(`\`\`\`📈 ' .gg/geekland × Statystyki\`\`\`\n` + `
> \`${config.prefix}topstats voice\` — Ranking czasu na VC
> \`${config.prefix}topstats messages\` — Ranking wiadomości
> \`${config.prefix}invites [@user]\` — Ilość zaproszeń
> \`${config.prefix}stats\` — Statystyki serwera
                    `);
            }

            if (category.id === 'util') {
                return baseEmbed()
                    .setDescription(`\`\`\`📌 ' .gg/geekland × Narzędzia\`\`\`\n` + `
> \`${config.prefix}afk [powód]\` — Status ZARAZ WRACAM
> \`${config.prefix}rem <czas> <tekst>\` — Przypomnienie
> \`${config.prefix}profil\` — Twój serwerowy profil
> \`${config.prefix}snipe\` — Ostatnia usunięta wiadomość
                    `);
            }

            if (category.id === 'security') {
                return baseEmbed()
                    .setDescription(`\`\`\`🛡️ ' .gg/geekland × Systemy Pasywne\`\`\`\n` + `
🔗 **Anty-Link** — Usuwa reklamy (Konf: \`!antylink\`)
🚨 **Anti-Leak** — Blokuje wycieki danych
📷 **Selfie** — Weryfikacja zdjęć (Konf: \`!setup_selfie\`)
📜 **Logi** — Zapis zdarzeń serwerowych
                    `);
            }

            return createMainEmbed();
        };

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('📚 Wybierz kategorię komend...')
            .addOptions(menuCategories.map(cat => ({
                label: cat.label,
                description: cat.description,
                value: cat.id,
                emoji: cat.emoji
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const initialReply = await message.reply({
            embeds: [createMainEmbed()],
            components: [row]
        });

        const collector = initialReply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
            filter: i => i.user.id === message.author.id
        });

        collector.on('collect', async interaction => {
            const selected = interaction.values[0];
            await interaction.update({
                embeds: [createCategoryEmbed(selected)],
                components: [row]
            });
        });

        collector.on('end', () => {
            initialReply.edit({ components: [] }).catch(() => { });
        });
    },
};
