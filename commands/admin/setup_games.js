const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../config.json');
const UI = require('../../utils/UI');

module.exports = {
    name: 'setup_games',
    description: 'Konfiguruje kanały dla gier (quiz i szybkie palce)',
    category: 'admin',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do użycia tej komendy!')] });
        }

        const quizChannel = message.mentions.channels.first();
        const fastFingersChannel = message.mentions.channels.at(1);

        if (!quizChannel || !fastFingersChannel) {
            return message.reply({ embeds: [UI.error('**Użycie:** `!setup_games [#kanał_quiz] [#kanał_palce]`')] });
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath));
            config.quizChannelId = quizChannel.id;
            config.fastFingersChannelId = fastFingersChannel.id;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            const successEmbed = new EmbedBuilder()
                .setColor('#a3d9a5')
                .setAuthor({ name: `' .gg/geekland × Konfiguracja Gier`, iconURL: 'https://i.imgur.com/K6Yv79O.png' })
                .setDescription(`\`\`\`✅ Pomyślnie skonfigurowano kanały gier!\`\`\``)
                .addFields(
                    { name: '🧠 Quiz', value: `${quizChannel}`, inline: true },
                    { name: '⌨️ Szybkie Palce', value: `${fastFingersChannel}`, inline: true }
                );

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ Wystąpił błąd podczas konfiguracji: ' + error.message);
        }
    },
};
