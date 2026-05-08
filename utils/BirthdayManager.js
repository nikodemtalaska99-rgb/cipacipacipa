const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const Birthdays = require('./Birthdays');

class BirthdayManager {
    constructor(client) {
        this.client = client;
        this.init();
    }

    init() {
        // Check Every Hour
        setInterval(() => this.checkBirthdays(), 3600000);
        
        // Initial Check after 10 seconds of startup
        setTimeout(() => this.checkBirthdays(), 10000);
    }

    async checkBirthdays() {
        const today = new Date();
        const currentDayStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        
        if (Birthdays.getLastChecked() === currentDayStr) return;

        const birthdayUserIds = Birthdays.getTodaysBirthdays();
        const channel = this.client.channels.cache.get(config.birthdayChannelId);
        const role = this.client.guilds.cache.first()?.roles.cache.get(config.birthdayRoleId);

        // 1. Remove role from everyone (reset for the new day)
        if (role) {
            const membersWithRole = role.members;
            for (const [id, member] of membersWithRole) {
                await member.roles.remove(role).catch(() => {});
            }
        }

        // 2. Announce and give roles
        for (const userId of birthdayUserIds) {
            try {
                const guild = this.client.guilds.cache.first();
                const member = await guild.members.fetch(userId).catch(() => null);
                
                if (!member) continue;

                // Grant Role
                if (role) await member.roles.add(role).catch(() => {});

                // Announce
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('#ffb6c1')
                        .setTitle(`🎂 ' .gg/geekland × Nowe Urodziny!`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                        .setDescription(`
\`\`\`🎉 Dzisiaj swoje urodziny świętuje...\`\`\`
> 👑 **× Solenizant:** ${member}
> 🎈 **× Życzenia:** Wszystkiego co najlepsze, dużo zdrowia, szczęścia i samych sukcesów na naszym serwerze!

**Złóżcie życzenia na czacie!** 🎊
                        `);
                    
                    await channel.send({ content: `${member}`, embeds: [embed] });
                }
            } catch (error) {
                console.error(`Error processing birthday for ${userId}:`, error);
            }
        }

        Birthdays.setLastChecked(currentDayStr);
    }
}

module.exports = BirthdayManager;
