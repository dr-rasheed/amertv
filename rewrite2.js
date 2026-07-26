const fs = require('fs');
let content = fs.readFileSync('src/utils/kodiAddonGenerator.ts', 'utf-8');

content = content.replace(/xbmcvfs\.exists/g, 'os.path.exists');
content = content.replace(/xbmcvfs\.mkdirs/g, 'os.makedirs');

fs.writeFileSync('src/utils/kodiAddonGenerator.ts', content);
console.log('Replaced xbmcvfs with os');
