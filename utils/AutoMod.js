const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');
const db = require('./Database');

class AutoMod {
    constructor() {
        this.messageLog = new Map();
        
        // Better regex for invites and general URLs
        this.inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/i;
        this.urlRegex = /((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/gi;

        // Default configuration
        this.defaultConfig = {
            links: {
                enabled: true,
                allowedDomains: ['google.com', 'youtube.com', 'tenor.com', 'giphy.com', 'imgur.com', 'discord.gg/geekland'],
                blockInvites: true
            },
            spam: {
                enabled: true,
                limit: 5,
                interval: 5000,
                muteDuration: 60000
            },
            badWords: {
                enabled: true,
                words: ['cwel', 'pedał', 'czarnuch', 'nigger', 'faggot']
            },
            caps: {
                enabled: true,
                limit: 70,
                minLength: 10
            },
            massPing: {
                enabled: true,
                limit: 4
            }
        };
    }

    async getConfig(guildId) {
        const saved = await db.get(`automod_${guildId}`);
        const config = JSON.parse(JSON.stringify(this.defaultConfig));
        return saved ? { ...config, ...saved } : config;
    }

    async handleMessage(message) {
        if (!message.guild || message.author.bot) return false;
        
        // Skip check for management
        const managementRoles = config.managementRoles || ["Zarząd", "Owner", "Admin"];
        const isManagement = message.member.roles.cache.some(r => 
            managementRoles.includes(r.name) || managementRoles.includes(r.id)
        ) || message.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (isManagement) return false;

        const currentConfig = await this.getConfig(message.guild.id);

        // 1. Anti-Link
        if (currentConfig.links.enabled) {
            let shouldDelete = false;
            let reason = '';

            const content = message.content;
            const hasInvite = this.inviteRegex.test(content);
            const urls = content.match(this.urlRegex);

            // Check invites first
            if (currentConfig.links.blockInvites && hasInvite) {
                // Check if it's our own invite
                if (!content.includes('discord.gg/geekland')) {
                    shouldDelete = true;
                    reason = 'Wysyłanie zaproszeń do innych serwerów jest zabronione!';
                }
            }

            // If not deleted by invite check, check other URLs
            if (!shouldDelete && urls) {
                const forbidden = urls.some(url => {
                    let domain = url.toLowerCase();
                    if (domain.startsWith('http')) {
                        try { domain = new URL(url).hostname; } catch (e) {}
                    } else {
                        domain = domain.split('/')[0].split('?')[0];
                    }
                    
                    return !currentConfig.links.allowedDomains.some(allowed => domain.includes(allowed.toLowerCase()));
                });

                if (forbidden) {
                    shouldDelete = true;
                    reason = 'Wysyłanie nieautoryzowanych linków jest zabronione!';
                }
            }

            if (shouldDelete) {
                await message.delete().catch(() => {});
                await this.sendWarning(message, reason);
                return true;
            }
        }

        // 2. Word Blacklist
        if (currentConfig.badWords.enabled) {
            const content = message.content.toLowerCase();
            const hasBadWord = currentConfig.badWords.words.some(word => content.includes(word.toLowerCase()));

            if (hasBadWord) {
                await message.delete().catch(() => {});
                await this.sendWarning(message, 'Twoja wiadomość zawierała niedozwolone słownictwo!');
                return true;
            }
        }

        // 2.5 Mass Ping
        if (currentConfig.massPing.enabled) {
            if (message.mentions.users.size > currentConfig.massPing.limit) {
                await message.delete().catch(() => {});
                await this.sendWarning(message, `Oznaczono zbyt wiele osób naraz (Limit: ${currentConfig.massPing.limit})!`);
                return true;
            }
        }

        // 2.6 Caps Lock Spam
        if (currentConfig.caps.enabled && message.content.length > currentConfig.caps.minLength) {
            const capsCount = (message.content.match(/[A-ZĄĆĘŁŃÓŚŹŻ]/g) || []).length;
            const capsPercentage = (capsCount / message.content.length) * 100;
            if (capsPercentage > currentConfig.caps.limit) {
                await message.delete().catch(() => {});
                await this.sendWarning(message, 'Nie nadużywaj dużych liter (Caps Lock)!');
                return true;
            }
        }

        // 3. Anti-Spam
        if (currentConfig.spam.enabled) {
            const now = Date.now();
            const userData = this.messageLog.get(message.author.id) || [];
            
            const recentMessages = userData.filter(timestamp => now - timestamp < currentConfig.spam.interval);
            recentMessages.push(now);
            
            this.messageLog.set(message.author.id, recentMessages);

            if (recentMessages.length >= currentConfig.spam.limit) {
                this.messageLog.delete(message.author.id); // Reset
                await message.member.timeout(currentConfig.spam.muteDuration, 'Spamowanie wiadomościami').catch(() => {});
                
                const embed = new EmbedBuilder()
                    .setColor('#ffb6c1')
                    .setDescription(`\`\`\`🛡️ ' .gg/geekland × Anti-Spam\`\`\`\n` +
                        `> 👤 **× Zmutowano:** ${message.author}\n` +
                        `> ⏱️ **× Czas:** \`1 minuta\`\n` +
                        `> 📝 **× Powód:** Przekroczenie limitu wiadomości (${currentConfig.spam.limit} msg / ${currentConfig.spam.interval / 1000}s)`);
                
                await message.channel.send({ embeds: [embed] });
                return true;
            }
        }

        return false;
    }

    async sendWarning(message, text) {
        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setDescription(`\`\`\`🛡️ ' .gg/geekland × Automoderacja\`\`\`\n` +
                `> 👤 **× Użytkownik:** ${message.author}\n` +
                `> 📝 **× Powód:** ${text}`);
        
        const msg = await message.channel.send({ embeds: [embed] });
        setTimeout(() => msg.delete().catch(() => {}), 5000);
    }
}

module.exports = new AutoMod();
