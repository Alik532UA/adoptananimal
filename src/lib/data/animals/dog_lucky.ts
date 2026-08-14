import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'lucky',
	name: 'LUCKY',
	type: 'dog',
	isAdopted: false,
	gender: {
		en: 'male',
		uk: 'самець',
		de: 'männlich',
		nl: 'mannetje'
	},
	breed: {
		en: 'mixed breed puppy',
		uk: 'цуценя-метис',
		de: 'Mischlingswelpe',
		nl: 'gemengde ras puppy'
	},
	age: {
		en: '0.4 years',
		uk: '0.4 року',
		de: '0.4 Jahre',
		nl: '0.4 jaar'
	},
	size: {
		en: 'small',
		uk: 'малий',
		de: 'klein',
		nl: 'klein'
	},
	color: {
		en: 'black and white',
		uk: 'чорно-білий',
		de: 'schwarz-weiß',
		nl: 'zwart-wit'
	},
	image: '/images/animals/dog_lucky.jpg'
};

export const description: Translations = {
	en: [
		'My name is Lucky and I am a mixed breed dog.',
		'I was saved completely by accident. A man caught me, tied me up, almost breaking my legs and ribs, put me in a bag and was taking me to the sea to drown me.',
		'Rescuers saw the bag tied to a bike and realized something alive was inside. Afterwards, I only remember already warm hugs, which gave me the opportunity to believe that good people exist.',
		'I have adapted and realized that I love to play with other dogs and people. In my short life I have learned what human cruelty is, but I will give all my affection and warmth to my new family.'
	],
	uk: [
		'Мене звати Лакі (Щасливчик), я — метис.',
		'Мене врятували зовсім випадково. Якийсь чоловік спіймав мене, зв’язав, мало не поламавши мені лапи та ребра, запхнув у мішок і везти до моря, щоб втопити.',
		'Рятувальники побачили мішок, прив’язаний до велосипеда, і зрозуміли, що всередині хтось живий. Після цього я пам’ятаю лише теплі обійми, які дали мені можливість повірити, що добрі люди існують.',
		'Я адаптувався і зрозумів, що обожнюю гратися з іншими собаками та людьми. За своє коротке життя я дізнався, що таке людська жорстокість, але я віддам усю свою ніжність і тепло своїй новій сім’ї.'
	],
	de: [
		'Mein Name ist Lucky und ich bin ein Mischlingshund.',
		'Ich wurde völlig zufällig gerettet. Ein Mann fing mich ein, fesselte mich, wobei er mir fast die Beine und Rippen brach, steckte mich in einen Sack und wollte mich zum Meer bringen, um mich zu ertränken.',
		'Retter sahen den Sack, der an einem Fahrrad festgebunden war, und merkten, dass etwas Lebendiges darin war. Danach erinnere ich mich nur noch an die warmen Umarmungen, die mir die Gewissheit gaben, dass es gute Menschen gibt.',
		'Ich habe mich eingelebt und gemerkt, dass ich es liebe, mit anderen Hunden und Menschen zu spielen. In meinem kurzen Leben habe ich erfahren, was menschliche Grausamkeit ist, aber ich werde meiner neuen Familie all meine Zuneigung und Wärme schenken.'
	],
	nl: [
		'Mijn naam is Lucky en ik ben een gemengde rashond.',
		'Ik ben volkomen toevallig gered. Een man ving me, bond me vast, waarbij hij bijna mijn poten en ribben brak, stopte me in een zak en nam me mee naar de zee om me te verdrinken.',
		'Redders zagen de zak die aan een fiets was vastgebonden en realiseerden zich dat er iets levends in zat. Daarna herinner ik me alleen nog de warme knuffels, die me de kans gaven te geloven dat er goede mensen bestaan.',
		'Ik heb me aangepast en me gerealiseerd dat ik het heerlijk vind om met andere honden en mensen te spelen. In mijn korte leven heb ik geleerd wat menselijke wreedheid is, maar ik zal al mijn genegenheid en warmte aan mijn nieuwe gezin geven.'
	]
};
