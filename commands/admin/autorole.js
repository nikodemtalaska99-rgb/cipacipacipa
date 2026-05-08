const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');
const db = require('../../utils/Database');

const DB_KEY = guildId => `autoroles_${guildId}`;

module.exports = {
    name: 'autorole',
    aliases: ['ar'],
    category: 'admin',
    description: 'Zarządza rolami automatycznie nadawanymi nowym członkom',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'autorole', PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do zarządzania autorole!')] });
        }

        const subCommand = args[0]?.toLowerCase();

        // ── LIST ─────────────────────────────────────────────────────────────
        if (!subCommand || subCommand === 'list') {
            const roles = await db.get(DB_KEY(message.guild.id)) || [];

            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Auto-Role`, iconURL: message.guild.iconURL() })
                .setDescription(
                    roles.length === 0
                        ? '> ❌ **×** Brak ustawionych autoroli.'
                        : `\`\`\`🎭 Aktywne autorole (${roles.length})\`\`\`\n` +
                          roles.map((id, i) => {
                              const role = message.guild.roles.cache.get(id);
                              return `> \`${i + 1}.\` ${role ? role.toString() : `~~<@&${id}>~~ (usunięta)`}`;
                          }).join('\n')
                )
                .setFooter({ text: `!autorole add @rola  •  !autorole remove @rola` });

            return message.reply({ embeds: [embed] });
        }

        // ── ADD ──────────────────────────────────────────────────────────────
        if (subCommand === 'add') {
            // Collect all mentioned roles from args
            const mentionedRoles = message.mentions.roles;
            const idRoles = args.slice(1)
                .filter(a => /^\d{17,19}$/.test(a))
                .map(id => message.guild.roles.cache.get(id))
                .filter(Boolean);

            const toAdd = [...new Map(
                [...mentionedRoles.values(), ...idRoles].map(r => [r.id, r])
            ).values()];

            if (toAdd.length === 0) {
                return message.reply({ embeds: [UI.error('Oznacz przynajmniej jedną rolę!\n> **Użycie:** `!autorole add @rola1 @rola2 ...`')] });
            }

            const existing = await db.get(DB_KEY(message.guild.id)) || [];
            const added = [];
            const skipped = [];

            for (const role of toAdd) {
                // Safety check – role must be below bot's top role
                const botMember = message.guild.members.me;
                if (role.position >= botMember.roles.highest.position) {
                    skipped.push(`${role} (zbyt wysoka ranga)`);
                    continue;
                }
                if (existing.includes(role.id)) {
                    skipped.push(`${role} (już istnieje)`);
                    continue;
                }
                existing.push(role.id);
                added.push(role.toString());
            }

            await db.set(DB_KEY(message.guild.id), existing);

            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Auto-Role`, iconURL: message.guild.iconURL() })
                .setDescription(
                    `\`\`\`✅ Zaktualizowano autorole\`\`\`` +
                    (added.length   ? `\n> ✅ **× Dodano:** ${added.join(', ')}` : '') +
                    (skipped.length ? `\n> ⚠️ **× Pominięto:** ${skipped.join(', ')}` : '')
                );

            return message.reply({ embeds: [embed] });
        }

        // ── REMOVE ───────────────────────────────────────────────────────────
        if (subCommand === 'remove' || subCommand === 'del') {
            const mentionedRoles = message.mentions.roles;
            const idRoles = args.slice(1)
                .filter(a => /^\d{17,19}$/.test(a))
                .map(id => ({ id }));

            const toRemove = [...new Map(
                [...mentionedRoles.values(), ...idRoles].map(r => [r.id, r])
            ).values()];

            if (toRemove.length === 0) {
                return message.reply({ embeds: [UI.error('Oznacz rolę do usunięcia!\n> **Użycie:** `!autorole remove @rola1 @rola2 ...`')] });
            }

            let existing = await db.get(DB_KEY(message.guild.id)) || [];
            const removed = [];

            for (const role of toRemove) {
                if (existing.includes(role.id)) {
                    existing = existing.filter(id => id !== role.id);
                    const gRole = message.guild.roles.cache.get(role.id);
                    removed.push(gRole ? gRole.toString() : `\`${role.id}\``);
                }
            }

            await db.set(DB_KEY(message.guild.id), existing);

            return message.reply({
                embeds: [removed.length > 0
                    ? UI.success(`Usunięto z autoroli: ${removed.join(', ')}`)
                    : UI.error('Żadna z podanych ról nie była na liście autoroli.')
                ]
            });
        }

        // ── CLEAR ────────────────────────────────────────────────────────────
        if (subCommand === 'clear' || subCommand === 'reset') {
            await db.set(DB_KEY(message.guild.id), []);
            return message.reply({ embeds: [UI.success('Wszystkie autorole zostały wyczyszczone!')] });
        }

        // ── HELP ─────────────────────────────────────────────────────────────
        const helpEmbed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland × Auto-Role – Pomoc`, iconURL: message.guild.iconURL() })
            .setDescription(
                `\`\`\`🎭 Komendy autorole\`\`\`` +
                `\n> \`!autorole list\` — lista aktywnych autoroli` +
                `\n> \`!autorole add @r1 @r2 ...\` — dodaj role (wiele naraz)` +
                `\n> \`!autorole remove @r1 @r2 ...\` — usuń role` +
                `\n> \`!autorole clear\` — wyczyść wszystkie autorole`
            );

        return message.reply({ embeds: [helpEmbed] });
    },
};
