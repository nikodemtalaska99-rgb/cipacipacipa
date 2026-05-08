const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '../assets/moderation_data.json');

if (!fs.existsSync(path.dirname(storagePath))) fs.mkdirSync(path.dirname(storagePath), { recursive: true });
if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, JSON.stringify({ jailed: {} }, null, 4));

class Moderation {
    static getData() {
        return JSON.parse(fs.readFileSync(storagePath));
    }

    static saveData(data) {
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 4));
    }

    static saveUserRoles(userId, roles) {
        const data = this.getData();
        data.jailed[userId] = roles;
        this.saveData(data);
    }

    static getUserRoles(userId) {
        const data = this.getData();
        return data.jailed[userId];
    }

    static removeUserRecord(userId) {
        const data = this.getData();
        delete data.jailed[userId];
        this.saveData(data);
    }
}

module.exports = Moderation;
