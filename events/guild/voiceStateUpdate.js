const { ChannelType, PermissionsBitField, Events, Collection } = require('discord.js');
const db = require('../../utils/Database');
const Levels = require('../../utils/Levels');

// Cache to store voice session start times
if (!global.voiceSessions) {
    global.voiceSessions = new Collection();
}

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const guildId = newState.guild.id;
        const member = newState.member;
        if (!member || member.user.bot) return;

        // --- Voice Stats Tracking ---
        if (!oldState.channelId && newState.channelId) {
            // User joined a voice channel
            global.voiceSessions.set(`${guildId}_${member.id}`, Date.now());
        } else if (oldState.channelId && !newState.channelId) {
            // User left a voice channel
            const joinTime = global.voiceSessions.get(`${guildId}_${member.id}`);
            if (joinTime) {
                const durationMs = Date.now() - joinTime;
                const minutes = Math.floor(durationMs / 60000);
                
                if (minutes > 0) {
                    const isBooster = !!member.premiumSince;
                    // Add XP for voice time (e.g., 5 XP per minute)
                    await Levels.addVoiceXP(member, minutes * 5, isBooster);
                    
                    // Track custom stats
                    const today = new Date().toISOString().split('T')[0];
                    await db.add(`stats_voice_${guildId}_${member.id}_total`, minutes);
                    await db.add(`stats_voice_${guildId}_${member.id}_${today}`, minutes);
                }
                global.voiceSessions.delete(`${guildId}_${member.id}`);
            }
        }

        // --- VoiceMaster Logic ---
        const guildData = await db.get(`voicemaster_guild_${guildId}`);

        if (guildData) {
            if (newState.channelId === guildData.joinChannelId) {
                try {
                    const channel = await newState.guild.channels.create({
                        name: `🔊 ${member.user.username}`,
                        type: ChannelType.GuildVoice,
                        parent: guildData.categoryId,
                        permissionOverwrites: [
                            {
                                id: member.id,
                                allow: [
                                    PermissionsBitField.Flags.ManageChannels,
                                    PermissionsBitField.Flags.MoveMembers,
                                    PermissionsBitField.Flags.MuteMembers,
                                    PermissionsBitField.Flags.DeafenMembers
                                ]
                            }
                        ]
                    });

                    await member.voice.setChannel(channel);

                    await db.set(`voicemaster_channel_${channel.id}`, {
                        ownerId: member.id,
                        guildId: guildId,
                        createdAt: Date.now()
                    });

                } catch (error) {
                    console.error('[VoiceMaster] Error creating channel:', error);
                }
            }
        }

        const oldChannelData = oldState.channelId ? await db.get(`voicemaster_channel_${oldState.channelId}`) : null;
        if (oldChannelData) {
            const channel = oldState.channel;
            if (channel && channel.members.size === 0) {
                try {
                    await channel.delete();
                    await db.delete(`voicemaster_channel_${oldState.channelId}`);
                } catch (error) { }
            }
        }
    },
};
