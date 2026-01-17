import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const iconsDir = join(rootDir, 'public', 'icons');
const publicDir = join(rootDir, 'public');

const svgPath = join(iconsDir, 'icon-1024.svg');
const svgBuffer = readFileSync(svgPath);

const sizes = [
  { size: 1024, name: 'icon-1024.png', dir: iconsDir },
  { size: 512, name: 'icon-512.png', dir: iconsDir },
  { size: 192, name: 'icon-192.png', dir: iconsDir },
  { size: 180, name: 'icon-180.png', dir: iconsDir },
  { size: 180, name: 'apple-touch-icon.png', dir: publicDir },
  { size: 180, name: 'apple-touch-icon-precomposed.png', dir: publicDir },
  { size: 120, name: 'apple-touch-icon-120x120.png', dir: publicDir },
  { size: 120, name: 'apple-touch-icon-120x120-precomposed.png', dir: publicDir },
  { size: 32, name: 'favicon-32.png', dir: publicDir },
  { size: 16, name: 'favicon-16.png', dir: publicDir },
];

async function convertIcons() {
  console.log('Converting SVG to PNG icons...\n');

  for (const { size, name, dir } of sizes) {
    const outputPath = join(dir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created: ${name} (${size}x${size})`);
  }

  console.log('\nAll icons created successfully!');
}

convertIcons().catch(console.error);
