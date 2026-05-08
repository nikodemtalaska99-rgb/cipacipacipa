require('dotenv').config();
require('colors');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.json');

// Initialize Client with necessary Intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // CRITICAL for prefix commands
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const FastFingers = require('./utils/FastFingers');
client.fastFingers = new FastFingers(client);
const Quiz = require('./utils/Quiz');
client.quiz = new Quiz(client);
const BirthdayManager = require('./utils/BirthdayManager');
client.birthdays = new BirthdayManager(client);
client.invites = new Collection();
client.antiPing = new Collection();
client.snipes = new Collection();

// Load Handlers
['commandHandler', 'eventHandler'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

// Global Error Handling to keep the bot alive
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:'.red, error);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:'.red, error);
});

// Dummy HTTP server to satisfy Render's port requirement
const http = require('http');
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.write('Bot is running!');
    res.end();
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Dummy web server listening on port ${PORT}`.green);
});

client.login(process.env.TOKEN);
