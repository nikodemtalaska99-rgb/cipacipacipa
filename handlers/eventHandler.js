const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const foldersPath = path.join(__dirname, '../events');
    
    if (!fs.existsSync(foldersPath)) {
        fs.mkdirSync(foldersPath);
        return;
    }

    const eventFolders = fs.readdirSync(foldersPath);

    for (const folder of eventFolders) {
        const eventsPath = path.join(foldersPath, folder);
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`[EVENT] Loaded: ${event.name}`.magenta);
        }
    }
};
