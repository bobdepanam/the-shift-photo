import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Résoudre __dirname dans ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = path.join(__dirname, "src", "data", "projects");
const imageExtensions = [".jpg", ".jpeg", ".png"];

const files = fs.readdirSync(projectDir);

for (const file of files) {
  if (file.endsWith(".md")) {
    const filePath = path.join(projectDir, file);
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;

    for (const ext of imageExtensions) {
      const regex = new RegExp(`${ext}`, "gi");
      if (regex.test(content)) {
        content = content.replace(regex, ".webp");
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`✅ Updated: ${file}`);
    } else {
      console.log(`⏭️  No changes: ${file}`);
    }
  }
}
