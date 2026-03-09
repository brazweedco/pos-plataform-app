import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets', 'images');

async function generateIcons() {
  const svgBuffer = readFileSync(join(assetsDir, 'brazweed-logo.svg'));

  // Generate app icon (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(join(assetsDir, 'icon.png'));
  console.log('Generated icon.png (1024x1024)');

  // Generate favicon (48x48)
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(join(assetsDir, 'favicon.png'));
  console.log('Generated favicon.png (48x48)');

  // Generate splash icon (200x200)
  await sharp(svgBuffer)
    .resize(200, 200)
    .png()
    .toFile(join(assetsDir, 'splash-icon.png'));
  console.log('Generated splash-icon.png (200x200)');

  // Generate Android adaptive icon foreground (432x432 with padding)
  // Android adaptive icons need 108dp with 72dp safe zone
  const foregroundSvg = readFileSync(join(assetsDir, 'android-icon-foreground.svg'));
  await sharp(foregroundSvg)
    .resize(432, 432)
    .png()
    .toFile(join(assetsDir, 'adaptive-icon.png'));
  console.log('Generated adaptive-icon.png (432x432)');

  console.log('Done!');
}

generateIcons().catch(console.error);
