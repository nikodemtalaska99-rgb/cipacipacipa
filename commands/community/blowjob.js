const Roleplay = require('../../utils/Roleplay');

module.exports = {
    name: 'blowjob',
    aliases: ['bj', 'lodzik'],
    category: 'nsfw',
    description: 'Interakcja blowjob (Wszędzie)',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        await Roleplay.handle(message, target, 'blowjob', '🔞', 'robi loda', true);
    }
};
