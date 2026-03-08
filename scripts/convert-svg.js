const sharp = require('sharp');
const fs = require('fs');

const sizes = {
  'icon.png': 1024,
  'favicon.png': 64,
  'splash-icon.png': 288,
  'android-icon-foreground.png': 432,
  'brazweed-logo.png': 512
};

const svgPath = 'assets/images/brazweed-logo.svg';
const svg = fs.readFileSync(svgPath);

async function convert() {
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile('assets/images/' + filename);
    console.log('Created ' + filename + ' (' + size + 'x' + size + ')');
  }
}

convert().catch(console.error);
