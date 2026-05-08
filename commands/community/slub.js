const UI = require('../../utils/UI');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Relationship = require('../../utils/Relationship');

module.exports = {
    name: 'slub',
    category: 'social',
    description: 'Oświadcza się wybranej osobie',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) return message.reply({ embeds: [UI.error('Musisz oznaczyć osobę, której chcesz się oświadczyć!')] });
        if (target.id === message.author.id) return message.reply({ embeds: [UI.error('Nie możesz wziąć ślubu ze samym sobą!')] });
        if (target.user.bot) return message.reply({ embeds: [UI.error('Nie możesz wziąć ślubu z botem!')] });

        if (Relationship.getPartner(message.author.id)) return message.reply({ embeds: [UI.error('Jesteś już w związku!')] });
        if (Relationship.getPartner(target.id)) return message.reply({ embeds: [UI.error('Ta osoba jest już w związku!')] });

        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setTitle('💫 Propozycja Ślubu')
            .setDescription(`${target}, czy zgadzasz się wejść w związek małżeński z ${message.author}?`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52D&');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('marry_yes').setLabel('Tak').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('marry_no').setLabel('Nie').setStyle(ButtonStyle.Danger)
        );

        const msg = await message.reply({ content: `${target}`, embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === target.id,
            time: 60000,
            max: 1
        });

        collector.on('collect', async i => {
            if (i.customId === 'marry_yes') {
                Relationship.marry(message.author.id, target.id);
                await i.update({
                    content: null,
                    embeds: [new EmbedBuilder().setColor('#ffb6c1').setDescription(`💖 **${message.author} i ${target} wzięli ślub!**`)],
                    components: []
                });
            } else {
                await i.update({
                    content: null,
                    embeds: [new EmbedBuilder().setColor('#ffb6c1').setDescription(`💔 **${target} odrzucił(a) oświadczyny...**`)],
                    components: []
                });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                msg.edit({ content: 'Propozycja wygasła.', components: [] }).catch(() => {});
            }
        });
    },
};
