const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../utils/Database');
const UI = require('../../utils/UI');
const config = require('../../config.json');

module.exports = {
    name: 'vanity',
    description: 'Konfiguracja nagród za vanity w statusie',
    aliases: ['v'],
    async execute(message, args) {
        if (!UI.isManagement(message.member)) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'set') {
            const link = args[1];
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);

            if (!link || !role) {
                return message.reply({ 
                    embeds: [UI.error(`**Użycie:** \`${config.prefix}vanity set [link] [@rola/ID]\`\n> Przykład: \`${config.prefix}vanity set .gg/geekland @Vanity Reward\``)] 
                });
            }

            await db.set(`vanity_${message.guild.id}`, {
                link: link,
                roleId: role.id
            });

            return message.reply({ 
                embeds: [UI.success(`Skonfigurowano vanity!\n> Link: **${link}**\n> Rola: ${role}`)] 
            });
        }

        if (subCommand === 'off' || subCommand === 'disable') {
            await db.delete(`vanity_${message.guild.id}`);
            return message.reply({ embeds: [UI.success('Wyłączono system nagród za vanity.')] });
        }

        const data = await db.get(`vanity_${message.guild.id}`);

        if (!data) {
            const helpEmbed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setAuthor({ name: '.gg/geekland · vanity setup', iconURL: message.guild.iconURL({ dynamic: true }) })
                .setDescription([
                    '```',
                    `${config.prefix}vanity set [link] [@rola] – Ustawia nagrodę`,
                    `${config.prefix}vanity status          – Pokazuje status`,
                    `${config.prefix}vanity off             – Wyłącza system`,
                    '```',
                ].join('\n'))
                .setFooter({ text: `${config.footer} · vanity`, iconURL: message.client.user.displayAvatarURL() });

            return message.reply({ embeds: [helpEmbed] });
        }

        const statusEmbed = UI.base()
            .setAuthor({ name: '.gg/geekland · vanity status' })
            .addFields(
                { name: '🔗 Link', value: `\`${data.link}\``, inline: true },
                { name: '🎭 Rola', value: `<@&${data.roleId}>`, inline: true },
                { name: '📡 Status', value: '`Włączony`', inline: true }
            );

        return message.reply({ embeds: [statusEmbed] });
    },
};
