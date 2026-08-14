import fs from 'fs';

const files = fs
	.readdirSync('static/images/animals')
	.filter((f) => f.startsWith('dog_'))
	.slice(0, 8);
for (const f of files) {
	const st = fs.statSync(`static/images/animals/${f}`);
	console.log(`${f.padEnd(20)}: ${(st.size / 1024).toFixed(1)} KB`);
}
