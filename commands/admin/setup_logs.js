const { ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../config.json');
const UI = require('../../utils/UI');

module.exports = {
    name: 'setup_logs',
    description: 'Automatycznie tworzy i konfiguruje kanały logów',
    category: 'admin',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do użycia tej komendy!')] });
        }

        try {
            const guild = message.guild;
            const statusMsg = await message.reply('⏳ Rozpoczynam konfigurację logów...');

            // 1. Create Category
            const category = await guild.channels.create({
                name: '📜 LOGI',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    }
                ]
            });

            // 2. Create Channels
            const textLogs = await guild.channels.create({
                name: '💬-tekstowe',
                type: ChannelType.GuildText,
                parent: category.id
            });

            const memberLogs = await guild.channels.create({
                name: '👤-użytkownicy',
                type: ChannelType.GuildText,
                parent: category.id
            });

            const voiceLogs = await guild.channels.create({
                name: '🎙️-głosowe',
                type: ChannelType.GuildText,
                parent: category.id
            });

            // 3. Update config
            const config = JSON.parse(fs.readFileSync(configPath));
            config.textLogsChannelId = textLogs.id;
            config.memberLogsChannelId = memberLogs.id;
            config.voiceLogsChannelId = voiceLogs.id;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            const successEmbed = new EmbedBuilder()
                .setColor('#a3d9a5')
                .setAuthor({ name: `' .gg/geekland × System Logów`, iconURL: 'https://i.imgur.com/K6Yv79O.png' })
                .setDescription(`\`\`\`✅ Pomyślnie skonfigurowano logi!\`\`\``)
                .addFields(
                    { name: '💬 Logi Tekstowe', value: `${textLogs}`, inline: true },
                    { name: '👤 Logi Użytkowników', value: `${memberLogs}`, inline: true },
                    { name: '🎙️ Logi Głosowe', value: `${voiceLogs}`, inline: true }
                )
                .setFooter({ text: 'Wszystkie zdarzenia będą teraz rejestrowane.' });

            await statusMsg.edit({ content: null, embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ Wystąpił błąd podczas konfiguracji logów: ' + error.message);
        }
    },
};
