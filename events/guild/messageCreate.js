const { Events } = require('discord.js');
const config = require('../../config.json');
const UI = require('../../utils/UI');
const db = require('../../utils/Database');
const StaffMessages = require('../../utils/StaffMessages');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Fast Fingers Game Handler
        await message.client.fastFingers.handleMessage(message);

        // AFK System - Autor wraca
        const afkData = await db.get(`afk_${message.author.id}`);
        if (afkData) {
            await db.delete(`afk_${message.author.id}`);
            const timeAfk = Math.floor(afkData.timestamp / 1000);
            message.reply({ content: `👋 Witaj z powrotem ${message.author}! Twój status AFK został usunięty. (Byłeś AFK od <t:${timeAfk}:R>)` }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 10000);
            });
        }

        // AFK System - Sprawdzanie oznaczonych osób
        if (message.mentions.users.size > 0) {
            for (const user of message.mentions.users.values()) {
                if (user.id === message.author.id) continue;
                const mentionedAfk = await db.get(`afk_${user.id}`);
                if (mentionedAfk) {
                    const timeAfk = Math.floor(mentionedAfk.timestamp / 1000);
                    message.reply({ content: `💤 **${user.username}** jest obecnie AFK: \`${mentionedAfk.reason}\` (<t:${timeAfk}:R>)` }).then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 10000);
                    });
                }
            }
        }

        // AntiLeak System
        const fs = require('fs');
        const path = require('path');
        const storagePath = path.join(__dirname, '../../antyleak_data.json');
        
        if (fs.existsSync(storagePath)) {
            const storage = JSON.parse(fs.readFileSync(storagePath));
            const content = message.content.toLowerCase();
            
            const foundLeak = [...storage.names, ...storage.others, ...storage.faces]
                .some(item => item && content.includes(item));

            if (foundLeak) {
                await message.delete().catch(() => {});
                return message.channel.send(`🛡️ **System AntiLeak:** Usunięto wiadomość zawierającą dane chronione!`).then(msg => {
                    setTimeout(() => msg.delete().catch(() => {}), 5000);
                });
            }
        }

        // Advanced AutoMod System
        const autoMod = require('../../utils/AutoMod');
        const blocked = await autoMod.handleMessage(message);
        if (blocked) return;

        // Staff Activity Tracking
        const isStaff = UI.isManagement(message.member);
        if (isStaff) {
            await StaffMessages.addMessage(message.author.id);
        }

        // Selfie System
        const selfieConfig = await db.get(`selfie_config_${message.guild.id}`);
        if (selfieConfig && message.channel.id === selfieConfig.channelId) {
            const hasImage = message.attachments.some(a => a.contentType?.startsWith('image/')) || 
                             message.content.match(/\.(jpg|jpeg|png|webp|gif)/i);
            
            if (hasImage) {
                const verifyChannel = message.guild.channels.cache.get(selfieConfig.verifyChannelId);
                if (verifyChannel) {
                    const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
                    const imageUrl = message.attachments.first()?.url || message.content.match(/https?:\/\/\S+/i)?.[0];
                    
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`selfie_accept_${message.author.id}_${message.id}`).setLabel('Akceptuj').setEmoji('✅').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`selfie_reject_${message.author.id}_${message.id}`).setLabel('Odrzuć').setEmoji('❌').setStyle(ButtonStyle.Danger)
                    );

                    const embed = new EmbedBuilder()
                        .setColor('#ffb6c1')
                        .setAuthor({ name: `' .gg/geekland × Weryfikacja Selfie`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`\`\`\`📸 Nowe zdjęcie od ${message.author.username}\`\`\`\n> 👤 **Użytkownik:** ${message.author} (\`${message.author.id}\`)\n> 🔗 **Link:** [Kliknij tutaj](${message.url})`)
                        .setImage(imageUrl)
                        .setTimestamp()
                        .setFooter({ text: `Odrzucenie spowoduje usunięcie oryginału.` });

                    await verifyChannel.send({ embeds: [embed], components: [row] });
                    await message.react('⌛').catch(() => {});
                }
            } else if (!isStaff) {
                await message.delete().catch(() => {});
                return message.author.send(`❌ Na kanale ${message.channel} można wysyłać tylko zdjęcia!`).catch(() => {});
            }
        }

        // Message Stats Tracking
        const today = new Date().toISOString().split('T')[0];
        await db.add(`stats_msgs_${message.guild.id}_${message.author.id}_total`, 1);
        await db.add(`stats_msgs_${message.guild.id}_${message.author.id}_${today}`, 1);

        // Leveling System
        const { EmbedBuilder: LevelEmbedBuilder } = require('discord.js');
        const Levels = require('../../utils/Levels');
        const isBooster = !!message.member.premiumSince;
        await Levels.addXP(message.member, Math.floor(Math.random() * 11) + 15, isBooster);

        // Anti-Ping System
        const mentionedManagement = message.mentions.members.filter(m => UI.isManagement(m));

        if (mentionedManagement.size > 0) {
            const authorIsManagement = UI.isManagement(message.member);

            if (!authorIsManagement) {
                const count = (message.client.antiPing.get(message.author.id) || 0) + 1;
                const limit = config.antiPing?.limit || 3;

                if (count >= limit) {
                    message.client.antiPing.set(message.author.id, 0);
                    
                    const duration = config.antiPing?.muteDuration || 30000;
                    await message.member.timeout(duration, `Natrętne oznaczanie Zarządu (${count} razy z rzędu)`).catch(() => {});

                    const userData = Levels.getUser(message.author.id);
                    const symbol = userData.design === 2 ? '♡' : '✩';

                    const antiPingEmbed = new LevelEmbedBuilder()
                        .setColor('#ffb6c1')
                        .setAuthor({ name: `' .gg/geekland × Anti-Ping Zarządu`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
                        .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 512 }))
                        .addFields(
                            { name: '\u200b', value: `👤 **× Zmutowano:** ${message.author} [${userData.level} ${symbol}]`, inline: false },
                            { name: '\u200b', value: `⏱️ **× Czas trwania:** ${duration / 1000} sekund`, inline: false },
                            { name: '\u200b', value: `📝 **× Powód:** Natrętne oznaczanie Zarządu (${count} razy z rzędu)`, inline: false }
                        )
                        .setFooter({ text: `System automatycznie nałożył blokadę na to konto.`, iconURL: config.brandingThumbnail });

                    await message.channel.send({ embeds: [antiPingEmbed] });
                    return;
                } else {
                    message.client.antiPing.set(message.author.id, count);
                }
            }
        } else {
            message.client.antiPing.set(message.author.id, 0);
        }

        const prefixes = [config.prefix, ',', '?'];
        const prefix = prefixes.find(p => message.content.startsWith(p));
        if (!prefix) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = message.client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply({ 
                embeds: [UI.error('Wystąpił nieoczekiwany błąd podczas wykonywania tej komendy!')] 
            });
        }
    },
};
