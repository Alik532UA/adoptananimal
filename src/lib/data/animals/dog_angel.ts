import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'angel',
	name: 'ANGEL',
	type: 'dog',
	isAdopted: false,
	gender: {
		en: 'female',
		uk: 'самка',
		de: 'weiblich',
		nl: 'vrouwtje'
	},
	breed: {
		en: 'mixed breed (Corgi-like)',
		uk: 'метис (схожа на Коргі)',
		de: 'Mischling (Corgi-ähnlich)',
		nl: 'gemengd ras (Corgi-achtig)'
	},
	age: {
		en: '2 years',
		uk: '2 роки',
		de: '2 Jahre',
		nl: '2 jaar'
	},
	size: {
		en: 'small',
		uk: 'малий',
		de: 'klein',
		nl: 'klein'
	},
	color: {
		en: 'brown and white',
		uk: 'коричнево-білий',
		de: 'braun-weiß',
		nl: 'bruin-wit'
	},
	image: '/images/animals/dog_angel.jpg'
};

export const description: Translations = {
	en: [
		'My name is Angel and I am a mixed breed dog.',
		'I was rescued from the front line in the Kherson region during a strong drone attack. I was found near a destroyed farm. The fields I used to run through became dangerous, and the family I loved was gone.',
		'I will probably never forget the day of my rescue. The drones were too loud and I thought I would not survive. But when I lost all hope, I heard a gentle voice. A girl stretched out her arms, hugged me and said: "I promise, now everything will be fine with you!".',
		"Now I am in a shelter and everyone calls me Angel. They say that I am very kind, and I guess that's true. Because of what I went through, my main feature has become - complete silence. I have practically forgotten how to make sounds, but this does not bother me, I am just a very quiet dog.",
		'I am really happy to be in the shelter, but I believe that very soon I will find my family who will love me and accept me as I am.'
	],
	uk: [
		'Мене звати Енджел (Ангел), я — метис.',
		'Мене врятували з передової на Херсонщині під час потужної атаки дронів. Мене знайшли біля зруйнованої ферми. Поля, якими я раніше бігала, стали небезпечними, а сім’я, яку я любила, зникла.',
		'Я ніколи не забуду день свого порятунку. Дрони гуділи занадто голосно, і я думала, що не виживу. Але коли я вже втратила надію, то почула ніжний голос. Дівчина простягнула руки, обійняла мене і сказала: «Обіцяю, тепер з тобою все буде добре!».',
		'Зараз я в притулку, і всі називають мене Енджел. Кажуть, що я дуже добра, і це, мабуть, правда. Через те, що я пережила, моєю головною рисою стала абсолютна тиша. Я практично розучилася видавати звуки, але це мене зовсім не турбує — я просто дуже тиха собака.',
		'Я справді щаслива бути в притулку, але вірю, що дуже скоро знайду свою сім’ю, яка любитиме і прийме мене такою, яка я є.'
	],
	de: [
		'Mein Name ist Angel und ich bin eine Mischlingshündin.',
		'Ich wurde während eines starken Drohnenangriffs aus der Region Cherson gerettet. Man fand mich in der Nähe eines zerstörten Bauernhofs. Die Felder, durch die ich früher rannte, wurden gefährlich, und die Familie, die ich liebte, war weg.',
		'Ich werde den Tag meiner Rettung wahrscheinlich nie vergessen. Die Drohnen waren zu laut. Aber als ich alle Hoffnung verlor, hörte ich eine sanfte Stimme. Ein Mädchen streckte ihre Arme aus, umarmte mich und sagte: „Ich verspreche dir, jetzt wird alles gut mit dir!“.',
		'Jetzt bin ich in einem Tierheim und alle nennen mich Angel. Man sagt, dass ich sehr gütig bin. Wegen dem, was ich durchgemacht habe, ist mein Hauptmerkmal – völlige Stille. Ich habe praktisch vergessen, wie man Töne macht.'
	],
	nl: [
		'Mijn naam is Angel en ik ben een gemengde rashond.',
		'Ik werd gered uit de regio Kherson tijdens een hevige drone-aanval. Ik werd gevonden in de buurt van een verwoeste boerderij. De velden waar ik vroeger doorheen rende werden gevaarlijk, en de familie van wie ik hield was weg.',
		'Ik zal de dag van mijn redding waarschijnlijk nooit vergeten. De drones waren te luid. Maar toen ik alle hoop verloor, hoorde ik een zachte stem. Een meisje strekte haar armen uit, omhelsde me en zei: "Ik beloof je, nu komt alles goed met je!".',
		'Nu zit ik in een asiel en iedereen noemt me Angel. Ze zeggen dat ik heel lief ben. Door wat ik heb meegemaakt, is mijn belangrijkste kenmerk geworden - volledige stilte. Ik ben praktisch vergeten hoe ik geluid moet maken.'
	]
};
