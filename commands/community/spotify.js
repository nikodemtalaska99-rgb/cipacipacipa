const { EmbedBuilder, ActivityType } = require('discord.js');
const UI = require('../../utils/UI');

module.exports = {
    name: 'spotify',
    aliases: ['song', 'muzyka', 'sp'],
    category: 'util',
    description: 'Pokazuje czego aktualnie słucha użytkownik na Spotify',
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

        // Find Spotify activity
        const spotify = target.presence?.activities.find(activity => activity.name === 'Spotify' && activity.type === ActivityType.Listening);

        if (!spotify) {
            return message.reply({ embeds: [UI.error(`${target.user.username} nie słucha obecnie niczego na Spotify (lub ma ukrytą aktywność).`)] });
        }

        const trackTitle = spotify.details;
        const trackArtist = spotify.state.replace(/;/g, ',');
        const trackAlbum = spotify.assets.largeText;
        const trackImg = `https://i.scdn.co/image/${spotify.assets.largeImage.slice(8)}`;
        
        // Progress bar logic
        const start = spotify.timestamps.start;
        const end = spotify.timestamps.end;
        const now = Date.now();
        
        const total = end - start;
        const progress = now - start;
        const progressPercent = Math.min(Math.max((progress / total) * 100, 0), 100);
        
        const progressBar = (percent) => {
            const size = 15;
            const line = '▬';
            const slider = '🔘';
            const pos = Math.floor((percent / 100) * size);
            let bar = '';
            for (let i = 0; i < size; i++) {
                if (i === pos) bar += slider;
                else bar += line;
            }
            return bar;
        };

        const formatTime = (ms) => {
            const minutes = Math.floor(ms / 60000);
            const seconds = ((ms % 60000) / 1000).toFixed(0);
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        };

        const embed = new EmbedBuilder()
            .setColor('#1DB954') // Spotify Green
            .setAuthor({ name: `${target.user.username} słucha Spotify`, iconURL: 'https://i.imgur.com/vHqY7Z9.png' })
            .setTitle(trackTitle)
            .setURL(`https://open.spotify.com/search/${encodeURIComponent(trackTitle + ' ' + trackArtist)}`)
            .setThumbnail(trackImg)
            .addFields(
                { name: '👤 Wykonawca', value: `\`${trackArtist}\``, inline: true },
                { name: '💿 Album', value: `\`${trackAlbum}\``, inline: true },
                { name: '\u200b', value: `${formatTime(progress)} ${progressBar(progressPercent)} ${formatTime(total)}`, inline: false }
            )
            .setFooter({ text: `' .gg/geekland × Spotify Experience`, iconURL: target.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    },
};
