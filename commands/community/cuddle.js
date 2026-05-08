const Roleplay = require('../../utils/Roleplay');

module.exports = {
    name: 'cuddle',
    aliases: ['wtul'],
    category: 'rp',
    description: 'Wtula się we wskazanego użytkownika',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        await Roleplay.handle(message, target, 'cuddle', '🧸', 'wtula się w');
    }
};
