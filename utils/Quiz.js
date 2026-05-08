const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Levels = require('./Levels');

class Quiz {
    constructor(client) {
        this.client = client;
        this.activeQuiz = null;
        this.questions = [
            { q: 'Jaka jest chemiczna nazwa soli kuchennej?', a: ['Chlorek sodu', 'Wodorotlenek sodu', 'Azotan potasu', 'Węglan wapnia'], correct: 'Chlorek sodu' },
            { q: 'Która planeta jest najbliżej słońca?', a: ['Wenus', 'Mars', 'Merkury', 'Jowisz'], correct: 'Merkury' },
            { q: 'Jak nazywa się stolica Polski?', a: ['Kraków', 'Warszawa', 'Wrocław', 'Gdańsk'], correct: 'Warszawa' },
            { q: 'Ile kontynentów jest na świecie?', a: ['5', '6', '7', '8'], correct: '7' },
            { q: 'Kto namalował Monę Lisę?', a: ['Picasso', 'Van Gogh', 'Leonardo da Vinci', 'Michelangelo'], correct: 'Leonardo da Vinci' },
            { q: 'Jak nazywa się największy ocean?', a: ['Atlantycki', 'Indyjski', 'Spokojny', 'Arktyczny'], correct: 'Spokojny' },
            { q: 'Z jakiego kraju pochodzi pizza?', a: ['Francja', 'Włochy', 'Hiszpania', 'Grecja'], correct: 'Włochy' },
            { q: 'Który pierwiastek ma symbol H?', a: ['Hel', 'Wodór', 'Hasm', 'Rtęć'], correct: 'Wodór' },
            { q: 'Ile minut ma jedna godzina?', a: ['100', '50', '60', '120'], correct: '60' },
            { q: 'W którym roku wybuchła II Wojna Światowa?', a: ['1914', '1939', '1945', '1918'], correct: '1939' },
            { q: 'Jak nazywa się największy ssak na Ziemi?', a: ['Słoń', 'Płetwal błękitny', 'Żyrafa', 'Rekin wielorybi'], correct: 'Płetwal błękitny' },
            { q: 'Ile boków ma trójkąt?', a: ['2', '3', '4', '5'], correct: '3' },
            { q: 'Kto napisał Pana Tadeusza?', a: ['Henryk Sienkiewicz', 'Adam Mickiewicz', 'Juliusz Słowacki', 'Cyprian Kamil Norwid'], correct: 'Adam Mickiewicz' },
            { q: 'Jak nazywa się waluta w Polsce?', a: ['Dolar', 'Euro', 'Złoty', 'Funt'], correct: 'Złoty' },
            { q: 'Który kolor powstaje z połączenia niebieskiego i żółtego?', a: ['Zielony', 'Fioletowy', 'Pomarańczowy', 'Brązowy'], correct: 'Zielony' },
            { q: 'Ile dni ma rok przestępny?', a: ['364', '365', '366', '367'], correct: '366' },
            { q: 'Jak nazywa się najbliższa nam gwiazda?', a: ['Alfa Centauri', 'Słońce', 'Syriusz', 'Gwiazda Polarna'], correct: 'Słońce' },
            { q: 'W którym państwie znajduje się wieża Eiffla?', a: ['Niemcy', 'Włochy', 'Francja', 'Hiszpania'], correct: 'Francja' },
            { q: 'Które zwierzę znosi największe jaja?', a: ['Kura', 'Struś', 'Kaczka', 'Pingwin'], correct: 'Struś' },
            { q: 'Ile to jest 7 razy 8?', a: ['48', '54', '56', '64'], correct: '56' },
            { q: 'Jak nazywa się budowla ze śniegu Budowana przez Eskimosów?', a: ['Wigwam', 'Igloo', 'Jurta', 'Szałas'], correct: 'Igloo' },
            { q: 'Który napój zawiera kofeinę?', a: ['Mleko', 'Kawa', 'Woda', 'Sok pomarańczowy'], correct: 'Kawa' },
            { q: 'Z jakiego drzewa są żołędzie?', a: ['Kasztanowiec', 'Dąb', 'Brzoza', 'Sosna'], correct: 'Dąb' },
            { q: 'Jak nazywa się proces zamiany wody w parę?', a: ['Skraplanie', 'Parowanie', 'Topnienie', 'Sublimacja'], correct: 'Parowanie' },
            { q: 'Ile kół ma samochód osobowy?', a: ['2', '3', '4', '5'], correct: '4' },
            { q: 'Jak nazywa się polski skoczek, który zdobył 4 Kryształowe Kule?', a: ['Kamil Stoch', 'Adam Małysz', 'Piotr Żyła', 'Dawid Kubacki'], correct: 'Adam Małysz' },
            { q: 'Co jest głównym składnikiem chleba?', a: ['Cukier', 'Mąka', 'Sól', 'Mleko'], correct: 'Mąka' },
            { q: 'Jak nazywa się najmniejszy kontynent?', a: ['Europa', 'Australia', 'Antarktyda', 'Azja'], correct: 'Australia' },
            { q: 'Kto był pierwszym królem Polski?', a: ['Kazimierz Wielki', 'Bolesław Chrobry', 'Mieszko I', 'Władysław Łokietek'], correct: 'Bolesław Chrobry' },
            { q: 'Ile nóg ma pająk?', a: ['6', '8', '10', '12'], correct: '8' },
            { q: 'Jak nazywa się najwyższy szczyt świata?', a: ['K2', 'Mount Everest', 'Lhotse', 'Makalu'], correct: 'Mount Everest' },
            { q: 'Który owoc jest bazą do produkcji wina?', a: ['Jabłko', 'Winogrono', 'Gruszka', 'Śliwka'], correct: 'Winogrono' },
            { q: 'Jakie jest najszybsze zwierzę lądowe?', a: ['Lew', 'Gepard', 'Antylopa', 'Zając'], correct: 'Gepard' },
            { q: 'Ile strun ma standardowa gitara klasyczna?', a: ['4', '5', '6', '7'], correct: '6' },
            { q: 'Jak nazywa się naturalny satelita Ziemi?', a: ['Słońce', 'Mars', 'Księżyc', 'Gwiazda Polarna'], correct: 'Księżyc' },
            { q: 'Co jest jednostką natężenia prądu?', a: ['Wolt', 'Amper', 'Om', 'Wat'], correct: 'Amper' },
            { q: 'Jak nazywa się autorka książek o Harrym Potterze?', a: ['Stephen King', 'J.K. Rowling', 'Andrzej Sapkowski', 'J.R.R. Tolkien'], correct: 'J.K. Rowling' },
            { q: 'Ile planet jest w Układzie Słonecznym?', a: ['7', '8', '9', '10'], correct: '8' },
            { q: 'Który metal jest płynny w temperaturze pokojowej?', a: ['Ołów', 'Rtęć', 'Miedź', 'Żelazo'], correct: 'Rtęć' },
            { q: 'Z czego produkuje się papier?', a: ['Z ropy', 'Z drewna', 'Z piasku', 'Z metalu'], correct: 'Z drewna' },
            { q: 'Jak nazywa się stolica Niemiec?', a: ['Monachium', 'Berlin', 'Hamburg', 'Frankfurt'], correct: 'Berlin' },
            { q: 'Który instrument ma białe i czarne klawisze?', a: ['Gitara', 'Pianino', 'Skrzypce', 'Flet'], correct: 'Pianino' },
            { q: 'Ile sekund ma minuta?', a: ['30', '60', '90', '120'], correct: '60' },
            { q: 'Który gaz jest niezbędny do oddychania?', a: ['Azot', 'Tlen', 'Wodór', 'Dwutlenek węgla'], correct: 'Tlen' },
            { q: 'Jak nazywa się stolica Francji?', a: ['Lyon', 'Marsylia', 'Paryż', 'Nicea'], correct: 'Paryż' },
            { q: 'Ile kół ma motocykl?', a: ['1', '2', '3', '4'], correct: '2' },
            { q: 'Jak nazywa się największy kraj na świecie?', a: ['Kanada', 'Chiny', 'USA', 'Rosja'], correct: 'Rosja' },
            { q: 'Które miasto jest siedzibą papieża?', a: ['Rzym', 'Watykan', 'Florencja', 'Wenecja'], correct: 'Watykan' },
            { q: 'Ile zębów mlecznych ma dziecko?', a: ['10', '20', '32', '24'], correct: '20' },
            { q: 'Jak nazywa się nauka o gwiazdach?', a: ['Biologia', 'Astronomia', 'Geologia', 'Chemia'], correct: 'Astronomia' },
            { q: 'Która rzeka jest najdłuższa w Polsce?', a: ['Odra', 'Wisła', 'Warta', 'Bug'], correct: 'Wisła' },
            { q: 'Jak nazywa się postać, która kradnie Boże Narodzenie?', a: ['Grinch', 'Sknerus', 'Scrooge', 'Bałwan'], correct: 'Grinch' },
            { q: 'Ile to jest 100 podzielić na 4?', a: ['20', '25', '40', '50'], correct: '25' },
            { q: 'Z czego robi się frytki?', a: ['Z marchwi', 'Z ziemniaków', 'Z ogórków', 'Z selera'], correct: 'Z ziemniaków' },
            { q: 'Jak nazywa się stolica Włoch?', a: ['Mediolan', 'Rzym', 'Neapol', 'Turyn'], correct: 'Rzym' },
            { q: 'Która witamina jest produkowana przez słońce?', a: ['C', 'A', 'D', 'B12'], correct: 'D' },
            { q: 'Ile wynosi suma kątów w trójkącie?', a: ['90', '180', '270', '360'], correct: '180' },
            { q: 'Jak nazywa się najwyższa góra w Polsce?', a: ['Śnieżka', 'Rysy', 'Giewont', 'Kasprowy Wierch'], correct: 'Rysy' },
            { q: 'Jakie państwo ma kształt buta?', a: ['Grecja', 'Włochy', 'Norwegia', 'Chile'], correct: 'Włochy' },
            { q: 'Jak nazywa się stolica Czech?', a: ['Praga', 'Brno', 'Ostrawa', 'Pilzno'], correct: 'Praga' },
            { q: 'Który ptak nie potrafi latać?', a: ['Wróbel', 'Pingwin', 'Orzeł', 'Bocian'], correct: 'Pingwin' },
            { q: 'Z czego składa się cząsteczka wody?', a: ['H1O1', 'H2O', 'CO2', 'O2'], correct: 'H2O' },
            { q: 'Jak nazywa się polski astronom, który "wstrzymał Słońce"?', a: ['Jan Heweliusz', 'Mikołaj Kopernik', 'Maria Skłodowska-Curie', 'Ignacy Łukasiewicz'], correct: 'Mikołaj Kopernik' },
            { q: 'Ile to jest 12 razy 12?', a: ['124', '144', '154', '134'], correct: '144' },
            { q: 'Który kontynent jest pokryty lodem?', a: ['Afryka', 'Antarktyda', 'Azja', 'Ameryka Południowa'], correct: 'Antarktyda' },
            { q: 'Jak nazywa się najsłynniejszy polski detektyw z literatury?', a: ['Sherlock Holmes', 'Hercule Poirot', 'Komisarz Zawada', 'Marek Krajewski'], correct: 'Marek Krajewski' },
            { q: 'Który kolor powstaje z połączenia czerwonego i białego?', a: ['Różowy', 'Fioletowy', 'Pomarańczowy', 'Brązowy'], correct: 'Różowy' },
            { q: 'Ile płatków ma koniczyna przynosząca szczęście?', a: ['3', '4', '5', '6'], correct: '4' },
            { q: 'Jak nazywa się stolica Hiszpanii?', a: ['Barcelona', 'Madryt', 'Sewilla', 'Walencja'], correct: 'Madryt' },
            { q: 'Które miasto jest znane z kanałów i gondoli?', a: ['Rzym', 'Wenecja', 'Florencja', 'Piza'], correct: 'Wenecja' },
            { q: 'Ile planet karłowatych jest oficjalnie uznanych (w tym Pluton)?', a: ['3', '5', '7', '9'], correct: '5' },
            { q: 'Jak nazywa się stolica USA?', a: ['Nowy Jork', 'Waszyngton', 'Los Angeles', 'Chicago'], correct: 'Waszyngton' },
            { q: 'Z której rośliny produkuje się cukier w Polsce?', a: ['Trzcina cukrowa', 'Burak cukrowy', 'Kukurydza', 'Pszenica'], correct: 'Burak cukrowy' },
            { q: 'Ile nóg ma osa?', a: ['4', '6', '8', '10'], correct: '6' },
            { q: 'Jak nazywa się największa pustynia na świecie?', a: ['Gobi', 'Sahara', 'Atakama', 'Kalahari'], correct: 'Sahara' },
            { q: 'Który narząd pompuje krew w organizmie?', a: ['Mózg', 'Serce', 'Płuca', 'Wątroba'], correct: 'Serce' },
            { q: 'Jak nazywa się stolica Wielkiej Brytanii?', a: ['Manchester', 'Londyn', 'Liverpool', 'Birmingham'], correct: 'Londyn' },
            { q: 'Ile kontynentów zaczyna się na literę "A"?', a: ['3', '4', '5', '1'], correct: '4' },
            { q: 'W którym morzu leży wyspa Cypr?', a: ['Bałtyckie', 'Śródziemne', 'Czerwone', 'Czarne'], correct: 'Śródziemne' },
            { q: 'Jak nazywa się największy lądowy drapieżnik?', a: ['Lew', 'Niedźwiedź polarny', 'Tygrys', 'Wilk'], correct: 'Niedźwiedź polarny' },
            { q: 'Ile to jest pierwiastek z 64?', a: ['6', '7', '8', '9'], correct: '8' },
            { q: 'Jak nazywa się stolica Austrii?', a: ['Wiedeń', 'Salzburg', 'Innsbruck', 'Graz'], correct: 'Wiedeń' },
            { q: 'Z czego zrobione są opony?', a: ['Z metalu', 'Z gumy', 'Z plastyku', 'Ze szkła'], correct: 'Z gumy' },
            { q: 'Ile kolorów ma tęcza?', a: ['5', '6', '7', '8'], correct: '7' },
            { q: 'Jak nazywa się stolica Japonii?', a: ['Kioto', 'Tokio', 'Osaka', 'Hiroszima'], correct: 'Tokio' },
            { q: 'Który metal jest żółty?', a: ['Srebro', 'Złoto', 'Miedź', 'Aluminium'], correct: 'Złoto' },
            { q: 'Ile płuc ma człowiek?', a: ['1', '2', '3', '4'], correct: '2' },
            { q: 'Jak nazywa się stolica Grecji?', a: ['Ateny', 'Saloniki', 'Patras', 'Heraklion'], correct: 'Ateny' },
            { q: 'Która planeta ma pierścienie (najbardziej widoczne)?', a: ['Mars', 'Saturn', 'Jowisz', 'Neptun'], correct: 'Saturn' },
            { q: 'Ile to jest 10 do potęgi 2?', a: ['20', '100', '1000', '101'], correct: '100' },
            { q: 'Jak nazywa się stolica Portugalii?', a: ['Madryt', 'Lizbona', 'Porto', 'Faro'], correct: 'Lizbona' },
            { q: 'Z jakiego owocu robi się rodzynki?', a: ['Śliwka', 'Winogrono', 'Morela', 'Jabłko'], correct: 'Winogrono' },
            { q: 'Ile nóg ma mucha?', a: ['4', '6', '8', '10'], correct: '6' },
            { q: 'Jak nazywa się proces w którym rośliny wytwarzają tlen?', a: ['Oddychanie', 'Fotosynteza', 'Parowanie', 'Gnicie'], correct: 'Fotosynteza' },
            { q: 'Który ocean graniczy z Polską?', a: ['Atlantyk', 'Spokojny', 'Indyjski', 'Żaden'], correct: 'Żaden' },
            { q: 'Jak nazywa się najmniejsza komórka w organizmie (u mężczyzn)?', a: ['Krwinka', 'Plemnik', 'Neuron', 'Bakteria'], correct: 'Plemnik' },
            { q: 'Ile to jest 0 razy 500?', a: ['0', '500', '1', '501'], correct: '0' },
            { q: 'Jak nazywa się stolica Belgii?', a: ['Bruksela', 'Antwerpia', 'Gandawa', 'Liege'], correct: 'Bruksela' }
        ];
    }

