const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Zalogowano jako ${client.user.tag}!`);
        
        const activities = [
            '🌸 .gg/geekland',
            '🌟 !help',
            '💖 Twoje bezpieczne miejsce'
        ];

        let i = 0;
        setInterval(() => {
            client.user.setActivity(activities[i], { type: ActivityType.Watching });
            i = (i + 1) % activities.length;
        }, 15000);
    },
};
