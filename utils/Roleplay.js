const { EmbedBuilder } = require('discord.js');
const db = require('./Database');

class Roleplay {
    static async handle(message, target, action, emoji, description, isNsfw = false) {
        try {
            if (!target) {
                const UI = require('./UI');
                return message.reply({ embeds: [UI.error(`Musisz oznaczyć kogoś, aby użyć tej interakcji!`)] });
            }

            if (target.id === message.author.id) {
                const UI = require('./UI');
                return message.reply({ embeds: [UI.error(`Nie możesz wykonać tej akcji na samym sobie!`)] });
            }

            // Increment sympathy stats
            const dbKey = `rp_${action}_${message.author.id}_${target.id}`;
            await db.add(dbKey, 1).catch(() => { });
            const count = await db.get(dbKey) || 1;

            // Fetch GIF from appropriate API
            let gifUrl = '';
            try {
                if (isNsfw) {
                    let type = action;
                    if (action === 'sex') type = 'hentai';
                    if (action === 'blowjob') type = 'bj';

                    const response = await fetch(`https://nekobot.xyz/api/image?type=${type}`);
                    const data = await response.json();

                    if (data.success && data.message && data.message.startsWith('http')) {
                        gifUrl = data.message;
                    } else {
                        // Fallback to waifu.pics for NSFW
                        const nsfwCategory = action === 'blowjob' ? 'blowjob' : 'waifu';
                        const response2 = await fetch(`https://api.waifu.pics/nsfw/${nsfwCategory}`);
                        const data2 = await response2.json();
                        gifUrl = data2.url;
                    }
                } else {
                    const response = await fetch(`https://nekos.best/api/v2/${action}`);
                    const data = await response.json();
                    gifUrl = data.results[0].url;
                }
            } catch (err) {
                console.error('Fetch Error:', err);
                gifUrl = 'https://nekos.best/api/v2/kiss/9f2a0dcf-a628-4b82-9770-aac5ff131671.gif';
            }

            // Final safety check for EmbedBuilder
            if (!gifUrl || !gifUrl.startsWith('http')) {
                gifUrl = 'https://nekos.best/api/v2/kiss/9f2a0dcf-a628-4b82-9770-aac5ff131671.gif';
            }

            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setAuthor({ name: `' .gg/geekland × Interakcja ${isNsfw ? '18+' : 'RP'}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(`\`\`\`${emoji} ${description.toUpperCase()}\`\`\`\n` +
                    `> ${emoji} **×** ${message.author} ${description} ${target}!\n` +
                    `> 📊 **×** To już ich **${count}** wspólny raz.`)
                .setImage(gifUrl)
                .setFooter({ text: `Zbuduj swoją więź na serwerze.` });

            await message.channel.send({ content: `${target}`, embeds: [embed] });
        } catch (error) {
            console.error('Roleplay Handle Error:', error);
            if (message.editable) message.reply('❌ Wystąpił błąd podczas ładowania interakcji.').catch(() => { });
        }
    }
}

module.exports = Roleplay;
