const UI = require('../../utils/UI');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Moderation = require('../../utils/Moderation');
const Levels = require('../../utils/Levels');
const Permissions = require('../../utils/Permissions');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../config.json');

module.exports = {
    name: 'unjail',
    category: 'admin',
    description: 'Wypuszcza użytkownika z aresztu',
    async execute(message, args) {
        const config = JSON.parse(fs.readFileSync(configPath));
        if (!await Permissions.canExecute(message.member, 'unjail', PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do używania tej komendy!')] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć użytkownika do wypuszczenia!')] });

        if (!target.roles.cache.has(config.jailedRoleId)) {
            return message.reply({ embeds: [UI.error('Ten użytkownik nie jest w areszcie!')] });
        }

        const originalRoleIds = Moderation.getUserRoles(target.id) || [];
        
        try {
            // Restore roles and remove jail role
            await target.roles.set(originalRoleIds, `Unjail: Zwolnienie z aresztu`);
            Moderation.removeUserRecord(target.id);

            const targetData = Levels.getUser(target.id);
            const targetSymbol = targetData.design === 2 ? '♡' : '✩';

            const successEmbed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ 
                    name: `' .gg/geekland × Sukces`, 
                    iconURL: 'https://i.imgur.com/K6Yv79O.png' 
                })
                .setDescription(`\n> 🔒 **× Pomyślnie wypuszczono** ${target} [${targetData.level} ${targetSymbol}] na wolność i przywrócono rangę gracza.\n`);

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ Wystąpił błąd podczas wypuszczania z aresztu: ' + error.message);
        }
    },
};
