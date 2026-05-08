const Roleplay = require('../../utils/Roleplay');

module.exports = {
    name: 'slap',
    aliases: ['uderz'],
    category: 'rp',
    description: 'Uderza wskazanego użytkownika',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        await Roleplay.handle(message, target, 'slap', '👋', 'uderza');
    }
};
