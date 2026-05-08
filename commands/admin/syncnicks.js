const UI = require('../../utils/UI');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'syncnicks',
    category: 'admin',
    description: 'Wymusza aktualizacjÄ™ nickĂłw wszystkich osĂłb o odpowiednie tagi poziomu',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [UI.error('Tylko administrator moĹĽe uĹĽyÄ‡ tej komendy!')] });
        }

        const initialEmbed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setDescription(`đź”„ **Synchronizacja nickĂłw...**\n> Trwa sprawdzanie czĹ‚onkĂłw serwera, to moĹĽe chwilÄ™ potrwaÄ‡.`);

        const msg = await message.reply({ embeds: [initialEmbed] });
        
        const members = await message.guild.members.fetch();
        let updated = 0;
        let failed = 0;

        for (const [id, member] of members) {
            if (member.user.bot) continue;
            
            const stats = Levels.getUser(id);
            if (!stats || stats.level === undefined) continue;

            const displayName = member.displayName || '';
            const hasTag = displayName.includes('âś©') || displayName.includes('â™ˇ');

            if (!hasTag && member.manageable) {
                try {
                    await Levels.updateNickname(member, stats.level);
                    updated++;
                } catch (e) {
                    failed++;
                }
            } else if (!member.manageable && !hasTag) {
                failed++;
            }
        }

        const finalEmbed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setAuthor({ name: `' .gg/geekland Ă— Synchronizacja zakoĹ„czona`, iconURL: 'https://i.imgur.com/8N4N89N.png' })
            .setDescription(`âś… **System pomyĹ›lnie przetworzyĹ‚ listÄ™ czĹ‚onkĂłw.**\n\n` +
                `> đź‘¤ **Zaktualizowano:** \`${updated}\` osĂłb\n` +
                `> âťŚ **PominÄ™to (brak uprawnieńĹ„):** \`${failed}\` osĂłb\n\n` +
                `*PamiÄ™taj, ĹĽe bot nie moĹĽe zmieniaÄ‡ nickĂłw osĂłb z wyĹĽszymi uprawnieńniami.*`);

        await msg.edit({ embeds: [finalEmbed] });
    },
};
