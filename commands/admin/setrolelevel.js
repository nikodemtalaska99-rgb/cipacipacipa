const UI = require('../../utils/UI');
const { PermissionsBitField } = require('discord.js');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'setrolelevel',
    description: 'Ustawia rolę za konkretny poziom',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do tej komendy!')] });
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        const level = parseInt(args[1]);

        if (!role || isNaN(level)) {
            return message.reply({ embeds: [UI.error('**Użycie:** `!setrolelevel <@rola/ID> <poziom>`')] });
        }

        const globalData = Levels.getGlobalData();
        globalData.roles[level] = role.id;
        Levels.saveGlobalData(globalData);

        return message.reply(`✅ Rola ${role} będzie teraz nadawana za osiągnięcie **${level} poziomu**.`);
    },
};
