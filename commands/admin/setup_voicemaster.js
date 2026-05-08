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
                name: 'âž• Kliknij, aby stworzyÄ‡',
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
                .setDescription('Use the buttons below to control your voice channel.\n\n**Button Usage**\nđź”’ â€” `Lock` the voice channel\nđź”“ â€” `Unlock` the voice channel\nđź‘» â€” `Ghost` the voice channel\nđź‘ď¸Ź â€” `Reveal` the voice channel\nđź‘‘ â€” `Claim` the voice channel\nđź”Ś â€” `Disconnect` a member\nđźŽ® â€” `Start` an activity\nâ„ąď¸Ź â€” `View` channel information\nâž• â€” `Increase` the user limit\nâž– â€” `Decrease` the user limit')
                .setThumbnail('https://media.discordapp.net/attachments/1496116899602370762/1496117003193286807/image.png?ex=69e8b70a&is=69e7658a&hm=c5f03450496b0e4454ae02111286b7ebłąd9163163d05825b3c5ebf2c610134ec9&=&format=webp&quality=lossless'); // Placeholder or user provided logo if available

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('vm_lock').setEmoji('đź”’').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_unlock').setEmoji('đź”“').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_ghost').setEmoji('đź‘»').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_reveal').setEmoji('đź‘ď¸Ź').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_claim').setEmoji('đź‘‘').setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('vm_disconnect').setEmoji('đź”Ś').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_activity').setEmoji('đźŽ®').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_info').setEmoji('â„ąď¸Ź').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_increase').setEmoji('âž•').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('vm_decrease').setEmoji('âž–').setStyle(ButtonStyle.Secondary)
            );

            await interfaceChannel.send({ embeds: [embed], components: [row1, row2] });

            // 5. Save Data
            const db = require('../../utils/Database');

            await db.set(`voicemaster_guild_${guild.id}`, {
                categoryId: category.id,
                joinChannelId: joinChannel.id,
                interfaceChannelId: interfaceChannel.id
            });

            message.reply({ embeds: [UI.success('System VoiceMaster zostaĹ‚ poprawnie skonfigurowany w bazie danych.')] });

        } catch (error) {
            console.error(error);
            message.reply({ embeds: [UI.error('WystÄ…piĹ‚ bĹ‚Ä…d podczas konfiguracji systemu VoiceMaster.')] });
        }
    },
};
