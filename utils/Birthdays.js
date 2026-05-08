const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '../assets/birthdays.json');

if (!fs.existsSync(path.dirname(storagePath))) fs.mkdirSync(path.dirname(storagePath), { recursive: true });
if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, JSON.stringify({}, null, 4));

class Birthdays {
    static getData() {
        return JSON.parse(fs.readFileSync(storagePath));
    }

    static saveData(data) {
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 4));
    }

    static setBirthday(userId, date) {
        const data = this.getData();
        data[userId] = date; // Format: "DD-MM"
        this.saveData(data);
    }

    static getBirthday(userId) {
        const data = this.getData();
        return data[userId];
    }

    static getTodaysBirthdays() {
        const data = this.getData();
        const today = new Date();
        const currentDayMonth = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        return Object.entries(data)
            .filter(([id, date]) => date === currentDayMonth)
            .map(([id]) => id);
    }

    static getLastChecked() {
        const data = this.getData();
        return data._lastChecked || "";
    }

    static setLastChecked(date) {
        const data = this.getData();
        data._lastChecked = date;
        this.saveData(data);
    }
}

module.exports = Birthdays;
