import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'tilika',
	name: 'TILIKA',
	type: 'dog',
	isAdopted: false,
	gender: {
		en: 'female',
		uk: 'самка',
		de: 'weiblich',
		nl: 'vrouwtje'
	},
	breed: {
		en: 'Pomeranian Spitz',
		uk: 'померанський шпіц',
		de: 'Zwergspitz',
		nl: 'Dwergkees'
	},
	age: {
		en: '5 years',
		uk: '5 років',
		de: '5 Jahre',
		nl: '5 jaar'
	},
	size: {
		en: 'tiny',
		uk: 'мініатюрний',
		de: 'winzig',
		nl: 'zeer klein'
	},
	color: {
		en: 'white',
		uk: 'білий',
		de: 'weiß',
		nl: 'wit'
	},
	image: '/images/animals/dog_tilika.jpg'
};

export const description: Translations = {
	en: [
		'My name is Tilika and I am a Pomeranian Spitz.',
		'I was rescued from an illegal breeding farm in a war zone. I lived in a small cage all my life, used only as a reproduction machine. We had no care, no love, only fear and hunger.',
		'In the end, we were abandoned during the shelling. After my rescue, I saw this life from a different side, I realized that it can be filled with something special.',
		'It has become very important for me to spend as much time as possible with people, and it also turns out that I love walking outside, playing and exploring this completely new world for me.',
		'Sometimes it is not easy for me because of my health and my age, but I am sure that there are no unsolvable issues. I will be ready to give my whole life and my whole heart to the one who decides to adopt me.'
	],
	uk: [
		'Мене звати Тіліка, я — померанський шпіц.',
		'Мене врятували з нелегальної ферми розведення в зоні бойових дій. Я все життя прожила в маленькій клітці, мене використовували лише як машину для розмноження. У нас не було ні догляду, ні любові, тільки страх і голод.',
		'Зрештою, нас покинули під час обстрілів. Після порятунку я побачила це життя з іншого боку, зрозуміла, що воно може бути сповнене чогось особливого.',
		'Для мене стало дуже важливо проводити якомога більше часу з людьми, а також виявилося, що я обожнюю гуляти на вулиці, гратися і досліджувати цей абсолютно новий для мене світ.',
		'Іноді мені буває нелегко через здоров’я та вік, але я впевнена, що немає проблем, які не можна вирішити. Я готова віддати все своє життя і все своє серце тому, хто вирішить мене всиновити.'
	],
	de: [
		'Mein Name ist Tilika und ich bin ein Zwergspitz.',
		'Ich wurde von einer illegalen Zuchtfarm in einem Kriegsgebiet gerettet. Ich habe mein ganzes Leben in einem kleinen Käfig gelebt und wurde nur als Fortpflanzungsmaschine benutzt. Wir hatten keine Pflege, keine Liebe, nur Angst und Hunger.',
		'Am Ende wurden wir während des Beschusses ausgesetzt. Nach meiner Rettung habe ich dieses Leben von einer anderen Seite gesehen und gemerkt, dass es mit etwas Besonderem erfüllt sein kann.',
		'Es ist mir sehr wichtig geworden, so viel Zeit wie möglich mit Menschen zu verbringen, und es stellt sich auch heraus, dass ich es liebe, draußen spazieren zu gehen, zu spielen und diese völlig neue Welt für mich zu erkunden.',
		'Ich werde bereit sein, mein ganzes Leben und mein ganzes Herz demjenigen zu geben, der sich für meine Adoption entscheidet.'
	],
	nl: [
		'Mijn naam is Tilika en ik ben een Dwergkees.',
		'Ik ben gered van een illegale fokkerij in een oorlogsgebied. Ik heb mijn hele leven in een kleine kooi geleefd, alleen gebruikt als reproductiemachine. We hadden geen zorg, geen liefde, alleen angst en honger.',
		'Uiteindelijk werden we achtergelaten tijdens de beschietingen. Na mijn redding zag ik dit leven van een andere kant, ik realiseerde me dat het gevuld kan zijn met iets speciaals.',
		'Het is voor mij heel belangrijk geworden om zoveel mogelijk tijd met mensen door te brengen, en het blijkt ook dat ik het heerlijk vind om buiten te wandelen, te spelen en deze compleet nieuwe wereld voor mij te verkennen.',
		'Ik zal bereid zijn om mijn hele leven en mijn hele hart te geven aan degene die besluit mij te adopteren.'
	]
};
