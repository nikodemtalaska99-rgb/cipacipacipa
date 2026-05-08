const db = require('./Database');

class StatsTracker {
    static async addMessage(guildId, userId) {
        const today = new Date().toISOString().split('T')[0];
        await db.add(`stats_msgs_${guildId}_${userId}_total`, 1);
        await db.add(`stats_msgs_${guildId}_${userId}_${today}`, 1);
    }

    static async addVoiceTime(guildId, userId, minutes) {
        const today = new Date().toISOString().split('T')[0];
        await db.add(`stats_voice_${guildId}_${userId}_total`, minutes);
        await db.add(`stats_voice_${guildId}_${userId}_${today}`, minutes);
    }

    static async getTopMessages(guildId, limit = 10, period = 'total') {
        // This is a bit tricky with QuickDB since it doesn't support easy sorting of keys
        // We might need to store a list of users or just fetch what we can
        // For now, let's assume we fetch from a global list or use the level data as a proxy
    }
}

module.exports = StatsTracker;
