const { EmbedBuilder } = require('discord.js');
const os = require('os');
const config = require('../../config.json');

module.exports = {
    name: 'stats',
    aliases: ['botinfo', 'statystyki', 'botstats'],
    description: 'Wyświetla szczegółowe statystyki bota',
    async execute(message, args) {
        const client = message.client;

        // RAM calculation
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        const totalMemory = os.totalmem() / 1024 / 1024 / 1024;

        // Stats calculation
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;

        // Uptime calculation
        const uptime = Math.floor(client.uptime / 1000);
        const d = Math.floor(uptime / 86400);
        const h = Math.floor(uptime / 3600) % 24;
        const m = Math.floor(uptime / 60) % 60;
        const s = uptime % 60;
        const uptimeString = `${d}d ${h}h ${m}m ${s}s`;

        const embed = new EmbedBuilder()
            .setColor(config.colors?.primary || '#ffb6c1')
            .setAuthor({ name: `Statystyki Bota: ${client.user.username}`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`\`\`\`📊 ' .gg/geekland × Informacje o bocie\`\`\`\n` +
                `> ⏱️ **× Uptime:** \`${uptimeString}\`\n` +
                `> 📡 **× Ping:** \`${client.ws.ping}ms\`\n` + `> 💾 **× Pamięć RAM:** \`${memoryUsage.toFixed(2)} MB / ${totalMemory.toFixed(2)} GB\`\n\n` +
                `\`\`\`🌍 ' .gg/geekland × Statystyki Sieci\`\`\`\n` +
                `> 🖥️ **× Serwery:** \`${totalGuilds}\`\n` +
                `> 👥 **× Użytkownicy:** \`${totalUsers}\`\n` +
                `> 💬 **× Kanały:** \`${totalChannels}\`\n\n` +
                `\`\`\`⚙️ ' .gg/geekland × System\`\`\`\n` +
                `> 💻 **× Wersja Node.js:** \`${process.version}\`\n` +
                `> 📦 **× Wersja Discord.js:** \`v${require('discord.js').version}\``)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: config.footer || 'soon' });

        await message.reply({ embeds: [embed] });
    }
};
