const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const config = require('../../config.json');

module.exports = {
    name: 'unban',
    category: 'admin',
    description: 'Odbanowuje użytkownika',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do odbanowywania!')] });
        }

        const id = args[0];
        if (!id) return message.reply({ embeds: [UI.error('Musisz podać ID użytkownika do odbanowania!')] });

        try {
            const ban = await message.guild.bans.fetch(id).catch(() => null);
            if (!ban) return message.reply({ embeds: [UI.error('Ten użytkownik nie jest zbanowany!')] });

            await message.guild.bans.remove(id);

            const successEmbed = new EmbedBuilder()
                .setColor('#a3d9a5')
                .setAuthor({ name: `' .gg/geekland × Unban`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setDescription(`\`\`\`✅ ' .gg/geekland × Sukces\`\`\`\n> 🔓 **×** Odbanowano użytkownika: **${ban.user.tag}** (\`${id}\`)`)
                .setFooter({ text: `Moderator: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error(error);
            message.reply({ embeds: [UI.error('Nie udało się odbanować użytkownika. Sprawdź moje uprawnienia!')] });
        }
    },
};
