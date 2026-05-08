const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const UI = require('../../utils/UI');
const config = require('../../config.json');

module.exports = {
    name: 'setup_voicemaster',
    description: 'Sets up the VoiceMaster system',
    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        try {
            const guild = message.guild;

            // 1. Create Category
            const category = await guild.channels.create({
                name: 'VoiceMaster',
                type: ChannelType.GuildCategory
            });

            // 2. Create Join Channel
            const joinChannel = await guild.channels.create({
                name: '➕ Kliknij, aby stworzyć',
                type: ChannelType.GuildVoice,
                parent: category.id
            });

            // 3. Create Interface Channel
            const interfaceChannel = await guild.channels.create({
                name: 'interface',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages]
                    }
                ]
            });

            // 4. Send Panel
            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('VoiceMaster Interface')
                .setDescription('Use the buttons below to control your voice channel.\n\n**Button Usage**\n🔒 — `Lock` the voice channel\n🔓 — `Unlock` the voice channel\n👻 — `Ghost` the voice channel\n👁️ — `Reveal` the voice channel\n👑 — `Claim` the voice channel\n🔌 — `Disconnect` a member\n🎮 — `Start` an activity\nℹ️ — `View` channel information\n➕ — `Increase` the user limit\n➖ — `Decrease` the user limit')
                .setThumbnail('https://media.discordapp.net/attachments/1496116899602370762/1496117003193286807/image.png'); // Cleaned up URL for safety

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('vm_lock').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_unlock').setEmoji('🔓').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_ghost').setEmoji('👻').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_reveal').setEmoji('👁️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_claim').setEmoji('👑').setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('vm_disconnect').setEmoji('🔌').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_activity').setEmoji('🎮').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_info').setEmoji('ℹ️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_increase').setEmoji('➕').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_decrease').setEmoji('➖').setStyle(ButtonStyle.Secondary)
            );

            await interfaceChannel.send({ embeds: [embed], components: [row1, row2] });

            // 5. Save Data
            const db = require('../../utils/Database');

            await db.set(`voicemaster_guild_${guild.id}`, {
                categoryId: category.id,
                joinChannelId: joinChannel.id,
                interfaceChannelId: interfaceChannel.id
            });

            message.reply({ embeds: [UI.success('System VoiceMaster został poprawnie skonfigurowany w bazie danych.')] });

        } catch (error) {
            console.error(error);
            message.reply({ embeds: [UI.error('Wystąpił błąd podczas konfiguracji systemu VoiceMaster.')] });
        }
    },
};
