const Roleplay = require('../../utils/Roleplay');

module.exports = {
    name: 'hug',
    aliases: ['przytul'],
    category: 'rp',
    description: 'Przytula wskazanego użytkownika',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        await Roleplay.handle(message, target, 'hug', '🫂', 'przytula');
    }
};
