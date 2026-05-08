const UI = require('../../utils/UI');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const Levels = require('../../utils/Levels');

module.exports = {
    name: 'ship',
    category: 'social',
    description: 'Sprawdza miłosne dopasowanie z własną grafiką',
    async execute(message, args) {
        const member1 = message.mentions.members.first() || message.member;
        const member2 = message.mentions.members.at(1) || (args[0] && args[0].length > 10 ? message.guild.members.cache.get(args[0].replace(/[<@!>]/g, '')) : null);

        if (!member2 && member1.id === message.member.id) {
            return message.reply({ embeds: [UI.error('Musisz oznaczyć drugą osobę!')] });
        }

        const secondPlayer = member2 || message.member;
        if (member1.id === secondPlayer.id) return message.reply({ embeds: [UI.error('Wskaźnik Twojej miłości do siebie wynosi **100%**! Ale do shipu potrzeba dwojga.')] });

        const lovePercent = Math.floor(Math.random() * 101);

        // Canvas Drawing
        const canvas = createCanvas(700, 450);
        const ctx = canvas.getContext('2d');

        try {
            const avatar1 = await loadImage(member1.user.displayAvatarURL({ extension: 'png', size: 256 }));
            const avatar2 = await loadImage(secondPlayer.user.displayAvatarURL({ extension: 'png', size: 256 }));

            // Layout settings
            const avatarSize = 160;
            const heartX = 480;
            const heartY = 150;
            const heartSize = 180;

            // Lines
            ctx.strokeStyle = '#ff4d4d';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(210, 130);
            ctx.lineTo(heartX + 40, heartY + 80);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(210, 320);
            ctx.lineTo(heartX + 40, heartY + 80);
            ctx.stroke();

            // Avatars
            ctx.drawImage(avatar1, 50, 50, avatarSize, avatarSize);
            ctx.drawImage(avatar2, 50, 240, avatarSize, avatarSize);

            // Heart
            ctx.fillStyle = '#313338';
            drawHeart(ctx, heartX, heartY, heartSize);

            // Percent Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 50px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${lovePercent}%`, heartX + heartSize / 2 - 5, heartY + heartSize / 1.8);

            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'ship.png' });

            const data1 = Levels.getUser(member1.id);
            const data2 = Levels.getUser(secondPlayer.id);
            const sym1 = data1.design === 2 ? '♡' : '✩';
            const sym2 = data2.design === 2 ? '♡' : '✩';

            const embed = new EmbedBuilder()
                .setColor('#ffb6c1')
                .setDescription(`Wskaźnik miłości między ${member1} \`[${data1.level} ${sym1}]\` a ${secondPlayer} \`[${data2.level} ${sym2}]\` wynosi **${lovePercent}%**`)
                .setImage('attachment://ship.png');

            await message.reply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.error(error);
            message.reply({ embeds: [UI.error('Wystąpił błąd podczas generowania grafiki.')] });
        }
    },
};

function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const d = size;
    ctx.moveTo(x + d / 2, y + d / 5);
    ctx.bezierCurveTo(x + d / 2, y, x, y, x, y + d / 5);
    ctx.bezierCurveTo(x, y + d / 2, x + d / 2, y + d * 0.7, x + d / 2, y + d);
    ctx.bezierCurveTo(x + d / 2, y + d * 0.7, x + d, y + d / 2, x + d, y + d / 5);
    ctx.bezierCurveTo(x + d, y, x + d / 2, y, x + d / 2, y + d / 5);
    ctx.fill();
}
