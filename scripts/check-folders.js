import fs from 'fs';
import path from 'path';

function getFolderList(folder) {
	const p = path.join('.temp/photo-compression-for-AI/1) Собаки', folder);
	const files = fs.readdirSync(p).map((f) => {
		const full = path.join(p, f);
		const st = fs.statSync(full);
		return { name: f, size: (st.size / 1024).toFixed(1) + ' KB', full };
	});
	return files;
}

console.log('Folder 3:', getFolderList('3'));
console.log('Folder 5:', getFolderList('5'));
console.log('Folder 4:', getFolderList('4'));
