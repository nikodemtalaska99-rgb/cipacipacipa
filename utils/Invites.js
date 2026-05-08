const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '../assets/invites.json');

// Initialize storage
if (!fs.existsSync(path.dirname(storagePath))) fs.mkdirSync(path.dirname(storagePath), { recursive: true });
if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, JSON.stringify({}, null, 4));

class Invites {
    static getData() {
        return JSON.parse(fs.readFileSync(storagePath));
    }

    static saveData(data) {
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 4));
    }

    static getUser(userId) {
        const data = this.getData();
        if (!data[userId]) {
            data[userId] = { joins: 0, leaves: 0, fakes: 0, bonus: 0, invitedList: [] };
        }
        return data[userId];
    }

    static addJoin(inviterId, invitedId, code) {
        const data = this.getData();
        if (!data[inviterId]) {
            data[inviterId] = { joins: 0, leaves: 0, fakes: 0, bonus: 0, invitedList: [] };
        }
        const inviter = data[inviterId];
        inviter.joins++;
        inviter.invitedList.unshift({ id: invitedId, code: code, time: Date.now(), active: true });
        if (inviter.invitedList.length > 5) inviter.invitedList.pop();
        
        this.saveData(data);
    }

    static addLeave(invitedId) {
        const data = this.getData();
        let inviterId = null;
        
        // Find who invited this user
        for (const [id, stats] of Object.entries(data)) {
            const entry = stats.invitedList.find(i => i.id === invitedId && i.active);
            if (entry) {
                entry.active = false;
                stats.leaves++;
                inviterId = id;
                break;
            }
        }
        
        if (inviterId) {
            this.saveData(data);
        }
    }
}

module.exports = Invites;
