import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'santa',
	name: 'SANTA',
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
		en: '2 years',
		uk: '2 роки',
		de: '2 Jahre',
		nl: '2 jaar'
	},
	size: {
		en: 'large',
		uk: 'великий',
		de: 'groß',
		nl: 'groot'
	},
	color: {
		en: 'white',
		uk: 'білий',
		de: 'weiß',
		nl: 'wit'
	},
	image: '/images/animals/cat_santa.jpg',
	imagePosition: '30% 50%'
};

export const description: Translations = {
	en: [
		'My name is Santa and I am a mixed breed cat.',
		'My past was cold and lonely, like the winter I was left alone in. I once had a home, but the war changed everything. I lost both my home and the people I loved. All that was left were ruined walls and empty streets where I searched for a warm place and at least some food.',
		'I hid in basements, sometimes climbed into empty cars to wait out the nights. I was used to the cold and hunger, but not used to loneliness. All I wanted was to be close to someone again, someone who would not pass by.',
		"And one day the military found me. I was sitting on the stairs of a ruined house, not trying to run away. They picked me up in their arms, and for the first time in a long time I felt that someone cared about me again. That's how I ended up in a shelter. Here everyone started calling me Santa, in honor of that winter, which became the beginning of a new life for me.",
		'I am calm, gentle and love attention. I adore warm sofas and soft blankets. I also really love when people pet me and talk to me quietly.',
		"My past was hard, but I'm ready for a new life with care, warmth and a home where I'll never be left alone again."
	],
	uk: [
		'Мене звати Санта, і я — кішка змішаної породи.',
		'Моє минуле було холодним і самотнім, як зима, в якій я залишилася одна. Колись у мене був дім, але війна все змінила. Я втратила і дім, і людей, яких любила. Все, що залишилося — це зруйновані стіни та порожні вулиці, де я шукала тепле місце і хоч якусь їжу.',
		'Я ховалася в підвалах, іноді забиралася в порожні машини, щоб перечекати ночі. Я звикла до холоду та голоду, але не звикла до самотності. Все, чого я хотіла — це знову бути поруч із кимось, хто не пройде повз.',
		'І одного разу військові знайшли мене. Я сиділа на сходах зруйнованого будинку, не намагаючись втекти. Вони взяли мене на руки, і вперше за довгий час я відчула, що про мене знову хтось піклується. Ось так я опинилася в притулку. Тут мене всі почали називати Сантою, на честь тієї зими, яка стала для мене початком нового життя.',
		"Я спокійна, ніжна і люблю увагу. Обожнюю теплі дивани та м'які ковдри. Також я дуже люблю, коли люди мене гладять і тихо зі мною розмовляють.",
		'Моє минуле було важким, але я готова до нового життя з турботою, теплом і домом, де мене більше ніколи не залишать одну.'
	],
	de: [
		'Mein Name ist Santa und ich bin eine Mischlingskatze.',
		'Meine Vergangenheit war kalt und einsam, wie der Winter, in dem ich allein gelassen wurde. Früher hatte ich ein Zuhause, aber der Krieg hat alles verändert. Ich habe sowohl mein Zuhause als auch die Menschen, die ich liebte, verloren.',
		'Ich versteckte mich in Kellern, kletterte manchmal in leere Autos, um die Nächte abzuwarten. Ich war an Kälte und Hunger gewöhnt, aber nicht an die Einsamkeit.',
		'Und eines Tages fand mich das Militär. Ich saß auf der Treppe eines ruinierten Hauses. Sie nahmen mich auf den Arm, und zum ersten Mal seit langer Zeit spürte ich, dass sich wieder jemand um mich kümmerte.',
		'Jetzt nannten mich alle Santa, zu Ehren jenes Winters, der für mich der Beginn eines neuen Lebens war. Ich bin ruhig, sanft und liebe Aufmerksamkeit.'
	],
	nl: [
		'Mijn naam is Santa en ik ben een gemengde raskat.',
		'Mijn verleden was koud en eenzaam, net als de winter waarin ik alleen werd gelaten. Ooit had ik een thuis, maar de oorlog veranderde alles. Ik verloor zowel mijn huis als de mensen van wie ik hield.',
		"Ik verstopte me in kelders, klom soms in lege auto's om de nachten af te wachten. Ik was gewend aan de kou en de honger, maar niet aan de eenzaamheid.",
		'En op een dag vond het leger mij. Ik zat op de trap van een verwoest huis. Ze namen me in hun armen en voor het eerst in lange tijd voelde ik dat er weer iemand om me gaf.',
		'Hier begon iedereen me Santa te noemen, ter ere van die winter die voor mij het begin van een nieuw leven werd. Ik ben rustig, zachtaardig en hou van aandacht.'
	]
};
