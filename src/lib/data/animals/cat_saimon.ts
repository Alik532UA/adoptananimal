import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'saimon',
	name: 'SAIMON',
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
		en: '1 year',
		uk: '1 рік',
		de: '1 Jahr',
		nl: '1 jaar'
	},
	size: {
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'orange tabby',
		uk: 'рудий смугастий',
		de: 'rot getigert',
		nl: 'rode cyper'
	},
	image: '/images/animals/cat_saimon.jpg',
	imagePosition: '70% 50%'
};

export const description: Translations = {
	en: [
		'My name is Simon and I am a mixed breed cat.',
		'I once had a home, but I have been through so many things since then that I can no longer remember what it is like to be loved.',
		'The house where I lived turned out to be very close to the front line, so it was quickly gone, as was my family. Destroyed streets, loud explosions and constant fear became my normal everyday life. I hid wherever I could and hunger was always nearby.',
		'One day, I noticed people whom I had not seen for a long time. They had already come several times and I saw how they left food for animals like me in special feeders. I was always afraid to approach them, but this time hunger was stronger than me. So for the first time in a long time I ate my fill and trusted people again.',
		'While I was eating, one of them leaned over to me and said, "Hello, handsome green-eyed one, maybe you\'re ready to start a new life?".',
		"I don't know how or why, but something inside me started to shine again and I was ready to give all of myself to these people. And they picked me up, carefully put me in a carrier and took me away to a place where I would no longer have to survive.",
		"Now I'm in a shelter. There's food, warmth and most importantly - a sense of safety. So many people here tell me that I'm a very attentive boy, I love attention and I learn everything quickly."
	],
	uk: [
		'Мене звати Саймон, і я — кіт змішаної породи.',
		"Колись у мене був дім, але відтоді я пройшов через стільки всього, що вже не пам'ятаю, як це — бути коханим.",
		"Будинок, де я жив, виявився дуже близько до лінії фронту, тому він швидко зник, як і моя сім'я. Зруйновані вулиці, гучні вибухи та постійний страх стали моїм звичайним повсякденним життям. Я ховався де міг, і голод завжди був поруч.",
		'Одного разу я помітив людей, яких давно не бачив. Вони вже приїжджали кілька разів, і я бачив, як вони залишали їжу для таких тварин, як я, у спеціальних годівницях. Я завжди боявся підійти до них, але цього разу голод був сильнішим за мене. Тож вперше за довгий час я наївся досхочу і знову довірився людям.',
		'Поки я їв, один із них нахилився до мене і сказав: «Привіт, красень зеленоокий, може, ти готовий почати нове життя?».',
		'Не знаю як і чому, але щось всередині мене знову засяяло, і я був готовий віддати всього себе цим людям. І вони підняли мене, обережно поклали в переноску і повезли в місце, де мені більше не доведеться виживати.',
		'Тепер я в притулку. Тут є їжа, тепло і найголовніше — відчуття безпеки. Багато людей тут кажуть мені, що я дуже уважний хлопчик, я люблю увагу і всьому швидко вчуся.',
		'Минуле навчило мене цінувати прості речі. Тож усе, чого я чекатиму від людей, які вирішать мене всиновити — це любов і турбота. Це небагато, але це означає абсолютно все.'
	],
	de: [
		'Mein Name ist Simon und ich bin eine Mischlingskatze.',
		'Früher hatte ich ein Zuhause, aber seither habe ich so viele Dinge durchgemacht, dass ich mich nicht mehr daran erinnern kann, wie es ist, geliebt zu werden.',
		'Das Haus, in dem ich lebte, lag sehr nah an der Frontlinie, so dass es schnell weg war, genau wie meine Familie. Zerstörte Straßen, laute Explosionen und ständige Angst wurden zu meinem normalen Alltag.',
		'Eines Tages bemerkte ich Menschen, die ich schon lange nicht mehr gesehen hatte. Sie hatten schon mehrmals Futter für Tiere wie mich hinterlassen. Hunger war stärker als die Angst, und zum ersten Mal seit langer Zeit vertraute ich den Menschen wieder.',
		'Jetzt bin ich in einem Tierheim. Es gibt Futter, Wärme und vor allem – ein Gefühl der Sicherheit.'
	],
	nl: [
		'Mijn naam is Simon en ik ben een gemengde raskat.',
		'Ooit had ik een thuis, maar ik heb sindsdien zoveel dingen meegemaakt dat ik me niet meer kan herinneren hoe het is om bemind te worden.',
		'Het huis waar ik woonde bleek heel dicht bij de frontlinie te liggen, dus het was al snel weg, net als mijn familie. Verwoeste straten, harde explosies en constante angst werden mijn normale dagelijkse leven.',
		'Op een dag zag ik mensen die ik al lang niet meer had gezien. Ze hadden al een paar keer eten achtergelaten voor dieren zoals ik. De honger was sterker dan de angst, en voor het eerst in lange tijd vertrouwde ik de mensen weer.',
		'Nu zit ik in een asiel. Er is eten, warmte en het belangrijkste - een gevoel van veiligheid.'
	]
};
