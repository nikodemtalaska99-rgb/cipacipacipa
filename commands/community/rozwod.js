const UI = require('../../utils/UI');
const { EmbedBuilder } = require('discord.js');
const Relationship = require('../../utils/Relationship');

module.exports = {
    name: 'rozwod',
    category: 'social',
    description: 'Brutalnie kończy związek',
    async execute(message, args) {
        const partnerId = Relationship.divorce(message.author.id);
        if (!partnerId) return message.reply({ embeds: [UI.error('Nie jesteś w żadnym związku!')] });

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setDescription(`💔 **${message.author} właśnie się rozwiódł!**`);

        await message.reply({ embeds: [embed] });
    },
};
