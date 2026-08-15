import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'chikita',
	name: 'CHIKITA',
	type: 'dog',
	isAdopted: false,
	gender: {
		en: 'female',
		uk: 'самка',
		de: 'weiblich',
		nl: 'vrouwtje'
	},
	breed: {
		en: 'mixed breed',
		uk: 'метис',
		de: 'Mischling',
		nl: 'gemengd ras'
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
		en: 'brown',
		uk: 'коричневий',
		de: 'braun',
		nl: 'bruin'
	},
	image: '/images/animals/dog_chikita.jpg',
	imagePosition: '30% 50%'
};

export const description: Translations = {
	en: [
		'My name is Chikita and I am a mixed breed dog.',
		'I was rescued on the front line in the Kherson region. I was alone and so I was used to relying only on myself. But in the shelter I met Shaggy, he became my best friend.',
		'It is still difficult for me to understand people and I keep my distance from them. I have never been petted or hugged, and I do not know what it is like to trust people. I am calm with other dogs, but I do not seek their company.',
		'I do not know what a home is, but maybe one day I will be able to understand what trust and love are. Because of my difficult past life, I will need an experienced owner.'
	],
	uk: [
		'Мене звати Чікіта, я — метис.',
		'Мене врятували на передовій у Херсонській області. Я була одна, тому звикла покладатися тільки на себе. Але в притулку я зустріла Шеггі, він став моїм найкращим другом.',
		'Мені все ще важко розуміти людей, тому я тримаюся від них на відстані. Мене ніколи не гладили і не обіймали, і я не знаю, що таке довіряти людям. Я спокійна з іншими собаками, але не шукаю їхньої компанії.',
		'Я не знаю, що таке дім, але, можливо, одного дня я зможу зрозуміти, що таке довіра та любов. Через моє важке минуле мені знадобиться досвідчений власник.'
	],
	de: [
		'Mein Name ist Chikita und ich bin eine Mischlingshündin.',
		'Ich wurde an der Frontlinie in der Region Cherson gerettet. Ich war allein und war es gewohnt, mich nur auf mich selbst zu verlassen. Aber im Tierheim traf ich Shaggy, er wurde mein bester Freund.',
		'Es fällt mir immer noch schwer, Menschen zu verstehen, und ich halte Abstand zu ihnen. Ich wurde noch nie gestreichelt oder umarmt, und ich weiß nicht, wie es ist, Menschen zu vertrauen.',
		'Ich weiß nicht, was ein Zuhause ist, aber vielleicht kann ich eines Tages verstehen, was Vertrauen und Liebe sind.'
	],
	nl: [
		'Mijn naam is Chikita en ik ben een gemengde rashond.',
		'Ik werd gered aan de frontlinie in de regio Kherson. Ik was alleen en was dus gewend om alleen op mezelf te vertrouwen. Maar in het asiel ontmoette ik Shaggy, hij werd mijn beste vriend.',
		'Het is voor mij nog steeds moeilijk om mensen te begrijpen en ik houd afstand van hen. Ik ben nog nooit geaaid of geknuffeld, en ik weet niet hoe het is om mensen te vertrouwen.',
		'Ik weet niet wat een thuis is, maar misschien kan ik op een dag begrijpen wat vertrouwen en liefde zijn.'
	]
};
