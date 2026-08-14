import fs from 'fs';
import path from 'path';

const dogsDir = '.temp/photo-compression-for-AI/1) Собаки';
const subdirs = fs.readdirSync(dogsDir, { withFileTypes: true }).filter((d) => d.isDirectory());

for (const dir of subdirs) {
	const fullDir = path.join(dogsDir, dir.name);
	const files = fs.readdirSync(fullDir);
	console.log(`\nFolder: 1) Собаки/${dir.name} (${files.length} files)`);
	console.log(files.join(', '));
}
