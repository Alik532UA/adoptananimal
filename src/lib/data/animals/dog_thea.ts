import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'thea',
	name: 'THEA',
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
		en: '3 years',
		uk: '3 роки',
		de: '3 Jahre',
		nl: '3 jaar'
	},
	size: {
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'black and brown',
		uk: 'чорно-коричневий',
		de: 'schwarz-braun',
		nl: 'zwart-bruin'
	},
	image: '/images/animals/dog_thea.jpg'
};

export const description: Translations = {
	en: [
		'My name is Thea and I am a mixed breed dog.',
		'I was rescued from a destroyed farm in the Kherson region during a drone attack. Before the war, I had a loving family, but when the tanks came, they disappeared and I was left alone.',
		'On the day of my rescue, a girl in a helmet and bulletproof vest found me. She covered me with her body from the shrapnel and was even wounded herself. She is the bravest person I have ever seen.',
		'Now in the shelter I feel good again. I love the company of other dogs. I have a very unusual lower jaw, which is my special feature. My biggest dream is to have a loving family and a forever home again.'
	],
	uk: [
		'Мене звати Тея, я — метис.',
		'Мене врятували зі зруйнованої ферми на Херсонщині під час атаки дронів. До війни у мене була любляча сім’я, але коли прийшли танки, вони зникли, і я залишилася зовсім одна.',
		'У день мого порятунку мене знайшла дівчина в шоломі та бронежилеті. Вона прикрила мене своїм тілом від осколків і навіть сама отримала поранення. Вона найсміливіша людина, яку я коли-небудь бачила.',
		'Зараз у притулку мені знову добре. Я обожнюю компанію інших собак. У мене дуже незвичайна нижня щелепа — це моя особливість. Моя найбільша мрія — знову мати люблячу сім’ю і дім назавжди.'
	],
	de: [
		'Mein Name ist Thea und ich bin eine Mischlingshündin.',
		'Ich wurde während eines Drohnenangriffs von einem zerstörten Bauernhof in der Region Cherson gerettet. Vor dem Krieg hatte ich eine liebevolle Familie, aber als die Panzer kamen, verschwanden sie und ich blieb allein zurück.',
		'Am Tag meiner Rettung fand mich ein Mädchen in Helm und schusssicherer Weste. Sie schützte mich mit ihrem Körper vor den Granatsplittern und wurde dabei sogar selbst verwundet. Sie ist der mutigste Mensch, den ich je gesehen habe.',
		'Jetzt im Tierheim fühle ich mich wieder gut. Ich liebe die Gesellschaft anderer Hunde. Ich habe einen sehr ungewöhnlichen Unterkiefer, der mein besonderes Merkmal ist. Mein größter Traum ist es, wieder eine liebevolle Familie und ein endgültiges Zuhause zu haben.'
	],
	nl: [
		'Mijn naam is Thea en ik ben een gemengde rashond.',
		'Ik werd gered van een verwoeste boerderij in de regio Kherson tijdens een drone-aanval. Voor de oorlog had ik een liefdevol gezin, maar toen de tanks kwamen, verdwenen ze en bleef ik alleen achter.',
		'Op de dag van mijn redding vond een meisje met een helm en een kogelvrij vest me. Ze bedekte me met haar lichaam tegen de scherven en raakte zelf zelfs gewond. Ze is de dapperste persoon die ik ooit heb gezien.',
		'Nu in het asiel voel ich me weer goed. Ik hou van het gezelschap van andere honden. Ik heb een zeer ongewone onderkaak, wat mijn speciale kenmerk is. Mijn grootste droom is om weer een liefdevol gezin en een forever home te hebben.'
	]
};
