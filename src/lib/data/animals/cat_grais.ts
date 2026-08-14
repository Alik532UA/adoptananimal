import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'grais',
	name: 'GRAIS',
	type: 'cat',
	isAdopted: false,
	gender: {
		en: 'male',
		uk: 'самець',
		de: 'männlich',
		nl: 'mannetje'
	},
	breed: {
		en: 'mixed breed',
		uk: 'метис',
		de: 'Mischling',
		nl: 'gemengd ras'
	},
	age: {
		en: '3 years',
		uk: '3 роки',
		de: '3 Jahre',
		nl: '3 jaar'
	},
	size: {
		en: 'large',
		uk: 'великий',
		de: 'groß',
		nl: 'groot'
	},
	color: {
		en: 'grey',
		uk: 'сірий',
		de: 'grau',
		nl: 'grijs'
	},
	image: '/images/animals/cat_grais.jpg'
};

export const description: Translations = {
	en: [
		'My name is Grais and I am a mixed breed cat.',
		'My house was in a small village in the Kherson region. Life was calm and wonderful, but I did not understand this until the war came to us. Literally everything changed in a few minutes. My owner disappeared, and all I had to do was hide in the basement of the house.',
		'It was very scary from the constant shelling, but sometimes, late at night, I would leave the basement to find some leftover food or drink some water from a puddle.',
		'But then the military entered the basement. They were shining flashlights, and I hid, thinking that they would chase me away. But instead I heard: “Hello, little one. Are you having as hard a time here as we are? We will take you away from here.” One of them carefully leaned over and extended his hand to me.',
		'Now I live in a shelter. I have my own bowl of food again, a warm blanket and people who come to me every day. They say that I am very gentle. I purr in response, letting them know that I am grateful for everything.'
	],
	uk: [
		'Мене звати Грейс, я — метис.',
		'Мій дім був у маленькому селі на Херсонщині. Життя було спокійним і чудовим, але я не розумів цього, поки до нас не прийшла війна. Буквально за кілька хвилин усе змінилося. Моя власниця зникла, і все, що мені залишалося — це ховатися в підвалі будинку.',
		'Було дуже страшно через постійні обстріли, але іноді, пізно вночі, я виходив із підвалу, щоб знайти залишки їжі або попити води з калюжі.',
		'Але потім у підвал зайшли військові. Вони світили ліхтариками, і я заховся, думаючи, що вони мене проженуть. Але замість цього почув: «Привіт, малюку. Тобі тут так само важко, як і нам? Ми заберемо тебе звідси». Один із них обережно нахилився і простягнув мені руку.',
		'Зараз я живу в притулку. У мене знову є своя миска з їжею, тепла ковдра і люди, які приходять до мене щодня. Кажуть, що я дуже ніжний. Я муркочу у відповідь, даючи їм знати, що я за все вдячний.'
	],
	de: [
		'Mein Name ist Grais und ich bin eine Mischlingskatze.',
		'Mein Haus stand in einem kleinen Dorf in der Region Cherson. Das Leben war ruhig und wunderbar, aber ich verstand das nicht, bis der Krieg zu uns kam. Buchstäblich alles änderte sich in wenigen Minuten. Mein Besitzer verschwand, und mir blieb nichts anderes übrig, als mich im Keller des Hauses zu verstecken.',
		'Vom ständigen Beschuss war es sehr beängstigend, aber manchmal, spät in der Nacht, verließ ich den Keller, um ein paar Essensreste zu finden oder etwas Wasser aus einer Pfütze zu trinken.',
		'Aber dann drangen Militärs in den Keller ein. Sie leuchteten mit Taschenlampen, und ich versteckte mich in der Annahme, sie würden mich verjagen. Aber stattdessen hörte ich: „Hallo, Kleiner. Hast du es hier genauso schwer wie wir? Wir werden dich hier wegnehmen.“',
		'Jetzt lebe ich in einem Tierheim. Ich habe wieder meinen eigenen Napf mit Futter, eine warme Decke und Menschen, die jeden Tag zu mir kommen.'
	],
	nl: [
		'Mijn naam is Grais en ik ben een gemengde raskat.',
		'Mijn huis stond in een klein dorpje in de regio Kherson. Het leven was rustig en prachtig, maar ik begreep dit pas toen de oorlog naar ons toe kwam. Letterlijk alles veranderde in een paar minuten. Mijn eigenaar verdween, en het enige wat ik hoefde te doen was me verstoppen in de kelder van het huis.',
		'Het was erg eng door de constante beschietingen, maar soms, laat in de nacht, verliet ik de kelder om wat etensresten te vinden of wat water uit een plas te drinken.',
		'Maar toen kwamen er militairen de kelder binnen. Ze schenen met zaklampen, en ik verstopte me, denkend dat ze me zouden wegjagen. Maar in plaats daarvan hoorde ik: "Hallo, kleintje. Heb jij het hier net zo zwaar als wij? We nemen je hier weg."',
		'Nu woon ik in een asiel. Ik heb weer mijn eigen bakje met eten, een warme deken en mensen die elke dag bij me komen.'
	]
};
