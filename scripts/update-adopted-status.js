import fs from 'fs';

const adoptedDogs = [
	'leila',
	'lola',
	'carly',
	'button',
	'tilika',
	'multik',
	't-800',
	'lucky',
	'angel'
];
const adoptedCats = ['cucumber', 'tigress', 'grey', 'sirius', 'mirabel', 'starlet', 'nicole'];

for (const slug of adoptedDogs) {
	const file = `src/lib/data/animals/dog_${slug}.ts`;
	let content = fs.readFileSync(file, 'utf8');
	content = content.replace(/isAdopted:\s*false/g, 'isAdopted: true');
	fs.writeFileSync(file, content, 'utf8');
	console.log(`Updated ${file} -> isAdopted: true`);
}

for (const slug of adoptedCats) {
	const file = `src/lib/data/animals/cat_${slug}.ts`;
	let content = fs.readFileSync(file, 'utf8');
	content = content.replace(/isAdopted:\s*false/g, 'isAdopted: true');
	fs.writeFileSync(file, content, 'utf8');
	console.log(`Updated ${file} -> isAdopted: true`);
}