    start(channelId) {
        if (this.activeQuiz) return;

        const channel = this.client.channels.cache.get(channelId);
        if (!channel) return;

        const questionData = this.questions[Math.floor(Math.random() * this.questions.length)];

        // Shuffle answers
        const shuffledAnswers = [...questionData.a].sort(() => Math.random() - 0.5);

        this.activeQuiz = {
            question: questionData.q,
            correctAnswer: questionData.correct,
            channelId: channelId,
            messageId: null
        };

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: `' .gg/geekland × Quiz Serwerowy`, 
                iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' 
            })
            .setDescription(
                `\`\`\`❓ PYTANIE: ${questionData.q}\`\`\`\n` +
                `> 🎯 **Zadanie:** Wybierz poprawną odpowiedź z menu poniżej.\n` +
                `> 💰 **Nagroda:** \`50 XP\`\n` +
                `> ⏰ **Czas:** \`30 sekund\``
            )
            .setFooter({ text: 'Powodzenia! Pamiętaj, liczy się szybkość i wiedza.' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('quiz_answer')
            .setPlaceholder('Wybierz odpowiedź...')
            .addOptions(shuffledAnswers.map(ans => ({
                label: ans,
                value: ans
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        channel.send({ embeds: [embed], components: [row] }).then(msg => {
            this.activeQuiz.messageId = msg.id;

            // Timeout after 30 seconds
            setTimeout(async () => {
                if (this.activeQuiz && this.activeQuiz.messageId === msg.id) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#ff9e9e')
                        .setAuthor({ 
                            name: `' .gg/geekland × Koniec Czasu`, 
                            iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' 
                        })
                        .setDescription(
                            `\`\`\`❌ Niestety czas minął!\`\`\`` +
                            `> **Pytanie:** ${questionData.q}\n` +
                            `> **Poprawna odpowiedź:** \`${questionData.correct}\`\n\n` +
                            `*Spróbuj swoich sił w kolejnej rundzie!*`
                        );

                    await msg.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => { });
                    this.activeQuiz = null;
                }
            }, 30000);
        });
    }

    async handleInteraction(interaction) {
        if (!this.activeQuiz || interaction.customId !== 'quiz_answer') return;

        const answer = interaction.values[0];
        const isCorrect = answer === this.activeQuiz.correctAnswer;
        const question = this.activeQuiz.question;
        const correctAns = this.activeQuiz.correctAnswer;

        if (isCorrect) {
            this.activeQuiz = null;
            const xpAmount = 50;

            // Award XP (Manual bypass cooldown)
            const data = Levels.getData();
            if (!data[interaction.user.id]) data[interaction.user.id] = { xp: 0, level: 0, lastMessage: 0 };
            data[interaction.user.id].xp += xpAmount;

            let leveledUp = false;
            while (data[interaction.user.id].xp >= Levels.getXPForLevel(data[interaction.user.id].level)) {
                data[interaction.user.id].xp -= Levels.getXPForLevel(data[interaction.user.id].level);
                data[interaction.user.id].level++;
                leveledUp = true;
            }
            Levels.saveData(data);

            if (leveledUp) {
                await Levels.updateNickname(interaction.member, data[interaction.user.id].level);
                await Levels.notifyLevelUp(interaction.member, data[interaction.user.id].level);
            }

            const winEmbed = new EmbedBuilder()
                .setColor('#a3d9a5')
                .setAuthor({ 
                    name: `' .gg/geekland × Mamy Zwycięzcę!`, 
                    iconURL: 'https://cdn.discordapp.com/attachments/1501204172756746373/1501630185034743980/IMG_1515.jpg?ex=69fcc597&is=69fb7417&hm=d8b2f0b2aa3e63a9adce18f0548cb739f657d436cc94d38018279a32af80d52d&' 
                })
                .setDescription(
                    `\`\`\`🎉 Gratulacje ${interaction.user.username}!\`\`\`\n` +
                    `> **Pytanie:** ${question}\n` +
                    `> **Twoja odpowiedź:** \`${answer}\` (Poprawna!)\n\n` +
                    `> 💰 **Nagroda:** \`50 XP\` została dopisana do Twojego konta.`
                )
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

            await interaction.update({ embeds: [winEmbed], components: [] });
        } else {
            await interaction.reply({ content: '❌ To nie jest poprawna odpowiedź! Spróbuj ponownie (jeśli czas jeszcze nie minął).', ephemeral: true });
        }
    }
}

module.exports = Quiz;
