import fs from 'fs';

const mapping = {
	leila: '1) Собаки/1/40.JPG',
	lola: '1) Собаки/1/19.JPG',
	carly: '1) Собаки/1/12.JPG',
	button: '1) Собаки/3/f785f9dc-cb4d-441e-a544-237c3ac4773f.JPG',
	tilika: '1) Собаки/3/f66062b3-b34e-414c-947a-7e1a188ac1db.JPG',
	multik: '1) Собаки/3/89112553-0652-457b-9983-15f7be325cf9.JPG',
	't-800': '1) Собаки/4/IMG_0897.JPG',
	lucky: '1) Собаки/4/IMG_0732.jpg',
	angel: '1) Собаки/5/IMG_1488.jpg'
};

console.log('=== VERIFYING SOURCE FILES IN .temp/photo-source ===');
for (const [slug, relPath] of Object.entries(mapping)) {
	const srcPath = `.temp/photo-source/${relPath}`;
	const exists = fs.existsSync(srcPath);
	const size = exists ? (fs.statSync(srcPath).size / 1024 / 1024).toFixed(2) + ' MB' : 'MISSING';
	console.log(`${slug.padEnd(10)} -> ${srcPath} (${size})`);
}
