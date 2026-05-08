const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const db = require('../../utils/Database');
const UI = require('../../utils/UI');

module.exports = {
    name: 'setup_selfie',
    category: 'admin',
    description: 'Konfiguruje kanaĹ‚ do weryfikacji selfie',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.noPermission()] });
        }

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        const verifyChannel = message.mentions.channels.size > 1 ? message.mentions.channels.at(1) : message.guild.channels.cache.get(args[1]);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);

        if (!channel || !verifyChannel || !role) {
            return message.reply({ embeds: [UI.error('**UĹĽycie:** `!setup_selfie <#kanaĹ‚_selfie> <#kanaĹ‚_weryfikacja> <@rola>`')] });
        }

        await db.set(`selfie_config_${message.guild.id}`, {
            channelId: channel.id,
            verifyChannelId: verifyChannel.id,
            roleId: role.id
        });

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland Ă— Konfiguracja Selfie`, iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' })
            .setDescription(`\`\`\`âś… System Selfie zostaĹ‚ skonfigurowany!\`\`\`\n` +
                `> đź“¸ **Ă— KanaĹ‚ ZdjÄ™Ä‡:** ${channel}\n` +
                `> đź›ˇď¸Ź **Ă— KanaĹ‚ Weryfikacji:** ${verifyChannel}\n` +
                `> đźŽ­ **Ă— Rola:** ${role}\n\n` +
                `ZdjÄ™cia bÄ™dÄ… wysyĹ‚ane do weryfikacji, a po odrzuceniu automatycznie usuwane.`)
            .setFooter({ text: `System automatycznej weryfikacji.` });

        await message.reply({ embeds: [embed] });
    },
};
