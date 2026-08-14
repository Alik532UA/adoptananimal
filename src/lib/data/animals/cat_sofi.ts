import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'sofi',
	name: 'SOFI',
	type: 'cat',
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
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'cream',
		uk: 'кремовий',
		de: 'cremefarben',
		nl: 'crème'
	},
	image: '/images/animals/cat_sofi.jpg'
};

export const description: Translations = {
	en: [
		'My name is Sofi and I am a Russian Blue cat.',
		'I once had a home. I remember a cozy sofa, toys and people who were everything to me. But then the war came to our city. One day they left, the door closed, and I was left alone.',
		'I found myself locked in. I had no chance to survive in a closed apartment. At some point, hopelessness swallowed me up and all I could do was scream. And I was heard! These were unusual people who cared about me. They made a hole in the door of my apartment and I was able to get out.',
		"After that, I ended up in a shelter. It wasn't hard for me to find my place here, because I love the company of other cats and of course people. I'm ready to spend all my time with someone.",
		"I'm happy to be in the shelter and very grateful that I was rescued from a closed abandoned apartment, but I believe that one day I will again have a chance to feel the warmth of a family and my own home."
	],
	uk: [
		'Мене звати Софі, я — руська блакитна.',
		'Колись у мене був дім. Я пам’ятаю затишний диван, іграшки та людей, які були для мене всім. Але потім у наше місто прийшла війна. Одного разу вони пішли, двері зачинилися, і я залишилася одна.',
		'Я опинилася замкненою. У мене не було шансів вижити в зачиненій квартирі. У якийсь момент відчай поглинув мене, і все, що я могла робити — це кричати. І мене почули! Це були небайдужі люди. Вони зробили отвір у дверях моєї квартири, і я змогла через нього вибратися.',
		'Після цього я потрапила до притулку. Мені було зовсім не важко знайти тут своє місце, бо я обожнюю компанію інших котів і, звичайно, людей. Я готова проводити з кимось увесь свій час.',
		'Я щаслива бути в притулку і дуже вдячна за те, що мене врятували із замкненої покинутої квартири, але вірю, що одного дня знову матиму шанс відчути тепло сім’ї та власного дому.'
	],
	de: [
		'Mein Name ist Sofi und ich bin eine Russisch Blau Katze.',
		'Ich hatte einmal ein Zuhause. Ich erinnere mich an ein gemütliches Sofa, Spielzeug und Menschen, die mir alles bedeuteten. Aber dann kam der Krieg in unsere Stadt. Eines Tages gingen sie, die Tür schloss sich, und ich blieb allein zurück.',
		'Ich war eingesperrt. In einer geschlossenen Wohnung hatte ich keine Chance zu überleben. Irgendwann verschlang mich die Hoffnungslosigkeit und alles, was ich tun konnte, war zu schreien. Und ich wurde gehört!',
		'Es waren ungewöhnliche Menschen, die sich um mich kümmerten. Sie machten ein Loch in die Tür meiner Wohnung und ich konnte herauskommen. Danach landete ich in einem Tierheim. Ich liebe die Gesellschaft anderer Katzen und natürlich Menschen.'
	],
	nl: [
		'Mijn naam is Sofi en ik ben een Russisch Blauwe kat.',
		'Ik had ooit een thuis. Ik herinner me een gezellige bank, speelgoed en mensen die alles voor me betekenden. Maar toen kwam de oorlog in onze stad. Op een dag vertrokken ze, de deur ging dicht, en ik bleef alleen achter.',
		'Ik zat opgesloten. Ik had geen schijn van kans om te overleven in een afgesloten appartement. Op een gegeven moment slokte de hopeloosheid me op en het enige wat ik kon doen was schreeuwen. En ik werd gehoord!',
		'Het waren ongewone mensen die om me gaven. Ze maakten een gat in de deur van mijn appartement en ik kon naar buiten. Daarna ben ik in een asiel terechtgekomen. Ik hou van het gezelschap van andere katten en natuurlijk mensen.'
	]
};
