const { EmbedBuilder } = require('discord.js');
const Birthdays = require('../../utils/Birthdays');

module.exports = {
    name: 'birthday',
    aliases: ['urodziny'],
    description: 'Zarządzanie urodzinami',
    async execute(message, args) {
        const subCommand = args[0]?.toLowerCase();

        if (subCommand === 'set') {
            const dateStr = args[1]; // Expected "DD-MM"
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])$/;

            if (!dateStr || !dateRegex.test(dateStr)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ffb6c1')
                    .setDescription(`\`\`\`❌ ' .gg/geekland × Błąd\`\`\`\n` +
                        `> 📡 **× Poprawny format:** \`!birthday set DD-MM\`\n` +
                        `> 📝 **× Przykład:** \`!birthday set 25-04\``);
                return message.reply({ embeds: [errorEmbed] });
            }

            Birthdays.setBirthday(message.author.id, dateStr);

            const successEmbed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setDescription(`\`\`\`🎉 ' .gg/geekland × Urodziny zapisane\`\`\`\n` +
                    `> ✅ **× Twoje urodziny zostały zapisane na dzień:** \`${dateStr}\`\n` +
                    `> 🎈 **× W tym dniu otrzymasz specjalną rolę i życzenia!**`);
            return message.reply({ embeds: [successEmbed] });
        }

        // Default: show user's birthday or help
        const userBirthday = Birthdays.getBirthday(message.author.id);
        
        const embed = new EmbedBuilder()
            .setColor('#ffb6c1')
            .setDescription(`\`\`\`🎂 ' .gg/geekland × System Urodzin\`\`\`\n` +
                `**Twoje ustawienia**\n` +
                `> 📅 **× Data:** ${userBirthday ? `\`${userBirthday}\`` : '`Nieustawiona`'}\n\n` +
                `**Dostępne opcje**\n` +
                `> 📝 **× Ustawienie:** \`!birthday set DD-MM\`\n` +
                `> ❌ **× Reset:** \`!birthday reset\` *(wkrótce)*`
            );
        
        await message.reply({ embeds: [embed] });
    },
};
