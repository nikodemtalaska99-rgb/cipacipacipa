const Roleplay = require('../../utils/Roleplay');

module.exports = {
    name: 'pat',
    aliases: ['poglaszcz'],
    category: 'rp',
    description: 'Głaszcze wskazanego użytkownika',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        await Roleplay.handle(message, target, 'pat', '🤚', 'głaszcze');
    }
};
