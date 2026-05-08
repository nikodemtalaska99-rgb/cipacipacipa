const { EmbedBuilder } = require('discord.js');

class FastFingers {
    constructor(client) {
        this.client = client;
        this.activeGame = null;
        this.words = ['monitor', 'klawiatura', 'myszka', 'komputer', 'programowanie', 'discord', 'serwer', 'bot', 'internet', 'procesor', 'karta', 'polska', 'geekland', 'aktywnosc', 'poziom', 'awans', 'ludzie', 'spolecznosc', 'zabawa', 'nagroda'];
    }

    start(channelId) {
        if (this.activeGame) return;

        const channel = this.client.channels.cache.get(channelId);
        if (!channel) return;

        const word = this.words[Math.floor(Math.random() * this.words.length)];
        this.activeGame = {
            word: word,
            startTime: Date.now(),
            channelId: channelId
        };

        const startEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: `' .gg/geekland × Szybkie Palce`, 
                iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' 
            })
            .setDescription(
                `\`\`\`⌨️ PRZEPISZ SŁOWO: ${word}\`\`\`\n` +
                `> 🚀 **Zadanie:** Kto pierwszy przepisze powyższe słowo?\n` +
                `> 💰 **Nagroda:** \`10 XP\`\n` +
                `> ⏰ **Czas:** \`45 sekund\``
            )
            .setFooter({ text: 'Liczy się każda milisekunda!' });

        channel.send({ embeds: [startEmbed] });

        // Timeout for no winner
        this.gameTimeout = setTimeout(() => {
            if (this.activeGame) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#ff9e9e')
                    .setAuthor({ 
                        name: `' .gg/geekland × Koniec Czasu`, 
                        iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' 
                    })
                    .setDescription(
                        `\`\`\`❌ Niestety nikt nie zdążył!\`\`\`\n` +
                        `> **Słowo:** ${word}\n\n` +
                        `*Następnym razem bądź szybszy!*`
                    );

                channel.send({ embeds: [timeoutEmbed] });
                this.activeGame = null;
            }
        }, 45000);
    }

    async handleMessage(message) {
        if (!this.activeGame || message.channel.id !== this.activeGame.channelId) return;

        if (message.content.trim().toLowerCase() === this.activeGame.word.toLowerCase()) {
            clearTimeout(this.gameTimeout);
            const game = this.activeGame;
            this.activeGame = null;

            const Levels = require('./Levels');
            await Levels.addXP(message.member, 10);

            const winEmbed = new EmbedBuilder()
                .setColor('#a3d9a5')
                .setAuthor({ 
                    name: `' .gg/geekland × Szybkie Palce: Zwycięzca!`, 
                    iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' 
                })
                .setDescription(
                    `\`\`\`🎉 Brawo ${message.author.username}!\`\`\`\n` +
                    `> 🏆 × Słowo **${game.word}** zostało przepisane w rekordowym czasie!\n` +
                    `> 💰 × Twoja nagroda: **10 XP**`
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

            message.reply({ embeds: [winEmbed] });
        }
    }
}

module.exports = FastFingers;
