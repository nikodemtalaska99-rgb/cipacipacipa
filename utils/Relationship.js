const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '../assets/relationships.json');

if (!fs.existsSync(path.dirname(storagePath))) fs.mkdirSync(path.dirname(storagePath), { recursive: true });
if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, JSON.stringify({}, null, 4));

class Relationship {
    static getRelationships() {
        return JSON.parse(fs.readFileSync(storagePath));
    }

    static saveRelationships(data) {
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 4));
    }

    static getPartner(userId) {
        const data = this.getRelationships();
        return data[userId];
    }

    static marry(user1Id, user2Id) {
        const data = this.getRelationships();
        data[user1Id] = user2Id;
        data[user2Id] = user1Id;
        this.saveRelationships(data);
    }

    static divorce(userId) {
        const data = this.getRelationships();
        const partnerId = data[userId];
        if (partnerId) {
            delete data[userId];
            delete data[partnerId];
            this.saveRelationships(data);
            return partnerId;
        }
        return null;
    }
}

module.exports = Relationship;
