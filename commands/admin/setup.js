const UI = require('../../utils/UI');
const { PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../config.json');

module.exports = {
    name: 'setup',
    category: 'admin',
    description: 'Konfiguruje system kar (role i kanał aresztu)',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Nie masz uprawnień do użycia tej komendy!')] });
        }

        const config = JSON.parse(fs.readFileSync(configPath));
        const guild = message.guild;

        try {
            message.channel.send('⏳ Rozpoczynam konfigurację systemu kar...');

            // 1. Create/Get Roles
            let jailedRole = guild.roles.cache.get(config.jailedRoleId);
            if (!jailedRole) {
                jailedRole = await guild.roles.create({
                    name: 'jailed',
                    color: '#2f3136',
                    reason: 'System Kar Setup'
                });
            }

            let mutedRole = guild.roles.cache.get(config.mutedRoleId);
            if (!mutedRole) {
                mutedRole = await guild.roles.create({
                    name: 'muted',
                    color: '#1f1f1f',
                    reason: 'System Kar Setup'
                });
            }

            let imutedRole = guild.roles.cache.get(config.imutedRoleId);
            if (!imutedRole) {
                imutedRole = await guild.roles.create({
                    name: 'imuted',
                    color: '#1f1f1f',
                    reason: 'System Kar Setup'
                });
            }

            // 2. Create/Get Channel
            let jailedChannel = guild.channels.cache.get(config.jailedChannelId);
            if (!jailedChannel) {
                jailedChannel = await guild.channels.create({
                    name: 'jailed',
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: jailedRole.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        }
                    ],
                    reason: 'System Kar Setup'
                });
            }

            // 3. Update Config
            config.jailedRoleId = jailedRole.id;
            config.mutedRoleId = mutedRole.id;
            config.imutedRoleId = imutedRole.id;
            config.jailedChannelId = jailedChannel.id;

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            // 4. Update all channels to hide from Jailed role
            const channels = guild.channels.cache;
            let updatedCount = 0;
            
            for (const [id, channel] of channels) {
                if (channel.id === jailedChannel.id) continue;
                
                if (!channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.ManageRoles)) continue;

                try {
                    await channel.permissionOverwrites.create(jailedRole.id, {
                        ViewChannel: false
                    });
                    updatedCount++;
                } catch (e) {
                    // Ignore errors
                }
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({ 
                    name: `' .gg/geekland × Konfiguracja Systemu Kar`, 
                    iconURL: 'https://i.imgur.com/vH97Z9B.png' 
                })
                .setDescription(`\`\`\`✅ System kar został poprawnie zainicjowany/zaktualizowany!\`\`\``)
                .addFields(
                    { 
                        name: `🎭 **Role**`, 
                        value: `> **Jailed:** <@&${jailedRole.id}>\n` +
                               `> **Muted:** <@&${mutedRole.id}>\n` +
                               `> **Imuted:** <@&${imutedRole.id}>`, 
                        inline: false 
                    },
                    { 
                        name: `🔒 **Kanał Aresztu**`, 
                        value: `> **Kanał:** ${jailedChannel} (\`${jailedChannel.id}\`)`, 
                        inline: false 
                    },
                    { 
                        name: `⚙️ **Uprawnienia**`, 
                        value: `> **Zablokowano kanałów:** \`${updatedCount}\`\n` +
                               `> *Rola aresztu ma teraz zablokowany dostęp do tych kanałów.*`, 
                        inline: false 
                    }
                )
                .setFooter({ text: `Pamiętaj, aby przenieść rolę bota wyżej niż role karane!` })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ Wystąpił błąd podczas konfiguracji: ' + error.message);
        }
    },
};
