const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Permissions = require('../../utils/Permissions');
const UI = require('../../utils/UI');
const config = require('../../config.json');

module.exports = {
    name: 'cmdallow',
    aliases: ['cmdperm', 'nadajkomende'],
    category: 'admin',
    description: 'Nadaje lub zabiera uprawnienia roli do danej komendy',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && 
            message.author.id !== config.ownerId && 
            message.author.id !== message.guild.ownerId) {
            return message.reply({ embeds: [UI.noPermission('Tylko Administrator może zarządzać uprawnieniami komend!')] });
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply({ embeds: [UI.error('Musisz oznaczyć rolę lub podać jej ID!')] });

        const commandName = args[1]?.toLowerCase();
        if (!commandName) return message.reply({ embeds: [UI.error('Musisz podać nazwę komendy!')] });

        const command = message.client.commands.get(commandName);
        if (!command) return message.reply({ embeds: [UI.error('Nie znaleziono takiej komendy!')] });

        const isAdded = await Permissions.toggleRole(command.name, role.id);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setAuthor({ name: `' .gg/geekland × Uprawnienia Komend`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setThumbnail(config.brandingThumbnail)
            .setDescription(`\`\`\`⚙️ Aktualizacja uprawnień\`\`\`\n` +
                `> 📋 **× Komenda:** \`${command.name}\`\n` +
                `> 🛡️ **× Rola:** ${role}\n` +
                `> 📊 **× Status:** ${isAdded ? '✅ **Nadano dostęp**' : '❌ **Zabrano dostęp**'}`);

        await message.reply({ embeds: [embed] });
    },
};
