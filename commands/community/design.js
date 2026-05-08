const UI = require('../../utils/UI');
const { EmbedBuilder } = require('discord.js');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'design',
    description: 'Zmienia styl twojego tagu poziomu (✩ lub ♡)',
    async execute(message, args) {
        const choice = parseInt(args[0]);
        if (choice !== 1 && choice !== 2) {
            return message.reply({ embeds: [UI.error('**Użycie:** `!design <1 lub 2>`\n1: `[LVL ✩]`\n2: `[LVL ♡]`')] });
        }

        const data = Levels.getData();
        if (!data[message.author.id]) {
            data[message.author.id] = { xp: 0, level: 0, lastMessage: 0 };
        }
        
        data[message.author.id].design = choice;
        Levels.saveData(data);

        const currentLevel = data[message.author.id].level;
        await Levels.updateNickname(message.member, currentLevel);

        const symbol = choice === 1 ? '✩' : '♡';
        
        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland × Personalizacja`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(`\`\`\`✨ Zmieniono styl Twojego tagu!\`\`\`\n> 👤 **× Użytkownik:** ${message.author}\n> 🎨 **× Nowy tag:** \`[${currentLevel} ${symbol}]\``)
            .setFooter({ text: `Twój pseudonim został automatycznie zaktualizowany.` });

        return message.reply({ embeds: [embed] });
    },
};
