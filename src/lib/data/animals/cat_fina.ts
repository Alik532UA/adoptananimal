import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'fina',
	name: 'FINA',
	type: 'cat',
	isAdopted: false,
	gender: {
		en: 'female (spayed)',
		uk: 'самка (стерилізована)',
		de: 'weiblich (sterilisiert)',
		nl: 'vrouwtje (gesteriliseerd)'
	},
	breed: {
		en: 'mixed breed',
		uk: 'метис',
		de: 'Mischling',
		nl: 'gemengd ras'
	},
	// 3 years on 2025-07-09, the date on document 10.
	bornOn: '2022-07-09',
	size: {
		en: 'up to 4 kg',
		uk: 'до 4 кг',
		de: 'bis zu 4 kg',
		nl: 'tot 4 kg'
	},
	color: {
		en: 'black',
		uk: 'чорний',
		de: 'schwarz',
		nl: 'zwart'
	},
	image: '/images/animals/cat_fina.jpg',
	imagePosition: '0% 50%'
};

export const description: Translations = {
	en: [
		'My name is Fina and I am a mixed breed cat.',
		'My rescue story is not like others. I literally decided on my own that it was time to start a new life. One day, I just showed up at the shelter gates. Quietly, calmly, without making any unnecessary noise.',
		'I was very thin, with dull fur and a look that said more about me than any words. After my first vet check, they found massive beatings on my body. Severe hematomas, various bruises and wounds.',
		'When the people from the shelter saw me, they didn\'t chase me away. They opened the doors. One of them sat down next to me and quietly said, "Well, little one, did you choose us yourself?"',
		'It took me a while to learn to trust. For too long, I had to rely only on myself. But with each passing day, I understand more and more: no one will hurt me again.',
		'I came to the shelter myself because I knew: it was time to find my place. And I believe that one day a home will be found for me in which I will be taught to be truly happy and loved.'
	],
	uk: [
		'Мене звати Фіна, я — метис.',
		'Історія мого порятунку не схожа на інші. Я буквально сама вирішила, що настав час почати нове життя. Одного разу я просто з’явилася біля воріт притулку. Тихо, спокійно, без зайвого галасу.',
		'Я була дуже худою, з тьмяною шерстю і поглядом, який говорив про мене більше за будь-які слова. Після першого ветеринарного огляду на моєму тілі виявили сліди масивних побоїв. Сильні гематоми, численні синці та рани.',
		'Коли люди з притулку побачили мене, вони не прогнали мене. Вони відкрили двері. Один із них сів поруч і тихо сказав: «Ну що, маленька, ти сама нас обрала?».',
		'Мені знадобився час, щоб навчитися довіряти. Занадто довго мені доводилося покладатися тільки на себе. Але з кожним днем я все більше розумію: мене більше ніхто не скривдить.',
		'Я сама прийшла до притулку, бо знала: настав час знайти своє місце. І я вірю, що одного дня для мене знайдеться дім, де мене навчать бути справді щасливою та коханою.'
	],
	de: [
		'Mein Name ist Fina und ich bin eine Mischlingskatze.',
		'Meine Rettungsgeschichte ist nicht wie andere. Ich habe buchstäblich selbst entschieden, dass es an der Zeit war, ein neues Leben zu beginnen. Eines Tages tauchte ich einfach am Tor des Tierheims auf. Still, ruhig, ohne unnötigen Lärm zu machen.',
		'Ich war sehr dünn, mit stumpfem Fell und einem Blick, der mehr über mich aussagte als alle Worte. Nach meiner ersten Untersuchung beim Tierarzt fanden sie massive Schläge auf meinem Körper. Schwere Hämatome, verschiedene Prellungen und Wunden.',
		'Als die Leute vom Tierheim mich sahen, jagten sie mich nicht weg. Sie öffneten die Türen. Einer von ihnen setzte sich neben mich und sagte leise: „Na, Kleine, hast du uns selbst ausgesucht?“',
		'Es hat eine Weile gedauert, bis ich gelernt habe, zu vertrauen. Zu lange musste ich mich nur auf mich selbst verlassen.',
		'Ich kam selbst ins Tierheim, weil ich wusste: Es war an der Zeit, meinen Platz zu finden. Und ich glaube, dass eines Tages ein Zuhause für mich gefunden wird.'
	],
	nl: [
		'Mijn naam is Fina en ik ben een gemengde raskat.',
		'Mijn reddingsverhaal is anders dan andere. Ik heb letterlijk zelf besloten dat het tijd was om een nieuw leven te beginnen. Op een dag verscheen ik gewoon bij de poorten van het asiel. Stil, kalm, zonder onnodig lawaai te maken.',
		'Ik was erg mager, met een doffe vacht en een blik die meer over mij zei dan welke woorden dan ook. Na mijn eerste controle bij de dierenarts vonden ze massale mishandelingen op mijn lichaam. Ernstige hematomen, diverse kneuzingen en wonden.',
		'Toen de mensen van het asiel me zagen, joegen ze me niet weg. Ze openden de deuren. Een van hen ging naast me zitten en zei zachtjes: "Nou, kleintje, heb je ons zelf uitgekozen?"',
		'Het kostte me een tijdje om te leren vertrouwen. Te lang heb ik alleen op mezelf moeten rekenen.',
		'Ik kwam zelf naar het asiel omdat ik wist: het was tijd om mijn plek te vinden. En ik geloof dat er op een dag een thuis voor mij gevonden zal worden.'
	]
};
