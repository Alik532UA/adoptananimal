import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'tobey',
	name: 'TOBEY',
	type: 'dog',
	isAdopted: false,
	gender: {
		en: 'male (castrated)',
		uk: 'самець (кастрований)',
		de: 'männlich (kastriert)',
		nl: 'mannetje (gecastreerd)'
	},
	breed: {
		en: 'mixed breed',
		uk: 'метис',
		de: 'Mischling',
		nl: 'gemengd ras'
	},
	// 7 months on 2024-09-21, the date on document 4.
	bornOn: '2024-02-21',
	size: {
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'white',
		uk: 'білий',
		de: 'weiß',
		nl: 'wit'
	},
	image: '/images/animals/dog_tobey.jpg'
};

export const description: Translations = {
	en: [
		'My name is Tobey and I am a mixed breed dog.',
		'I was rescued from a destroyed school in the Kherson region. There, among the rubble and constant loud sounds, I was all alone. And all I had there was fear.',
		"I am much better now, but communication is still very difficult for me. I don't trust people, but I love the company of other dogs, they help me cope with all my problems.",
		'To be honest, my fear is stronger than me at the moment. But I am quite curious. I want to know what the world is like when there is no fear. I look at people with caution, but I think they can be kind.',
		'I still need a long rehabilitation after what happened to me, but I am sure that with the right person I will succeed.'
	],
	uk: [
		'Мене звати Тобі, я — метис.',
		'Мене врятували зі зруйнованої школи в Херсонській області. Там, серед руїн і постійних гучних звуків, я був зовсім один. І все, що у мене було — це страх.',
		'Зараз мені набагато краще, але спілкування все ще дається мені дуже важко. Я не довіряю людям, але обожнюю компанію інших собак, вони допомагають мені справлятися з усіма проблемами.',
		'Чесно кажучи, зараз мій страх сильніший за мене. Але я досить допитливий. Я хочу знати, який світ там, де немає страху. Я дивлюся на людей з пересторогою, але думаю, що вони можуть бути добрими.',
		'Мені все ще потрібна тривала реабілітація після того, що сталося, але я впевнений, що з правильною людиною у мене все вийде.'
	],
	de: [
		'Mein Name ist Tobey und ich bin ein Mischlingshund.',
		'Ich wurde aus einer zerstörten Schule in der Region Cherson gerettet. Dort, zwischen den Trümmern und ständigen lauten Geräuschen, war ich ganz allein. Und alles, was ich dort hatte, war Angst.',
		'Jetzt geht es mir viel besser, aber die Kommunikation fällt mir immer noch sehr schwer. Ich vertraue Menschen nicht, aber ich liebe die Gesellschaft anderer Hunde, sie helfen mir, mit all meinen Problemen fertig zu werden.',
		'Um ehrlich zu sein, ist meine Angst im Moment stärker als ich. Aber ich bin ziemlich neugierig. Ich möchte wissen, wie die Welt ist, wenn es keine Angst gibt. Ich betrachte Menschen mit Vorsicht, aber ich denke, sie können gütig sein.',
		'Ich brauche nach dem, was mir passiert ist, immer noch eine lange Rehabilitation, aber ich bin mir sicher, dass ich mit der richtigen Person Erfolg haben werde.'
	],
	nl: [
		'Mijn naam is Tobey en ik ben een gemengde rashond.',
		'Ik werd gered uit een verwoeste school in de regio Kherson. Daar, tussen het puin en de constante harde geluiden, was ik helemaal alleen. En alles wat ik daar had was angst.',
		'Het gaat nu veel beter met me, maar communicatie is nog steeds erg moeilijk voor me. Ik vertrouw mensen niet, maar ik hou van het gezelschap van andere honden, zij helpen me met al mijn problemen om te gaan.',
		'Om eerlijk te zijn is mijn angst op dit moment sterker dan ik. Maar ik ben best nieuwsgierig. Ik wil weten hoe de wereld is als er geen angst is. Ik kijk naar mensen met voorzichtigheid, maar ik denk dat ze vriendelijk kunnen zijn.',
		'Ik heb nog steeds een lange rehabilitatie nodig na wat er met mij is gebeurd, maar ik weet zeker dat het me met de juiste persoon zal lukken.'
	]
};
