import fs from 'fs';

const dogOrder = [
	{ slug: 'gracie', isAdopted: false },
	{ slug: 'leila', isAdopted: true },
	{ slug: 'jessie', isAdopted: false },
	{ slug: 'lola', isAdopted: true },
	{ slug: 'shaggy', isAdopted: false },
	{ slug: 'chikita', isAdopted: false },
	{ slug: 'black-dog', isAdopted: false },
	{ slug: 'comet', isAdopted: false },
	{ slug: 'carly', isAdopted: true },
	{ slug: 'benny', isAdopted: false },
	{ slug: 'partos', isAdopted: false },
	{ slug: 'tobey', isAdopted: false },
	{ slug: 'button', isAdopted: true },
	{ slug: 'tilika', isAdopted: true },
	{ slug: 'multik', isAdopted: true },
	{ slug: 'vira', isAdopted: false },
	{ slug: 'flora', isAdopted: false },
	{ slug: 't-800', isAdopted: true },
	{ slug: 'lucky', isAdopted: true },
	{ slug: 'joe', isAdopted: false },
	{ slug: 'thea', isAdopted: false },
	{ slug: 'angel', isAdopted: true }
];

const catOrder = [
	{ slug: 'cucumber', isAdopted: true },
	{ slug: 'lynx', isAdopted: false },
	{ slug: 'tigress', isAdopted: true },
	{ slug: 'fluffy', isAdopted: false },
	{ slug: 'kira', isAdopted: false },
	{ slug: 'grey', isAdopted: true },
	{ slug: 'sirius', isAdopted: true },
	{ slug: 'trixi', isAdopted: false },
	{ slug: 'richard', isAdopted: false },
	{ slug: 'saimon', isAdopted: false },
	{ slug: 'molly', isAdopted: false },
	{ slug: 'mirabel', isAdopted: true },
	{ slug: 'basti', isAdopted: false },
	{ slug: 'patrik', isAdopted: false },
	{ slug: 'martin', isAdopted: false },
	{ slug: 'sofi', isAdopted: false },
	{ slug: 'starlet', isAdopted: true },
	{ slug: 'bill', isAdopted: false },
	{ slug: 'black', isAdopted: false },
	{ slug: 'nicole', isAdopted: true },
	{ slug: 'berry', isAdopted: false },
	{ slug: 'mia', isAdopted: false },
	{ slug: 'santa', isAdopted: false },
	{ slug: 'tyler', isAdopted: false },
	{ slug: 'fina', isAdopted: false },
	{ slug: 'demi', isAdopted: false },
	{ slug: 'grais', isAdopted: false },
	{ slug: 'cherry', isAdopted: false }
];

console.log('=== CHECKING STATUS MISMATCHES ===');

for (const d of dogOrder) {
	const content = fs.readFileSync(`src/lib/data/animals/dog_${d.slug}.ts`, 'utf8');
	const isAdoptedMatch = content.match(/isAdopted:\s*(true|false)/);
	const currentStatus = isAdoptedMatch ? isAdoptedMatch[1] === 'true' : null;
	if (currentStatus !== d.isAdopted) {
		console.log(`Dog ${d.slug}: current=${currentStatus}, canonical=${d.isAdopted}`);
	}
}

for (const c of catOrder) {
	const content = fs.readFileSync(`src/lib/data/animals/cat_${c.slug}.ts`, 'utf8');
	const isAdoptedMatch = content.match(/isAdopted:\s*(true|false)/);
	const currentStatus = isAdoptedMatch ? isAdoptedMatch[1] === 'true' : null;
	if (currentStatus !== c.isAdopted) {
		console.log(`Cat ${c.slug}: current=${currentStatus}, canonical=${c.isAdopted}`);
	}
}
