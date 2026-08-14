import fs from 'fs';
import path from 'path';

const tempRoot = '.temp/photo-compression-for-AI';
const dirs = fs.readdirSync(tempRoot);
console.log('Dirs in tempRoot:', dirs);

const dogDirName = dirs.find(
	(d) => d.includes('Собаки') || d.toLowerCase().includes('dog') || d.startsWith('1')
);
console.log('Dog dir name:', dogDirName);

const dogFullDir = path.join(tempRoot, dogDirName);

function getAllFiles(dir) {
	let results = [];
	const list = fs.readdirSync(dir, { withFileTypes: true });
	for (const item of list) {
		const full = path.join(dir, item.name);
		if (item.isDirectory()) {
			results = results.concat(getAllFiles(full));
		} else if (/\.(jpe?g|png)$/i.test(item.name)) {
			results.push(full);
		}
	}
	return results;
}

const allDogPhotos = getAllFiles(dogFullDir);
console.log(`Found ${allDogPhotos.length} photos in ${dogDirName}`);
console.log('Sample photos:');
allDogPhotos.slice(0, 10).forEach((p) => console.log(p));
