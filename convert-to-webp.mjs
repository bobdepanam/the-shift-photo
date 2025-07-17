import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour __dirname avec ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "public", "images");
const formats = [".jpg", ".jpeg", ".png"];

function convertFolder(folder) {
  const folderPath = path.join(inputDir, folder);
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    const basename = path.basename(file, ext);

    if (formats.includes(ext)) {
      const inputPath = path.join(folderPath, file);
      const outputPath = path.join(folderPath, `${basename}.webp`);

      if (fs.existsSync(outputPath)) return;

      sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath)
        .then(() => console.log(`✅ Converted: ${file} → ${basename}.webp`))
        .catch((err) => console.error(`❌ Error with ${file}:`, err));
    }
  });
}

// Scan all subfolders in public/images/
fs.readdirSync(inputDir).forEach((subfolder) => {
  const fullPath = path.join(inputDir, subfolder);
  if (fs.statSync(fullPath).isDirectory()) {
    convertFolder(subfolder);
  }
});
