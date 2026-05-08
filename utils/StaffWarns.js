const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '../../assets/staff_warns.json');

if (!fs.existsSync(path.dirname(storagePath))) fs.mkdirSync(path.dirname(storagePath), { recursive: true });
if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, JSON.stringify({}, null, 4));

class StaffWarns {
    static getWarns() {
        return JSON.parse(fs.readFileSync(storagePath));
    }

    static addWarn(userId, reason) {
        const data = this.getWarns();
        if (!data[userId]) data[userId] = [];
        data[userId].push({ reason, date: new Date().toISOString() });
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 4));
        return data[userId].length;
    }

    static removeWarn(userId) {
        const data = this.getWarns();
        if (data[userId] && data[userId].length > 0) {
            data[userId].pop();
            fs.writeFileSync(storagePath, JSON.stringify(data, null, 4));
            return true;
        }
        return false;
    }
}

module.exports = StaffWarns;
