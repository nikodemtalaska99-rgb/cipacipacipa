const fs = require('fs');
const path = require('path');

// Używamy path.join z __dirname, aby zawsze celować w folder assets względem tego pliku
const storagePath = path.join(__dirname, '..', 'assets', 'staff_warns.json');

// Tworzenie folderu assets, jeśli nie istnieje
const assetsDir = path.dirname(storagePath);
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Tworzenie pliku json, jeśli nie istnieje
if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, JSON.stringify({}, null, 4));
}

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