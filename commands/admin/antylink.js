const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const db = require('../../utils/Database');
const AutoMod = require('../../utils/AutoMod');

module.exports = {
    name: 'antylink',
    category: 'admin',
    description: 'Zarządza systemem Anti-Link',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const config = await AutoMod.getConfig(message.guild.id);
        const subCommand = args[0]?.toLowerCase();

        if (!subCommand || subCommand === 'info') {
            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Status Anti-Link`, iconURL: message.guild.iconURL() })
                .setDescription(`Aktualne ustawienia systemu ochrony przed linkami.`)
                .addFields(
                    { name: '🛡️ Status', value: config.links.enabled ? '✅ Włączony' : '❌ Wyłączony', inline: true },
                    { name: '🚫 Zaproszenia', value: config.links.blockInvites ? '✅ Blokowane' : '❌ Dozwolone', inline: true },
                    { name: '🌐 Dozwolone domeny', value: config.links.allowedDomains.length > 0 ? `\`${config.links.allowedDomains.join('`, `')}\`` : 'Brak', inline: false }
                )
                .setFooter({ text: `Użyj !antylink help, aby zobaczyć komendy.` });

            return message.reply({ embeds: [embed] });
        }

        if (subCommand === 'on') {
            config.links.enabled = true;
            await db.set(`automod_${message.guild.id}`, config);
            return message.reply({ embeds: [UI.success('System Anti-Link został **włączony**!')] });
        }

        if (subCommand === 'off') {
            config.links.enabled = false;
            await db.set(`automod_${message.guild.id}`, config);
            return message.reply({ embeds: [UI.success('System Anti-Link został **wyłączony**!')] });
        }

        if (subCommand === 'invites') {
            const state = args[1]?.toLowerCase();
            if (state === 'on') {
                config.links.blockInvites = true;
                await db.set(`automod_${message.guild.id}`, config);
                return message.reply({ embeds: [UI.success('Blokowanie zaproszeń zostało **włączone**!')] });
            } else if (state === 'off') {
                config.links.blockInvites = false;
                await db.set(`automod_${message.guild.id}`, config);
                return message.reply({ embeds: [UI.success('Blokowanie zaproszeń zostało **wyłączone**!')] });
            } else {
                return message.reply({ embeds: [UI.error('Użyj: `!antylink invites [on/off]`')] });
            }
        }

        if (subCommand === 'add') {
            const domain = args[1]?.toLowerCase();
            if (!domain) return message.reply({ embeds: [UI.error('Podaj domenę do dodania (np. `youtube.com`)!')] });
            
            if (config.links.allowedDomains.includes(domain)) {
                return message.reply({ embeds: [UI.error('Ta domena jest już na białej liście!')] });
            }

            config.links.allowedDomains.push(domain);
            await db.set(`automod_${message.guild.id}`, config);
            return message.reply({ embeds: [UI.success(`Domena \`${domain}\` została dodana do białej listy!`)] });
        }

        if (subCommand === 'remove') {
            const domain = args[1]?.toLowerCase();
            if (!domain) return message.reply({ embeds: [UI.error('Podaj domenę do usunięcia!')] });
            
            if (!config.links.allowedDomains.includes(domain)) {
                return message.reply({ embeds: [UI.error('Tej domeny nie ma na białej liście!')] });
            }

            config.links.allowedDomains = config.links.allowedDomains.filter(d => d !== domain);
            await db.set(`automod_${message.guild.id}`, config);
            return message.reply({ embeds: [UI.success(`Domena \`${domain}\` została usunięta z białej listy!`)] });
        }

        if (subCommand === 'help') {
            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setTitle('📖 Pomoc Anti-Link')
                .setDescription(`
                    > \`!antylink\` — Pokazuje aktualny status
                    > \`!antylink on/off\` — Włącza/wyłącza system
                    > \`!antylink invites [on/off]\` — Zarządza blokowaniem zaproszeń
                    > \`!antylink add [domena]\` — Dodaje domenę do białej listy
                    > \`!antylink remove [domena]\` — Usuwa domenę z białej listy
                `);
            return message.reply({ embeds: [embed] });
        }

        return message.reply({ embeds: [UI.error('Nieznana podkomenda. Użyj `!antylink help`.')] });
    },
};
