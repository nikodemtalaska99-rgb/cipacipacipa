const { PermissionsBitField } = require('discord.js');
const db = require('../../utils/Database');
const UI = require('../../utils/UI');

module.exports = {
    name: 'vc',
    description: 'Control your temporary voice channel',
    async execute(message, args) {
        const subCommand = args[0] ? args[0].toLowerCase() : null;
        
        const channel = message.member.voice.channel;
        if (!channel) {
            return message.reply({ embeds: [UI.error('Musisz być na kanale głosowym!')] });
        }

        const channelData = await db.get(`voicemaster_channel_${channel.id}`);
        if (!channelData) {
            return message.reply({ embeds: [UI.error('To nie jest kanał VoiceMaster!')] });
        }

        if (subCommand === 'claim') {
            const ownerFound = channel.members.has(channelData.ownerId);

            if (!ownerFound) {
                channelData.ownerId = message.author.id;
                await channel.permissionOverwrites.set([
                    {
                        id: message.author.id,
                        allow: [
                            PermissionsBitField.Flags.ManageChannels,
                            PermissionsBitField.Flags.MoveMembers,
                            PermissionsBitField.Flags.MuteMembers,
                            PermissionsBitField.Flags.DeafenMembers
                        ]
                    }
                ]);
                await db.set(`voicemaster_channel_${channel.id}`, channelData);
                return message.reply({ embeds: [UI.success('Przejąłeś ten kanał!')] });
            } else {
                return message.reply({ embeds: [UI.error('Właściciel kanału jest wciąż na nim!')] });
            }
        }

        // Other subcommands require ownership
        if (channelData.ownerId !== message.author.id) {
            return message.reply({ embeds: [UI.error('Musisz być właścicielem kanału!')] });
        }

        switch (subCommand) {
            case 'lock':
                await channel.permissionOverwrites.edit(message.guild.id, { [PermissionsBitField.Flags.Connect]: false });
                message.reply({ embeds: [UI.success('Kanał został zablokowany!')] });
                break;
            case 'unlock':
                await channel.permissionOverwrites.edit(message.guild.id, { [PermissionsBitField.Flags.Connect]: null });
                message.reply({ embeds: [UI.success('Kanał został odblokowany!')] });
                break;
            case 'name':
            case 'rename':
                const newName = args.slice(1).join(' ');
                if (!newName) return message.reply({ embeds: [UI.error('Podaj nową nazwę!')] });
                await channel.setName(newName);
                message.reply({ embeds: [UI.success(`Zmieniono nazwę kanału na: **${newName}**`)] });
                break;
            case 'limit':
                const limit = parseInt(args[1]);
                if (isNaN(limit)) return message.reply({ embeds: [UI.error('Podaj poprawny limit (0-99)!')] });
                await channel.setUserLimit(limit > 99 ? 99 : (limit < 0 ? 0 : limit));
                message.reply({ embeds: [UI.success(`Zmieniono limit osób na: **${limit || 'Brak'}**`)] });
                break;
            case 'reject':
                const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
                if (!target) return message.reply({ embeds: [UI.error('Oznacz osobę lub podaj jej ID!')] });
                if (target.id === message.author.id) return message.reply({ embeds: [UI.error('Nie możesz wyrzucić samego siebie!')] });

                await channel.permissionOverwrites.edit(target.id, { [PermissionsBitField.Flags.Connect]: false });
                if (target.voice.channelId === channel.id) {
                    await target.voice.setChannel(null);
                }
                message.reply({ embeds: [UI.success(`Użytkownik **${target.user.tag}** został wyrzucony i zablokowany na Twoim kanale!`)] });
                break;
            default:
                message.reply({
                    embeds: [
                        UI.base()
                            .setTitle('Dostępne komendy VC')
                            .setDescription('`!vc claim` - przejmij kanał\n`!vc lock` - zablokuj kanał\n`!vc unlock` - odblokuj kanał\n`!vc name/rename <nazwa>` - zmień nazwę\n`!vc limit <liczba>` - zmień limit osób\n`!vc reject <user>` - wyrzuć i zablokuj osobę')
                    ]
                });
                break;
        }
    },
};
