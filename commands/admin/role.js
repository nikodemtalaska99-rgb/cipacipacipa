const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');
const config = require('../../config.json');

module.exports = {
    name: 'role',
    aliases: ['r'],
    category: 'admin',
    description: 'Nadaje lub zabiera rolę użytkownikowi',
    async execute(message, args) {
        if (!UI.isManagement(message.member) && !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ embeds: [UI.noPermission('Nie masz uprawnień do zarządzania rolami!')] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć użytkownika lub podać jego ID!')] });

        const roleInput = args.slice(1).join(' ');
        if (!roleInput) return message.reply({ embeds: [UI.error('Musisz podać nazwę, ID lub oznaczyć rolę!')] });

        const role = message.mentions.roles.first() || 
                     message.guild.roles.cache.get(roleInput) || 
                     message.guild.roles.cache.find(r => r.name.toLowerCase() === roleInput.toLowerCase());

        if (!role) return message.reply({ embeds: [UI.error('Nie znaleziono podanej roli!')] });

        // Check if the bot can manage this role
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({ embeds: [UI.error('Moja ranga jest zbyt niska, aby zarządzać tą rolą!')] });
        }

        try {
            if (target.roles.cache.has(role.id)) {
                await target.roles.remove(role);
                const embed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setDescription(`\`\`\`🎨 ' .gg/geekland × Zarządzanie Rolami\`\`\`\n` +
                        `> 👤 **× Użytkownik:** ${target}\n` +
                        `> ❌ **× Zabrano rolę:** ${role}`);
                await message.reply({ embeds: [embed] });
            } else {
                await target.roles.add(role);
                const embed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setDescription(`\`\`\`🎨 ' .gg/geekland × Zarządzanie Rolami\`\`\`\n` +
                        `> 👤 **× Użytkownik:** ${target}\n` +
                        `> ✅ **× Nadano rolę:** ${role}`);
                await message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            return message.reply({ embeds: [UI.error('Wystąpił błąd podczas zmiany roli. Sprawdź moje uprawnienia.')] });
        }
    },
};
