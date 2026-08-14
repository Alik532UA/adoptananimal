import fs from 'fs';

const dogs = [
	'gracie',
	'leila',
	'jessie',
	'lola',
	'shaggy',
	'chikita',
	'black-dog',
	'comet',
	'carly',
	'benny',
	'partos',
	'tobey',
	'button',
	'tilika',
	'multik',
	'vira',
	'flora',
	't-800',
	'lucky',
	'joe',
	'thea',
	'angel'
];

for (const slug of dogs) {
	const code = fs.readFileSync(`src/lib/data/animals/dog_${slug}.ts`, 'utf8');
	const isAdopted = code.includes('isAdopted: true');
	const nameMatch = code.match(/name:\s*['"]([^'"]+)['"]/);
	const breedMatch = code.match(/breed:\s*\{[^}]*en:\s*['"]([^'"]+)['"]/);
	const colorMatch = code.match(/color:\s*\{[^}]*en:\s*['"]([^'"]+)['"]/);
	console.log(
		`${slug.padEnd(10)} | ${nameMatch ? nameMatch[1].padEnd(10) : ''} | adopted: ${isAdopted ? 'YES' : 'no '} | breed: ${breedMatch ? breedMatch[1] : ''} | color: ${colorMatch ? colorMatch[1] : ''}`
	);
}
