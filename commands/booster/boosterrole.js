const UI = require('../../utils/UI');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

const storagePath = path.join(__dirname, '../../assets/boosterRoles.json');

// Initialize storage if not exists
if (!fs.existsSync(path.dirname(storagePath))) fs.mkdirSync(path.dirname(storagePath), { recursive: true });
if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, JSON.stringify({}, null, 4));

const prefix = config.prefix || '!';

module.exports = {
    name: 'boosterrole',
    aliases: ['br'],
    description: 'Zarządzanie własną rolą boostera',
    async execute(message, args) {
        if (!message.member.premiumSince && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Ta komenda jest dostępna tylko dla osób ulepszających serwer!')] });
        }

        const subCommand = args[0]?.toLowerCase();
        const storage = JSON.parse(fs.readFileSync(storagePath));
        let userRoleId = storage[message.author.id];

        // helper to get the role object
        const getRole = () => userRoleId ? message.guild.roles.cache.get(userRoleId) : null;

        // ── CREATE ────────────────────────────────────────────────────────────
        if (subCommand === 'create') {
            if (userRoleId && getRole()) return message.reply({ embeds: [UI.error('Posiadasz już własną rolę!')] });

            const color = args[1];
            const name = args.slice(2).join(' ');

            if (!color || !name) return message.reply({ embeds: [UI.error(`**Użycie:** \`${prefix}br create [kolor/hex] [nazwa]\``)] });

            try {
                const role = await message.guild.roles.create({
                    name: name,
                    color: color.startsWith('#') ? color : (isNaN(parseInt(color, 16)) ? 'Default' : color),
                    reason: `Booster role for ${message.author.tag}`
                });

                await message.member.roles.add(role);

                storage[message.author.id] = role.id;
                fs.writeFileSync(storagePath, JSON.stringify(storage, null, 4));

                return message.reply({ embeds: [UI.success(`Stworzono twoją rolę: ${role}`)] });
            } catch (error) {
                console.error(error);
                return message.reply({ embeds: [UI.error('Wystąpił błąd podczas tworzenia roli. Upewnij się, że podałeś poprawny kolor HEX.')] });
            }
        }

        // ── BASE ──────────────────────────────────────────────────────────────
        // !br base [@rola / ID roli]  – ustawia pozycję booster roli nad wskazaną rolą
        if (subCommand === 'base') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply({ embeds: [UI.error('Tylko administratorzy mogą ustawiać bazową pozycję ról.')] });
            }

            const targetRole =
                message.mentions.roles.first() ||
                message.guild.roles.cache.get(args[1]);

            if (!targetRole) {
                return message.reply({ embeds: [UI.error(`**Użycie:** \`${prefix}br base [@rola / ID]\`\n> Wskazuje, nad którą rolą mają być umieszczane role boosterów.`)] });
            }

            // Move all existing booster roles just above the target role
            const boosterRoleIds = Object.values(storage);
            let moved = 0;

            for (const roleId of boosterRoleIds) {
                const r = message.guild.roles.cache.get(roleId);
                if (!r) continue;
                try {
                    await r.setPosition(targetRole.position + 1, { relative: false });
                    moved++;
                } catch (_) { /* skip roles we can't move */ }
            }

            return message.reply({ embeds: [UI.success(`Ustawiono bazę ról boosterów nad rolą **${targetRole.name}**.\nPrzesunięto **${moved}** istniejących ról.`)] });
        }

        // ── Require existing role for remaining subcommands ───────────────────
        const role = getRole();
        if (!role) return message.reply({ embeds: [UI.error(`Nie posiadasz jeszcze własnej roli! Użyj \`${prefix}br create [kolor] [nazwa]\``)] });

        // ── RENAME ────────────────────────────────────────────────────────────
        if (subCommand === 'rename') {
            const newName = args.slice(1).join(' ');
            if (!newName) return message.reply({ embeds: [UI.error(`**Użycie:** \`${prefix}br rename [nowa nazwa]\``)] });

            await role.setName(newName);
            return message.reply({ embeds: [UI.success(`Zmieniono nazwę roli na **${newName}**`)] });
        }

        // ── ICON ──────────────────────────────────────────────────────────────
        if (subCommand === 'icon') {
            if (!message.guild.features.includes('ROLE_ICONS')) {
                return message.reply({ embeds: [UI.error('Ten serwer nie posiada ulepszenia poziomu 2, aby używać ikon ról.')] });
            }
            const icon = args[1] || message.attachments.first()?.url;
            if (!icon) return message.reply({ embeds: [UI.error(`**Użycie:** \`${prefix}br icon [link/emoji/załącznik]\``)] });

            try {
                await role.setIcon(icon);
                return message.reply({ embeds: [UI.success('Zaktualizowano ikonę roli!')] });
            } catch (error) {
                return message.reply({ embeds: [UI.error('Nie udało się ustawić ikony. Upewnij się, że link jest poprawny.')] });
            }
        }

        // ── DELETE ────────────────────────────────────────────────────────────
        if (subCommand === 'delete') {
            try {
                await role.delete(`Booster role deleted by ${message.author.tag}`);
                delete storage[message.author.id];
                fs.writeFileSync(storagePath, JSON.stringify(storage, null, 4));
                return message.reply({ embeds: [UI.success('Usunięto twoją rolę boostera.')] });
            } catch (error) {
                return message.reply({ embeds: [UI.error('Nie udało się usunąć roli.')] });
            }
        }

        // ── COLOR (hex / random) ──────────────────────────────────────────────
        if (subCommand === 'random' || (subCommand && subCommand.match(/^#?[0-9a-fA-F]{6}$/)) || (subCommand && !isNaN(parseInt(subCommand, 16)))) {
            const newColor = subCommand === 'random' ? 'Random' : subCommand;
            try {
                await role.setColor(newColor);
                return message.reply({ embeds: [UI.success(`Zmieniono kolor roli na **${newColor}**`)] });
            } catch (error) {
                return message.reply({ embeds: [UI.error('Wystąpił błąd podczas zmiany koloru.')] });
            }
        }

        // ── HELP ──────────────────────────────────────────────────────────────
        const helpEmbed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ name: '.gg/geekland · booster role', iconURL: message.guild.iconURL({ dynamic: true }) })
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription([
                `> 🎀 Twoja rola: ${role}`,
                '',
                '```',
                `${prefix}br create [kolor] [nazwa]   – Tworzy rolę`,
                `${prefix}br [hex]                    – Zmienia kolor (np. #ffb6c1)`,
                `${prefix}br random                   – Losowy kolor`,
                `${prefix}br rename [nazwa]            – Zmienia nazwę`,
                `${prefix}br icon [link/emoji]         – Zmienia ikonę (Level 2)`,
                `${prefix}br delete                    – Usuwa twoją rolę`,
                `${prefix}br base [@rola]              – [Admin] Ustawia pozycję w hierarchii`,
                '```',
            ].join('\n'))
            .setFooter({ text: `${config.footer} · booster role`, iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp();

        return message.reply({ embeds: [helpEmbed] });
    },
};
