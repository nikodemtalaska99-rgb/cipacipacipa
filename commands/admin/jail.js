const UI = require('../../utils/UI');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Moderation = require('../../utils/Moderation');
const Levels = require('../../utils/Levels');
const Permissions = require('../../utils/Permissions');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../config.json');

module.exports = {
    name: 'jail',
    category: 'admin',
    description: 'Wysyła użytkownika do aresztu',
    async execute(message, args) {
        const config = JSON.parse(fs.readFileSync(configPath));
        if (!await Permissions.canExecute(message.member, 'jail', PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do używania tej komendy!')] });
        }

        let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        
        if (!target && args[0]) {
            const id = args[0].replace(/[<@!>]/g, '');
            target = await message.guild.members.fetch(id).catch(() => null);
        }

        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć użytkownika do zawieszenia lub podać jego ID!')] });

        if (target.roles.cache.has(config.jailedRoleId)) {
            return message.reply({ embeds: [UI.error('Ten użytkownik jest już w areszcie!')] });
        }

        const reason = args.slice(1).join(' ') || 'Brak podanego powodu';
        const jailRole = message.guild.roles.cache.get(config.jailedRoleId);

        if (!jailRole) return message.reply({ embeds: [UI.error('System kar nie został poprawnie skonfigurowany! Użyj `?setup`.')] });

        // Save original roles (excluding @everyone)
        const originalRoles = target.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.id);
        Moderation.saveUserRoles(target.id, originalRoles);

        try {
            // Remove all roles and add jailed role
            await target.roles.set([jailRole.id], `Jail: ${reason}`);

            // Levels data for badges
            const targetData = Levels.getUser(target.id);
            const modData = Levels.getUser(message.author.id);
            const targetSymbol = targetData.design === 2 ? '♡' : '✩';
            const modSymbol = modData.design === 2 ? '♡' : '✩';

            const jailEmbed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ 
                    name: `' .gg/geekland × Areszt`, 
                    iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' 
                })
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .addFields(
                    { name: '\u200b', value: `👤 **× Zatrzymany:** ${target} [${targetData.level} ${targetSymbol}]`, inline: false },
                    { name: '\u200b', value: `👮 **× Przez:** ${message.author} [${modData.level} ${modSymbol}]`, inline: false },
                    { name: '\u200b', value: `📝 **× Powód:** ${reason}`, inline: false }
                )
                .setFooter({ 
                    text: `Twoje uprawnienia zostały zawieszone. Czekaj na admina.`,
                    iconURL: 'https://i.imgur.com/K6Yv79O.png' 
                });

            await message.channel.send({ content: `${target}`, embeds: [jailEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ Wystąpił błąd podczas wsadzania do aresztu: ' + error.message);
        }
    },
};
