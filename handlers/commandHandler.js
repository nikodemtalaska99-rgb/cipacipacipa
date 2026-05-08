const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = (client) => {
    client.commands = new Collection();
    const foldersPath = path.join(__dirname, '../commands');
    
    if (!fs.existsSync(foldersPath)) {
        fs.mkdirSync(foldersPath);
        return;
    }

    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('name' in command && 'execute' in command) {
                client.commands.set(command.name, command);
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => client.commands.set(alias, command));
                }
                console.log(`[COMMAND] Loaded: ${command.name}`.cyan);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing "name" or "execute".`.yellow);
            }
        }
    }
};
