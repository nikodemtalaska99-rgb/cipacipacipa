const fs = require('fs');
const path = require('path');
const storagePath = path.resolve(process.cwd(), 'assets', 'levels.json');

// Initialize storage
if (!fs.existsSync(path.dirname(storagePath))) {
    fs.mkdirSync(path.dirname(storagePath), { recursive: true });
}
if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, JSON.stringify({}, null, 4));

class Levels {
    static getData() {
        return JSON.parse(fs.readFileSync(storagePath));
    }

    static saveData(data) {
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 4));
    }

    static getGlobalData() {
        const data = this.getData();
        if (!data._global) data._global = { roles: {} };
        return data._global;
    }

    static saveGlobalData(globalData) {
        const data = this.getData();
        data._global = globalData;
        this.saveData(data);
    }

    static getXPForLevel(level) {
        return 5 * (level ** 2) + 50 * level + 100;
    }

    static async addXP(member, amount, isBooster = false) {
        const data = this.getData();
        const userId = member.id;
        if (!data[userId]) {
            data[userId] = { xp: 0, level: 0, lastMessage: 0 };
        }

        const user = data[userId];
        const now = Date.now();

        // 1 minute cooldown for messages
        if (now - user.lastMessage < 60000) return { leveledUp: false };

        const multiplier = isBooster ? 2 : 1;
        const xpToAdd = amount * multiplier;

        user.xp += xpToAdd;
        user.lastMessage = now;

        let leveledUp = false;
        while (user.xp >= this.getXPForLevel(user.level)) {
            user.xp -= this.getXPForLevel(user.level);
            user.level++;
            leveledUp = true;
        }

        this.saveData(data);

        const displayName = member.displayName || '';
        const hasTag = displayName.includes('✩') || displayName.includes('♡');
        if (leveledUp || !hasTag) {
            await this.updateNickname(member, user.level);
            if (leveledUp) await this.notifyLevelUp(member, user.level);
        }

        return { leveledUp, level: user.level, xp: user.xp };
    }

    static async addVoiceXP(member, amount, isBooster = false) {
        const data = this.getData();
        const userId = member.id;
        if (!data[userId]) {
            data[userId] = { xp: 0, level: 0, lastMessage: 0 };
        }

        const user = data[userId];
        const multiplier = isBooster ? 2 : 1;

        user.xp += amount * multiplier;

        let leveledUp = false;
        while (user.xp >= this.getXPForLevel(user.level)) {
            user.xp -= this.getXPForLevel(user.level);
            user.level++;
            leveledUp = true;
        }

        this.saveData(data);

        const displayName = member.displayName || '';
        const hasTag = displayName.includes('✩') || displayName.includes('♡');
        if (leveledUp || !hasTag) {
            await this.updateNickname(member, user.level);
            if (leveledUp) await this.notifyLevelUp(member, user.level);
        }

        return { leveledUp, level: user.level };
    }

    static async updateNickname(member, level) {
        const data = this.getData();
        const user = data[member.id] || { design: 1 };
        const symbol = user.design === 2 ? '♡' : '✩';
        const tag = `[${level} ${symbol}]`;
        const currentName = member.displayName;

        // Match both symbols
        let cleanName = currentName.replace(/\s*\[\d+\s*[✩♡]\]$/, '');
        const newNickname = `${cleanName} ${tag}`.slice(0, 32);

        if (member.manageable && member.displayName !== newNickname) {
            await member.setNickname(newNickname).catch(() => { });
        }

        // --- Role Rewards ---
        const globalData = this.getGlobalData();
        const roles = globalData.roles;
        if (roles[level]) {
            const role = member.guild.roles.cache.get(roles[level]);
            if (role) await member.roles.add(role).catch(() => { });
        }
    }

    static async notifyLevelUp(member, level) {
        const { EmbedBuilder } = require('discord.js');
        const config = require('../config.json');
        const channel = member.guild.channels.cache.get(config.levelChannelId);
        if (!channel) return;

        const levelEmbed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setTitle(`🚀 ' .gg/geekland × Awans!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setDescription(`
> 🎉 × Gratulacje ${member} \`[${level} ✩]\`!
> 📈 × Osiągnąłeś właśnie **${level}** poziom!
> 💬 × Oby tak dalej, nie zwalniaj tempa.
            `);

        await channel.send({ embeds: [levelEmbed] }).catch(() => { });
    }

    static getUser(userId) {
        const data = this.getData();
        return data[userId] || { xp: 0, level: 0, lastMessage: 0 };
    }

    static getLeaderboard(limit = 10) {
        const data = this.getData();
        return Object.entries(data)
            .filter(([id]) => !id.startsWith('_')) // Exclude global data
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => (b.level * 1000000 + b.xp) - (a.level * 1000000 + a.xp))
            .slice(0, limit);
    }
}

module.exports = Levels;
