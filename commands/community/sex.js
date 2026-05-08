const Roleplay = require('../../utils/Roleplay');

module.exports = {
    name: 'sex',
    aliases: ['ruchaj', 'seks'],
    category: 'nsfw',
    description: 'Interakcja seksualna (Tylko NSFW)',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        await Roleplay.handle(message, target, 'sex', '🔞', 'uprawia seks z', true);
    }
};
