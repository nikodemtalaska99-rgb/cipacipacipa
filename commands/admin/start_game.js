const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'start_game',
    description: 'Wymusza start gry (quiz lub fastfingers)',
    category: 'admin',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do użycia tej komendy!')] });
        }

        const gameType = args[0]?.toLowerCase();

        if (gameType === 'quiz') {
            const config = require('../../config.json');
            if (!config.quizChannelId) return message.reply('❌ Kanał quizu nie jest skonfigurowany! Użyj `!setup_games`.');
            
            message.client.quiz.start(config.quizChannelId);
            return message.reply('✅ Wymuszono start **Quizu**!');
        } 
        
        if (gameType === 'fastfingers' || gameType === 'palce' || gameType === 'ff') {
            const config = require('../../config.json');
            if (!config.fastFingersChannelId) return message.reply('❌ Kanał Szybkich Palców nie jest skonfigurowany! Użyj `!setup_games`.');
            
            message.client.fastFingers.start(config.fastFingersChannelId);
            return message.reply('✅ Wymuszono start **Szybkich Palców**!');
        }

        return message.reply('❌ Podaj typ gry: `!start_game quiz` lub `!start_game ff`.');
    },
};
