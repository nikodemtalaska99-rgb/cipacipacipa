const Roleplay = require('../../utils/Roleplay');

module.exports = {
    name: 'anal',
    category: 'nsfw',
    description: 'Interakcja analna (Tylko NSFW)',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        await Roleplay.handle(message, target, 'anal', '🔞', 'uprawia anal z', true);
    }
};
