import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'demi',
	name: 'DEMI',
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
		en: 'small',
		uk: 'малий',
		de: 'klein',
		nl: 'klein'
	},
	color: {
		en: 'calico',
		uk: 'триколірна (каліко)',
		de: 'Glückskatze',
		nl: 'lapjeskat'
	},
	image: '/images/animals/cat_demi.jpg'
};

export const description: Translations = {
	en: [
		'My name is Demi and I am a mixed breed cat.',
		'My past is not like a warm fairy tale. I lived near the front line, where explosions were a common occurrence. I had a home and food, but it all disappeared in one day – along with the people who once loved me.',
		'I was left alone among the destroyed houses. I hid in basements and tried to become invisible. But one day I came across people, they were also sitting underground, like me. They were soldiers, kind and even shared food with me. For some time I lived with them at their position, but the time came, and they were forced to move from there. And then I was transported to a shelter.',
		"That's how I ended up where I am now. It's warm and calm here. There are many cats here just like me, who have gone through real hell, so I find a common language with everyone. And to be honest, I've always loved company.",
		'Everyone tells me that I am quiet, affectionate and that I really appreciate care. I like it when people who speak calmly and softly are around, I love to sleep on a warm bed and just listen to how life around me becomes familiar again.',
		'The past taught me to be careful, but it did not take away my ability to trust and love. Now I am ready for a new life, where there is a home, care and confidence that all the worst is forever behind me.'
	],
	uk: [
		'Мене звати Демі, і я — кішка змішаної породи.',
		'Моє минуле не схоже на теплу казку. Я жила біля лінії фронту, де вибухи були звичною справою. У мене був дім і їжа, але все це зникло в один день — разом із людьми, які мене колись любили.',
		'Я залишилася одна серед зруйнованих будинків. Ховалася в підвалах і намагалася стати непомітною. Але одного разу я натрапила на людей, вони теж сиділи під землею, як і я. Це були солдати, добрі, вони навіть ділилися зі мною їжею. Якийсь час я жила з ними на їхній позиції, але прийшов час, і вони були змушені переїхати звідти. І тоді мене перевезли до притулку.',
		'Ось так я опинилася там, де я зараз. Тут тепло і спокійно. Тут багато таких самих котів, як і я, які пройшли через справжнє пекло, тому я з усіма знаходжу спільну мову. І якщо чесно, я завжди любила компанію.',
		"Всі кажуть мені, що я тиха, ласкава і що я дуже ціную турботу. Мені подобається, коли поруч люди, які розмовляють спокійно і м'яко, я люблю спати на теплому ліжку і просто слухати, як життя навколо мене знову стає звичним.",
		'Минуле навчило мене бути обережною, але воно не забрало у мене здатності довіряти і любити. Тепер я готова до нового життя, де є дім, турбота і впевненість, що все найгірше назавжди залишилося позаду.'
	],
	de: [
		'Mein Name ist Demi und ich bin eine Mischlingskatze.',
		'Meine Vergangenheit gleicht keinem warmen Märchen. Ich lebte in der Nähe der Frontlinie, wo Explosionen an der Tagesordnung waren. Ich hatte ein Zuhause und Futter, doch alles verschwand an einem Tag – zusammen mit den Menschen, die mich einst liebten.',
		'Ich blieb allein zwischen den zerstörten Häusern zurück. Ich versteckte mich in Kellern und versuchte, unsichtbar zu werden. Doch eines Tages stieß ich auf Menschen, die ebenfalls unter der Erde saßen, so wie ich. Es waren Soldaten, sie waren freundlich und teilten sogar ihr Essen mit mir.',
		'So landete ich dort, wo ich jetzt bin. Es ist warm und ruhig hier. Hier gibt es viele Katzen, genau wie mich, die durch die wahre Hölle gegangen sind, deshalb finde ich mit jedem eine gemeinsame Sprache.',
		'Alle sagen mir, dass ich ruhig und anhänglich bin und dass ich Fürsorge sehr zu schätzen weiß. Ich mag es, wenn Menschen um mich herum sind, die ruhig und sanft sprechen, ich liebe es, auf einem warmen Bett zu schlafen.',
		'Die Vergangenheit hat mich gelehrt, vorsichtig zu sein, aber sie hat mir nicht die Fähigkeit genommen, zu vertrauen und zu lieben. Jetzt bin ich bereit für ein neues Leben.'
	],
	nl: [
		'Mijn naam is Demi en ik ben een gemengde raskat.',
		'Mijn verleden lijkt niet op een warm sprookje. Ik woonde vlakbij de frontlinie, waar explosies aan de orde van de dag waren. Ik had een huis en eten, maar dat verdween allemaal op een dag – samen met de mensen die ooit van me hielden.',
		'Ik bleef alleen achter tussen de verwoeste huizen. Ik verstopte me in kelders en probeerde onzichtbaar te worden. Maar op een dag kwam ik mensen tegen, zij zaten ook onder de grond, net als ik. Het waren soldaten, ze waren vriendelijk en deelden zelfs hun eten met mij.',
		'Zo ben ik terechtgekomen waar ik nu ben. Het is hier warm en rustig. Er zijn hier veel katten net als ik, die door een ware hel zijn gegaan, dus ik vind met iedereen een gemeenschappelijke taal.',
		'Iedereen vertelt me dat ik rustig en aanhankelijk ben en dat ik zorg echt waardeer. Ik vind het fijn als er mensen in de buurt zijn die rustig en zachtjes praten, ik hou ervan om op een warm bed te slapen.',
		'Het verleden heeft me geleerd voorzichtig te zijn, maar het heeft me niet mijn vermogen om te vertrouwen en lief te hebben ontnomen. Nu ben ik klaar voor een nieuw leven.'
	]
};
