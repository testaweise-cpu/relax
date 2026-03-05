const fs = require('fs');

const html = fs.readFileSync('atlas.html', 'utf8');

const models = [];
const parts = html.split('class="sedcard-card-link"');

let idCounter = 1;
for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const prevPart = parts[i - 1];
    const urlMatch = prevPart.match(/<a[^>]*href="([^"]+)"[^>]*$/);
    const profileUrl = urlMatch ? urlMatch[1] : '';

    const closeIndex = part.indexOf('</a>');
    let block = part;
    if (closeIndex !== -1) {
        block = part.substring(0, closeIndex);
    }

    const nameMatch = block.match(/<h[1-6][^>]*class="[^"]*sedcard-title[^"]*"[^>]*>([\s\S]*?)<\/h[1-6]>/i);
    // Let's print something if we find a link but no name
    if (!nameMatch) {
        console.log("Found a sedcard link but no title. URL:", profileUrl);
        continue;
    }

    let name = nameMatch[1].replace(/<[^>]+>/g, '').trim();

    let image = '';
    const imgMatch1 = block.match(/data-gallery-images="\[&quot;([^&]+)&quot;/);
    if (imgMatch1) {
        image = imgMatch1[1].replace(/\\\//g, '/');
    } else {
        const fallbackImg = block.match(/<img[^>]+src="([^"]+)"/i);
        if (fallbackImg) {
            image = fallbackImg[1];
        } else {
            const fallbackImg2 = block.match(/<img[^>]+data-src="([^"]+)"/i);
            if (fallbackImg2) image = fallbackImg2[1];
        }
    }

    const ageMatch = block.match(/Alter:[\s\S]*?<\/span>\s*(\d+)/i) || block.match(/Alter\s*<\/div>\s*<div[^>]*>\s*(\d+)/i) || block.match(/Alter:[\s\S]*?(\d+)/i);
    const age = ageMatch ? parseInt(ageMatch[1]) : 25;

    const measureMatch = block.match(/Maße:[\s\S]*?<\/span>\s*([^<]+)/i) || block.match(/Maße\s*<\/div>\s*<div[^>]*>\s*([^<]+)/i) || block.match(/Maße:[\s\S]*?([^<]+)/i);
    const measurements = measureMatch ? measureMatch[1].trim() : 'Auf Anfrage';

    const nobleAtlasIdMatch = profileUrl.match(/-(\d+)\/?$/);
    const nobleAtlasId = nobleAtlasIdMatch ? parseInt(nobleAtlasIdMatch[1]) : idCounter + 100;

    models.push({
        id: idCounter,
        name,
        age,
        measurements,
        image: image || 'https://via.placeholder.com/400x600',
        bio: 'Exklusive Begleitung in der Relax Lounge.',
        nobleAtlasId,
        profileUrl
    });

    idCounter++;
}

console.log(`Extracted ${models.length} models.`);
if (models.length > 0) {
    console.log("Sample model:");
    console.log(models[0]);
}

const serviceCode = `
/**
 * Simulated Noble Atlas API Service (Populated from Scrape)
 */

const MOCK_MODELS = ${JSON.stringify(models, null, 4)};

export const fetchNobleAtlasSedcards = async () => {
    // Simulate network request delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_MODELS);
        }, 800);
    });
};
`;

fs.writeFileSync('F:\\RelaxLounge\\src\\services\\nobleAtlasService.js', serviceCode.trim());
console.log('Successfully updated F:\\RelaxLounge\\src\\services\\nobleAtlasService.js');
