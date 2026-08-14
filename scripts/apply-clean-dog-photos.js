import fs from 'fs';
import path from 'path';

const sourceBase = '.temp/photo-compression-for-AI';
const destBase = 'static/images/animals';

// Find the dog dir dynamically
const dirs = fs.readdirSync(sourceBase);
const dogDirName = dirs.find(
	(d) => d.includes('Собаки') || d.toLowerCase().includes('dog') || d.startsWith('1')
);
console.log('Using source dog directory:', dogDirName);

const confirmedMappings = [
	{ slug: 'leila', subpath: '1/40.JPG' },
	{ slug: 'lola', subpath: '1/19.JPG' },
	{ slug: 'carly', subpath: '1/12.JPG' },
	{ slug: 'button', subpath: '3/f785f9dc-cb4d-441e-a544-237c3ac4773f.JPG' },
	{ slug: 'tilika', subpath: '3/f66062b3-b34e-414c-947a-7e1a188ac1db.JPG' },
	{ slug: 'multik', subpath: '3/89112553-0652-457b-9983-15f7be325cf9.JPG' },
	{ slug: 't-800', subpath: '4/IMG_0897.JPG' },
	{ slug: 'lucky', subpath: '4/IMG_0697.jpg' },
	{ slug: 'angel', subpath: '5/IMG_1488.jpg' }
];

for (const m of confirmedMappings) {
	const srcFile = path.join(sourceBase, dogDirName, m.subpath);
	const destFile = path.join(destBase, `dog_${m.slug}.jpg`);

	if (!fs.existsSync(srcFile)) {
		console.error(`ERROR: Source file not found: ${srcFile}`);
		continue;
	}

	fs.copyFileSync(srcFile, destFile);
	const size = (fs.statSync(destFile).size / 1024).toFixed(1);
	console.log(`✓ Copied clean photo for ${m.slug.padEnd(8)} -> ${destFile} (${size} KB)`);
}
