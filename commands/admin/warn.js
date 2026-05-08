const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Warns = require('../../utils/Warns');
const UI = require('../../utils/UI');
const Permissions = require('../../utils/Permissions');

module.exports = {
    name: 'warn',
    category: 'admin',
    description: 'Nadaje ostrzeżenie użytkownikowi',
    async execute(message, args) {
        if (!await Permissions.canExecute(message.member, 'warn', PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do nadawania ostrzeżeń!')] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć użytkownika!')] });

        const reason = args.slice(1).join(' ') || 'Brak powodu';
        const totalWarns = Warns.addWarn(target.id, reason);

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setTitle(`\`⚠️ ' .gg/geekland × Ostrzeżenie\``)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription(`\n> **Użytkownik:** ${target}\n> **Powód:** ${reason}\n> **Suma warnów:** \`${totalWarns}/3\`\n`)
            .setFooter({ text: `System automatycznie nałoży karę po 3 ostrzeżeniu.` });

        await message.reply({ embeds: [embed] });

        if (totalWarns >= 3) {
            Warns.resetWarns(target.id);
            try {
                const duration = 15 * 60 * 1000; // 15 minutes
                await target.timeout(duration, 'Osiągnięto limit 3 ostrzeżeń');
                
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#ffb6c1')
                    .setDescription(`🔇 **${target}** został zmutowany na **15 minut** (Limit 3 ostrzeżeń).`);
                
                await message.channel.send({ embeds: [timeoutEmbed] });
            } catch (error) {
                console.error(error);
            }
        }
    },
};
