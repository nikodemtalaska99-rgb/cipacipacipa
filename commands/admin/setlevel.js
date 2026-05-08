const UI = require('../../utils/UI');
const { PermissionsBitField } = require('discord.js');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'setlevel',
    description: 'Ustawia poziom uĹĽytkownika',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnieńńĹ„ do tej komendy!')] });
        }

        const target = message.mentions.members.first();
        const level = parseInt(args[1]);

        if (!target || isNaN(level)) {
            return message.reply({ embeds: [UI.error('**UĹĽycie:** `!setlevel <@user> <poziom>`')] });
        }

        const data = Levels.getData();
        if (!data[target.id]) {
            data[target.id] = { xp: 0, level: 0, lastMessage: 0 };
        }

        data[target.id].level = level;
        data[target.id].xp = 0;
        Levels.saveData(data);

        await Levels.updateNickname(target, level);
        return message.reply(`âś… Ustawiono poziom uĹĽytkownika ${target} na **${level}**.`);
    },
};
