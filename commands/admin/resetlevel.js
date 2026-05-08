const UI = require('../../utils/UI');
const { PermissionsBitField } = require('discord.js');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'resetlevel',
    description: 'Zeruje postęp użytkownika',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do tej komendy!')] });
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply({ embeds: [UI.error('**Użycie:** `!resetlevel <@user>`')] });

        const data = Levels.getData();
        if (data[target.id]) {
            data[target.id].level = 0;
            data[target.id].xp = 0;
            Levels.saveData(data);
            await Levels.updateNickname(target, 0);
        }

        return message.reply(`✅ Zresetowano poziom użytkownika ${target}.`);
    },
};
