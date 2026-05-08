const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Events, MessageFlags, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const storagePath = path.join(__dirname, '../../antyleak_data.json');
const db = require('../../utils/Database');

// Initialize storage if not exists
if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, JSON.stringify({ faces: [], names: [], others: [] }, null, 4));
}

const VoiceMaster = require('../../utils/VoiceMaster');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- VoiceMaster System ---
        if (interaction.customId && interaction.customId.startsWith('vm_')) {
            return await VoiceMaster.handleInteraction(interaction);
        }

        // --- Quiz System ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'quiz_answer') {
            return await interaction.client.quiz.handleInteraction(interaction);
        }

        // --- 1. Obsługa Menu Wyboru (Select Menus) ---
        if (interaction.isStringSelectMenu()) {
            // Menu konfiguracji AntiLeak
            if (interaction.customId === 'antyleak_setup_menu') {
                const selected = interaction.values[0];
                let modalTitle = '', inputLabel = '', inputPlaceholder = '', modalId = '';

                switch (selected) {
                    case 'ban_face':
                        modalId = 'antyleak_modal_face';
                        modalTitle = 'Ochrona: Zbanuj Twarz';
                        inputLabel = 'Link do zdjęcia twarzy';
                        inputPlaceholder = 'Wklej link do zdjęcia, które ma być usuwane...';
                        break;
                    case 'ban_name':
                        modalId = 'antyleak_modal_name';
                        modalTitle = 'Ochrona: Zbanuj Nazwisko';
                        inputLabel = 'Fraza do filtrowania';
                        inputPlaceholder = 'Podaj nazwisko lub nick, który ma być blokowany...';
                        break;
                    case 'ban_other':
                        modalId = 'antyleak_modal_other';
                        modalTitle = 'Ochrona: Zbanuj Inne Dane';
                        inputLabel = 'Dane do ochrony (IG, adres, tel)';
                        inputPlaceholder = 'Podaj co dokładnie bot ma usuwać...';
                        break;
                }

                const modal = new ModalBuilder().setCustomId(modalId).setTitle(modalTitle);
                const dataInput = new TextInputBuilder()
                    .setCustomId('antyleak_input_data')
                    .setLabel(inputLabel)
                    .setPlaceholder(inputPlaceholder)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(dataInput));
                return await interaction.showModal(modal);
            }

            // Menu Personalizacji (Selfrole)
            if (interaction.customId.startsWith('selfrole_')) {
                const category = interaction.customId;
                const selectedValue = interaction.values[0];

                const roleMap = {
                    'color_red': 'ROLE_ID_HERE',
                    'color_blue': 'ROLE_ID_HERE',
                    'color_green': 'ROLE_ID_HERE',
                    'color_yellow': 'ROLE_ID_HERE',
                    'color_purple': 'ROLE_ID_HERE',
                    'gender_male': 'ROLE_ID_HERE',
                    'gender_female': 'ROLE_ID_HERE',
                    'age_13_15': 'ROLE_ID_HERE',
                    'age_16_18': 'ROLE_ID_HERE',
                    'age_18_plus': 'ROLE_ID_HERE',
                    'status_single': 'ROLE_ID_HERE',
                    'status_taken': 'ROLE_ID_HERE',
                    'status_in_love': 'ROLE_ID_HERE',
                    'status_complicated': 'ROLE_ID_HERE'
                };

                const roleCategories = {
                    'selfrole_color': ['color_red', 'color_blue', 'color_green', 'color_yellow', 'color_purple'],
                    'selfrole_gender': ['gender_male', 'gender_female'],
                    'selfrole_age': ['age_13_15', 'age_16_18', 'age_18_plus'],
                    'selfrole_status': ['status_single', 'status_taken', 'status_in_love', 'status_complicated']
                };

                const rolesToRem = roleCategories[category]
                    .map(v => roleMap[v])
                    .filter(id => id && id !== 'ROLE_ID_HERE' && interaction.member.roles.cache.has(id));

                const roleToAdd = roleMap[selectedValue];

                try {
                    if (rolesToRem.length > 0) await interaction.member.roles.remove(rolesToRem);
                    if (roleToAdd && roleToAdd !== 'ROLE_ID_HERE') await interaction.member.roles.add(roleToAdd);

                    return await interaction.reply({
                        content: `✅ Twoje rangi zostały zaktualizowane!`,
                        flags: [MessageFlags.Ephemeral]
                    });
                } catch (error) {
                    console.error(error);
                    return await interaction.reply({
                        content: `❌ Wystąpił błąd podczas nadawania rangi. Upewnij się, że bot ma odpowiednie uprawnienia.`,
                        flags: [MessageFlags.Ephemeral]
                    });
                }
            }
        }

        // --- 2. Obsługa Przycisków (Buttons) ---
        if (interaction.isButton()) {
            // --- System Selfie ---
            if (interaction.customId.startsWith('selfie_')) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    return await interaction.reply({ content: '❌ Tylko administracja może weryfikować selfie!', flags: [MessageFlags.Ephemeral] });
                }

                const [_, action, userId, originalMsgId] = interaction.customId.split('_');
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                const selfieConfig = await db.get(`selfie_config_${interaction.guild.id}`);

                if (action === 'accept') {
                    if (member && selfieConfig?.roleId) {
                        await member.roles.add(selfieConfig.roleId).catch(() => {});
                        await member.send(`🎉 Twoje selfie na serwerze **${interaction.guild.name}** zostało zaakceptowane!`).catch(() => {});
                    }

                    // Remove hourglass reaction from original message if it exists
                    if (selfieConfig?.channelId) {
                        const channel = interaction.guild.channels.cache.get(selfieConfig.channelId);
                        if (channel) {
                            const originalMsg = await channel.messages.fetch(originalMsgId).catch(() => null);
                            if (originalMsg) await originalMsg.reactions.removeAll().catch(() => {});
                        }
                    }
                    
                    const embed = EmbedBuilder.from(interaction.message.embeds[0])
                        .setColor('#a3d9a5')
                        .setDescription(`\`\`\`✅ Zdjęcie zaakceptowane przez ${interaction.user.username}\`\`\``);

                    await interaction.update({ embeds: [embed], components: [] });
                } else {
                    // Delete original photo on rejection
                    if (selfieConfig?.channelId) {
                        const channel = interaction.guild.channels.cache.get(selfieConfig.channelId);
                        if (channel) {
                            const originalMsg = await channel.messages.fetch(originalMsgId).catch(() => null);
                            if (originalMsg) await originalMsg.delete().catch(() => {});
                        }
                    }

                    if (member) {
                        await member.send(`😔 Twoje selfie na serwerze **${interaction.guild.name}** zostało odrzucone. Zdjęcie zostało usunięte.`).catch(() => {});
                    }

                    const embed = EmbedBuilder.from(interaction.message.embeds[0])
                        .setColor('#ff9e9e')
                        .setDescription(`\`\`\`❌ Zdjęcie odrzucone przez ${interaction.user.username}\`\`\``);

                    await interaction.update({ embeds: [embed], components: [] });
                }
                return;
            }

            // --- System Ticketów ---
            if (interaction.customId === 'ticket_open') {
                const ticketName = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                const existingChannel = interaction.guild.channels.cache.find(c => c.name === ticketName);
                
                if (existingChannel) {
                    return await interaction.reply({ content: '❌ Masz już otwarty ticket!', flags: [MessageFlags.Ephemeral] });
                }

                try {
                    const channel = await interaction.guild.channels.create({
                        name: ticketName,
                        type: 0,
                        permissionOverwrites: [
                            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] }
                        ]
                    });

                    const embed = new EmbedBuilder()
                        .setColor('#ffb6c1')
                        .setTitle(`🎫 Ticket: ${interaction.user.username}`)
                        .setDescription(`Witaj ${interaction.user}! Opisz dokładnie swój problem. Administracja odpowie najszybciej jak to możliwe.`)
                        .setTimestamp();

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('ticket_close')
                            .setLabel('Zamknij Ticket')
                            .setEmoji('🔒')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
                    return await interaction.reply({ content: `✅ Utworzono ticket: ${channel}`, flags: [MessageFlags.Ephemeral] });
                } catch (err) {
                    console.error(err);
                    return await interaction.reply({ content: '❌ Wystąpił błąd przy tworzeniu kanału (brak uprawnień bota).', flags: [MessageFlags.Ephemeral] });
                }
            }

            if (interaction.customId === 'ticket_close') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                    return await interaction.reply({ content: '❌ Tylko administracja może zamykać tickety!', flags: [MessageFlags.Ephemeral] });
                }

                await interaction.reply('🔒 Ticket zostanie usunięty za 5 sekund...');
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
                return;
            }

            // Przycisk rozpoczęcia rekrutacji
            if (interaction.customId === 'recruit_start') {
                const modal = new ModalBuilder()
                    .setCustomId('recruit_modal')
                    .setTitle('Podanie do Administracji');

                const questions = [
                    { id: 'recruit_q1', label: '1. Imię, Wiek oraz mikrofon (Tak/Nie)', style: TextInputStyle.Short, placeholder: 'Np. Kamil, 18 lat, posiadam sprawny mikro' },
                    { id: 'recruit_q2', label: '2. Dasz radę pisać min. 500 wiad/tydzień?', style: TextInputStyle.Short, placeholder: 'Wymagamy sporej aktywności. Podołasz?' },
                    { id: 'recruit_q3', label: '3. Twoje doświadczenie', style: TextInputStyle.Paragraph, placeholder: 'Gdzie byłeś adminem? Czy znasz się na botach...' },
                    { id: 'recruit_q4', label: '4. Cierpliwość i gruboskórność', style: TextInputStyle.Paragraph, placeholder: 'Jak zachowasz zimną krew przy wyzwiskach?' },
                    { id: 'recruit_q5', label: '5. Sytuacja kryzysowa', style: TextInputStyle.Paragraph, placeholder: 'Gracz spamuje reklamami z multikont. Co robisz?' }
                ];

                questions.forEach(q => {
                    modal.addComponents(new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId(q.id)
                            .setLabel(q.label)
                            .setPlaceholder(q.placeholder)
                            .setStyle(q.style)
                            .setRequired(true)
                    ));
                });

                return await interaction.showModal(modal);
            }

            // Obsługa decyzji w DM (Accept/Reject)
            if (interaction.customId.startsWith('recruit_decide_')) {
                const [_, decide, action, userId, guildId] = interaction.customId.split('_');
                const guild = interaction.client.guilds.cache.get(guildId);
                if (!guild) return interaction.reply('Serwer nie został znaleziony.');

                const member = await guild.members.fetch(userId).catch(() => null);
                if (!member) return interaction.reply('Użytkownik nie jest już na serwerze.');

                if (action === 'accept') {
                    const adminRoleId = 'ROLE_ID_HERE'; // TODO: Wpisz ID rangi administracyjnej
                    try {
                        if (adminRoleId !== 'ROLE_ID_HERE') await member.roles.add(adminRoleId);
                        
                        await interaction.update({
                            content: `✅ Zaakceptowano podanie od **${member.user.tag}**. Ranga została nadana.`,
                            components: []
                        });

                        await member.send(`🎉 Twoje podanie do administracji na serwerze **${guild.name}** zostało **zaakceptowane**!`).catch(() => {});
                    } catch (err) {
                        console.error(err);
                        await interaction.reply('Wystąpił błąd przy nadawaniu rangi (sprawdź uprawnienia bota).');
                    }
                } else {
                    await interaction.update({
                        content: `❌ Odrzucono podanie od **${member.user.tag}**.`,
                        components: []
                    });

                    await member.send(`😔 Twoje podanie do administracji na serwerze **${guild.name}** zostało **odrzucone**.`).catch(() => {});
                }
            }
        }

        // --- 3. Obsługa Formularzy (Modal Submit) ---
        if (interaction.isModalSubmit()) {
            // Podanie do administracji
            if (interaction.customId === 'recruit_modal') {
                const config = require('../../config.json');
                const owner = await interaction.client.users.fetch(config.ownerId).catch(() => null);

                if (!owner) return interaction.reply({ content: 'Błąd: Nie znaleziono właściciela w konfiguracji.', flags: [MessageFlags.Ephemeral] });

                const embed = new EmbedBuilder()
                    .setColor('#ffb6c1')
                    .setTitle(`📝 Nowe podanie: ${interaction.user.tag}`)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        { name: '1. Imię/Wiek/Mikro', value: interaction.fields.getTextInputValue('recruit_q1') },
                        { name: '2. Aktywność 500+', value: interaction.fields.getTextInputValue('recruit_q2') },
                        { name: '3. Doświadczenie', value: interaction.fields.getTextInputValue('recruit_q3') },
                        { name: '4. Cierpliwość/Tyralnia', value: interaction.fields.getTextInputValue('recruit_q4') },
                        { name: '5. Sytuacja kryzysowa', value: interaction.fields.getTextInputValue('recruit_q5') },
                        { name: 'Użytkownik', value: `${interaction.user} (ID: ${interaction.user.id})` }
                    )
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`recruit_decide_accept_${interaction.user.id}_${interaction.guild.id}`)
                        .setLabel('Zaakceptuj')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`recruit_decide_reject_${interaction.user.id}_${interaction.guild.id}`)
                        .setLabel('Odrzuć')
                        .setStyle(ButtonStyle.Danger)
                );

                try {
                    await owner.send({ embeds: [embed], components: [row] });
                    return await interaction.reply({
                        content: '✅ Twoje podanie zostało wysłane. Otrzymasz informację na DM, gdy zostanie rozpatrzone!',
                        flags: [MessageFlags.Ephemeral]
                    });
                } catch (err) {
                    console.error(err);
                    return await interaction.reply({
                        content: '❌ Wystąpił błąd przy wysyłaniu podania (prawdopodobnie właściciel ma zablokowane DM).',
                        flags: [MessageFlags.Ephemeral]
                    });
                }
            }

            // System AntiLeak
            if (interaction.customId.startsWith('antyleak_modal_')) {
                const data = interaction.fields.getTextInputValue('antyleak_input_data');
                const type = interaction.customId.replace('antyleak_modal_', '');
                const storage = JSON.parse(fs.readFileSync(storagePath));
                const dataKey = type === 'face' ? 'faces' : (type === 'name' ? 'names' : 'others');
                
                if (!storage[dataKey].includes(data.toLowerCase())) {
                    storage[dataKey].push(data.toLowerCase());
                    fs.writeFileSync(storagePath, JSON.stringify(storage, null, 4));
                }

                console.log(`[ANTYLEAK] Nowe zgłoszenie (${type}) od ${interaction.user.tag}: ${data}`);
                return await interaction.reply({
                    content: `✅ **Zgłoszono!** Dane będą automatycznie usuwane przez system.`,
                    flags: [MessageFlags.Ephemeral]
                });
            }
        }
    },
};
