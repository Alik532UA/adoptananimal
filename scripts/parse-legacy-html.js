import fs from 'fs';

function parseLegacyGrid(filePath, type) {
	const html = fs.readFileSync(filePath, 'utf8');
	const chunks = html.split(/<div[^>]*class="[^"]*jXK9ad-SmKAyb[^"]*"[^>]*>/i);

	const animals = [];

	for (let i = 0; i < chunks.length; i++) {
		if (chunks[i].includes('Gender:')) {
			const rawDetails = chunks[i]
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			const prevBlock = i > 0 ? chunks[i - 1] : '';

			// Name is in prevBlock
			const nameMatch = prevBlock
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim()
				.replace('&#39;', "'");

			// Photo URL is in i-2 or in prevBlock
			let photoUrl = null;
			for (let b = Math.max(0, i - 3); b <= i; b++) {
				const imgMatch = chunks[b].match(/<img[^>]+src="([^">]+)"/i);
				if (imgMatch) {
					photoUrl = imgMatch[1].replace(/&amp;/g, '&');
					break;
				}
			}

			// Detail link
			let detailUrl = null;
			for (let b = Math.max(0, i - 3); b <= Math.min(chunks.length - 1, i + 3); b++) {
				const linkMatch = chunks[b].match(/href="(\/Adopt-an-animal\/[^"]+)"/i);
				if (linkMatch && !linkMatch[1].endsWith('/dog') && !linkMatch[1].endsWith('/Cat')) {
					detailUrl = 'https://www.adoptananimal.in.ua' + linkMatch[1];
					break;
				}
			}

			// Check if "Apply for adoption" exists in the next 3 blocks
			let hasApply = false;
			for (let b = i; b <= Math.min(chunks.length - 1, i + 3); b++) {
				if (chunks[b].includes('Apply for adoption')) {
					hasApply = true;
					break;
				}
			}

			const genderMatch = rawDetails.match(/Gender:\s*([^:]+?)(?=\s*Breed:|$)/i);
			const breedMatch = rawDetails.match(/Breed:\s*([^:]+?)(?=\s*Age:|$)/i);
			const ageMatch = rawDetails.match(/Age:\s*([^:]+?)(?=\s*Size:|$)/i);
			const sizeMatch = rawDetails.match(/Size:\s*([^:]+?)(?=\s*Color:|$)/i);
			const colorMatch = rawDetails.match(/Color:\s*([^:]+?)$/i);

			animals.push({
				orderIndex: animals.length + 1,
				name: nameMatch,
				type: type,
				isAdopted: !hasApply,
				gender: genderMatch ? genderMatch[1].trim() : null,
				breed: breedMatch ? breedMatch[1].trim() : null,
				age: ageMatch ? ageMatch[1].trim() : null,
				size: sizeMatch ? sizeMatch[1].trim() : null,
				color: colorMatch ? colorMatch[1].trim() : null,
				detailUrl: detailUrl,
				photoUrl: photoUrl
			});
		}
	}

	return animals;
}

const dogs = parseLegacyGrid('.temp/legacy-source/Adopt a dog.html', 'dog');
const cats = parseLegacyGrid('.temp/legacy-source/Adopt a cat.html', 'cat');

fs.writeFileSync('.temp/legacy-source/dogs_canonical.json', JSON.stringify(dogs, null, 2), 'utf8');
fs.writeFileSync('.temp/legacy-source/cats_canonical.json', JSON.stringify(cats, null, 2), 'utf8');

console.log(
	`Successfully parsed ${dogs.length} dogs and ${cats.length} cats from local HTML files.`
);
