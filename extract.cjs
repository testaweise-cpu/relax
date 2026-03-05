const fs = require('fs');
const html = fs.readFileSync('atlas.html', 'utf8');

// The sedcards are likely wrapped in some distinctive class
// Let's use cheerio if we can, but we probably don't have it.
// We can use a combination of regex matching.
const models = [];
const regex = /<div[^>]*class="[^"]*sedcard-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;

let match;
let i = 0;
while ((match = regex.exec(html)) !== null && i < 10) {
    console.log(`--- MATCH ${i} ---`);
    console.log(match[1].substring(0, 500));
    i++;
}

if (i === 0) {
    console.log("No sedcard-card found, let's look for common indicators like 'sedcard-title' or 'model-name'");
    const titleRegex = /class="[^"]*sedcard-title[^"]*".*?>(.*?)<\/h[1-6]>/gi;
    let m;
    while ((m = titleRegex.exec(html)) !== null) {
        console.log("Found title:", m[1].trim());
    }
}
