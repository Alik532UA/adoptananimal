import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'lola',
	name: 'LOLA',
	type: 'dog',
	isAdopted: true,
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
	age: {
		en: '1.4 years',
		uk: '1.4 роки',
		de: '1.4 Jahre',
		nl: '1.4 jaar'
	},
	size: {
		en: 'small',
		uk: 'малий',
		de: 'klein',
		nl: 'klein'
	},
	color: {
		en: 'beige',
		uk: 'бежевий',
		de: 'beige',
		nl: 'beige'
	},
	image: '/images/animals/dog_lola.jpg'
};

export const description: Translations = {
	en: [
		'My name is Lola and I am a mixed breed dog.',
		'I was rescued by Ukrainian soldiers right during the brutal fighting on the front lines in the East of Ukraine.',
		'I am a very sweet girl and not very big so I will not take up much space. I love human attention and I am inquisitive, I love to explore everything during walks.',
		'I can be a bit mischievous, so it is important that my new family has a safe fenced garden. I am smart, very trainable, and well socialized with other dogs.'
	],
	uk: [
		'Мене звати Лола, я — метис.',
		'Мене врятували українські солдати прямо під час запеклих боїв на передовій на сході України.',
		'Я дуже мила дівчинка і зовсім невелика, тому не займу багато місця. Я обожнюю людську увагу і дуже допитлива — люблю все досліджувати під час прогулянок.',
		'Я можу бути трохи пустотливою, тому важливо, щоб у моєї нової сім’ї був безпечний огороджений садок. Я розумна, добре піддаюся дресируванню і чудово ладнаю з іншими собаками.'
	],
	de: [
		'Mein Name ist Lola und ich bin eine Mischlingshündin.',
		'Ich wurde von ukrainischen Soldaten direkt während der heftigen Kämpfe an der Front im Osten der Ukraine gerettet.',
		'Ich bin ein sehr süßes Mädchen und nicht sehr groß, sodass ich nicht viel Platz wegnehme. Ich liebe menschliche Aufmerksamkeit und bin wissbegierig; ich liebe es, bei Spaziergängen alles zu erkunden.',
		'Ich kann ein bisschen frech sein, daher ist es wichtig, dass meine neue Familie einen sicheren, eingezäunten Garten hat. Ich bin klug, sehr lernwillig und gut mit anderen Hunden sozialisiert.'
	],
	nl: [
		'Mijn naam is Lola en ik ben een gemengde rashond.',
		'Ik ben gered door Oekraïense soldaten midden in de hevige gevechten aan de frontlinie in het oosten van Oekraïne.',
		'Ik ben een heel lief meisje en niet erg groot, dus ik zal niet veel ruimte in beslag nemen. Ik hou van menselijke aandacht en ik ben leergierig, ik hou ervan om alles te ontdekken tijdens wandelingen.',
		'Ik kan een beetje ondeugend zijn, dus het is belangrijk dat mijn nieuwe gezin een veilige omheinde tuin heeft. Ik ben slim, zeer trainbaar en goed gesocialiseerd met andere honden.'
	]
};
