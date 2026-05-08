const db = require('./Database');

class StaffMessages {
    /**
     * Increment staff message count
     */
    static async addMessage(userId) {
        const today = new Date().toISOString().split('T')[0];
        await db.add(`smsgs_${userId}_${today}`, 1);
        await db.set(`smsgs_last_${userId}`, Date.now());
    }

    /**
     * Get message count for today
     */
    static async getDailyCount(userId) {
        const today = new Date().toISOString().split('T')[0];
        const count = await db.get(`smsgs_${userId}_${today}`);
        return count || 0;
    }

    /**
     * Get weekly stats and last activity
     */
    static async getStaffStats(userId) {
        let weeklyCount = 0;
        const now = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = await db.get(`smsgs_${userId}_${dateStr}`) || 0;
            weeklyCount += count;
        }

        const lastMessage = await db.get(`smsgs_last_${userId}`);
        
        return {
            weeklyCount,
            lastMessage
        };
    }
}

module.exports = StaffMessages;
