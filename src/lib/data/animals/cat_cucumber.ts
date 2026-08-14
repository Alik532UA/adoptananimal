import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'cucumber',
	name: 'CUCUMBER',
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
		en: 'small',
		uk: 'малий',
		de: 'klein',
		nl: 'klein'
	},
	color: {
		en: 'green-eyed grey',
		uk: 'сірий (зеленоокий)',
		de: 'grau (grünäugig)',
		nl: 'grijs (groenoog)'
	},
	image: '/images/animals/cat_cucumber.jpg'
};

export const description: Translations = {
	en: [
		'My name is Cucumber and I am a mixed breed cat.',
		'I had been living on the street for so long that I had forgotten what care and a warm home were. I had gotten used to absolutely everything, but my life became unbearable when the war began.',
		'Every day everything was getting worse and worse. I found less and less food and fewer and fewer kind people on my way. It was very difficult, especially when the shelling began and I had to hide in the ruins.',
		'But one day, strange people appeared. They brought food for animals and called everyone who was still alive. I realized that they could be trusted and finally dared to come closer.',
		'When they took me in their arms, I did not resist. I knew that this way I would start a new life. I feel comfortable in the shelter, everyone says that I am a very calm and confident cat. I think I will be perfect for any family.'
	],
	uk: [
		'Мене звати Кукумбер (Огірочок), я — метис.',
		'Я так довго жив на вулиці, що вже й забув, що таке турбота і теплий дім. Я звик до всього, але моє життя стало нестерпним, коли почалася війна. До цього ніхто не готовий.',
		'З кожним днем ставало все гірше й гірше. Я знаходив усе менше їжі та все менше добрих людей. Було дуже важко, особливо коли починалися обстріли, і мені доводилося ховатися в руїнах.',
		'Але одного дня з’явилися незнайомці. Вони принесли корм для тварин і кликали всіх, хто ще залишився живим. Я зрозумів, що їм можна довіряти, і нарешті наважився підійти ближче.',
		'Коли вони взяли мене на руки, я не пручався. Я знав, що так розпочнеться моє нове життя. Я почуваюся комфортно в притулку, всі тут кажуть, що я дуже спокійний і впевнений у собі кіт. Я стану ідеальним другом для будь-якої сім’ї.'
	],
	de: [
		'Mein Name ist Cucumber und ich bin eine Mischlingskatze.',
		'Ich habe so lange auf der Straße gelebt, dass ich vergessen hatte, was Pflege und ein warmes Zuhause sind. Ich hatte mich an absolut alles gewöhnt, aber mein Leben wurde unerträglich, als der Krieg begann.',
		'Jeden Tag wurde alles schlimmer und schlimmer. Ich fand immer weniger Futter und immer weniger freundliche Menschen auf meinem Weg. Es war sehr schwierig, besonders wenn der Beschuss begann und ich mich in den Ruinen zerstörter Häuser verstecken musste.',
		'Aber eines Tages tauchten an dem Ort, an dem ich normalerweise nach etwas Futter suchte, fremde Menschen auf. Sie brachten Futter für Tiere mit und verteilten es überall, wobei sie alle riefen, die noch am Leben waren.',
		'Als sie mich in ihre Arme nahmen und in eine Transportbox setzten, leistete ich keinen Widerstand. Ich wusste, dass ich so ein neues Leben beginnen würde und alles gut werden würde. Und genau das ist passiert. Ich fühle mich im Tierheim wohl.'
	],
	nl: [
		'Mijn naam is Cucumber en ik ben een gemengde raskat.',
		'Ik leefde al zo lang op straat dat ik vergeten was wat zorg en een warm huis waren. Ik was aan werkelijk alles gewend geraakt, maar mijn leven werd ondraaglijk toen de oorlog begon.',
		'Elke dag werd alles erger en erger. Ik vond steeds minder eten en steeds minder aardige mensen op mijn pad. Het was erg moeilijk, vooral toen de beschietingen begonnen en ik me moest verstoppen in de ruïnes van verwoeste huizen.',
		'Maar op een dag verschenen er vreemde mensen op de plek waar ik normaal gesproken naar wat eten zocht. Ze brachten voer voor dieren mee en strooiden het overal waar ze konden, terwijl ze iedereen riepen die nog in leven was.',
		'Toen ze me in hun armen namen en in een reismandje stopten, stribbelde ik niet tegen. Ik wist dat ik op deze manier een nieuw leven zou beginnen en dat alles goed zou komen. En dat is precies wat er is gebeurd.'
	]
};
