const Roleplay = require('../../utils/Roleplay');

module.exports = {
    name: 'kiss',
    aliases: ['pocaluj', 'buziak'],
    category: 'rp',
    description: 'Daje buziaka wskazanemu użytkownikowi',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        await Roleplay.handle(message, target, 'kiss', '💋', 'całuje');
    }
};
