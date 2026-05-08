const { PermissionsBitField, MessageFlags, EmbedBuilder } = require('discord.js');
const db = require('./Database');
const config = require('../config.json');

class VoiceMaster {
    static async handleInteraction(interaction) {
        if (!interaction.customId.startsWith('vm_')) return;

        const channel = interaction.member.voice.channel;
        const channelData = channel ? await db.get(`voicemaster_channel_${channel.id}`) : null;

        // Special case for 'claim' - might work if the channel exists but owner is gone
        if (interaction.customId === 'vm_claim') {
            if (!channel) {
                return interaction.reply({ content: 'Musisz być na kanale głosowym!', flags: [MessageFlags.Ephemeral] });
            }
            if (!channelData) {
                return interaction.reply({ content: 'To nie jest kanał VoiceMaster!', flags: [MessageFlags.Ephemeral] });
            }
            
            const ownerFound = channel.members.has(channelData.ownerId);

            if (!ownerFound) {
                channelData.ownerId = interaction.user.id;
                await channel.permissionOverwrites.set([
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ManageChannels,
                            PermissionsBitField.Flags.MoveMembers,
                            PermissionsBitField.Flags.MuteMembers,
                            PermissionsBitField.Flags.DeafenMembers
                        ]
                    }
                ]);
                await db.set(`voicemaster_channel_${channel.id}`, channelData);
                return interaction.reply({ content: 'Przejąłeś ten kanał!', flags: [MessageFlags.Ephemeral] });
            } else {
                return interaction.reply({ content: 'Właściciel kanału jest wciąż na nim!', flags: [MessageFlags.Ephemeral] });
            }
        }

        if (!channel || !channelData || channelData.ownerId !== interaction.user.id) {
            return interaction.reply({ content: 'Musisz być właścicielem kanału, aby to zrobić!', flags: [MessageFlags.Ephemeral] });
        }

        switch (interaction.customId) {
            case 'vm_lock':
                await channel.permissionOverwrites.edit(interaction.guild.id, { [PermissionsBitField.Flags.Connect]: false });
                await interaction.reply({ content: 'Kanał został zablokowany!', flags: [MessageFlags.Ephemeral] });
                break;
            case 'vm_unlock':
                await channel.permissionOverwrites.edit(interaction.guild.id, { [PermissionsBitField.Flags.Connect]: null });
                await interaction.reply({ content: 'Kanał został odblokowany!', flags: [MessageFlags.Ephemeral] });
                break;
            case 'vm_ghost':
                await channel.permissionOverwrites.edit(interaction.guild.id, { [PermissionsBitField.Flags.ViewChannel]: false });
                await interaction.reply({ content: 'Kanał jest teraz ukryty!', flags: [MessageFlags.Ephemeral] });
                break;
            case 'vm_reveal':
                await channel.permissionOverwrites.edit(interaction.guild.id, { [PermissionsBitField.Flags.ViewChannel]: null });
                await interaction.reply({ content: 'Kanał jest teraz widoczny!', flags: [MessageFlags.Ephemeral] });
                break;
            case 'vm_increase':
                const newLimitInc = channel.userLimit >= 99 ? 99 : channel.userLimit + 1;
                await channel.setUserLimit(newLimitInc);
                await interaction.reply({ content: `Zwiększono limit do ${newLimitInc}!`, flags: [MessageFlags.Ephemeral] });
                break;
            case 'vm_decrease':
                const newLimitDec = channel.userLimit <= 0 ? 0 : channel.userLimit - 1;
                await channel.setUserLimit(newLimitDec);
                await interaction.reply({ content: `Zmniejszono limit do ${newLimitDec}!`, flags: [MessageFlags.Ephemeral] });
                break;
            case 'vm_info':
                const infoEmbed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setTitle('Informacje o kanale')
                    .addFields(
                        { name: 'Właściciel', value: `<@${channelData.ownerId}>` },
                        { name: 'Stworzono', value: `<t:${Math.floor(channelData.createdAt / 1000)}:R>` },
                        { name: 'Limit osób', value: `${channel.userLimit || 'Brak'}` }
                    );
                await interaction.reply({ embeds: [infoEmbed], flags: [MessageFlags.Ephemeral] });
                break;
            case 'vm_disconnect':
                const memberToKick = channel.members.find(m => m.id !== interaction.user.id);
                if (memberToKick) {
                    await memberToKick.voice.setChannel(null);
                    await interaction.reply({ content: `Rozłączono ${memberToKick.user.tag}!`, flags: [MessageFlags.Ephemeral] });
                } else {
                    await interaction.reply({ content: 'Nie ma kogo rozłączyć!', flags: [MessageFlags.Ephemeral] });
                }
                break;
            case 'vm_activity':
                await interaction.reply({ content: 'Ta funkcja wymaga użycia przycisku Aktywności w Discordzie lub dedykowanego polecenia.', flags: [MessageFlags.Ephemeral] });
                break;
        }
    }
}

module.exports = VoiceMaster;
