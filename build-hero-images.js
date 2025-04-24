// build-hero-images.js
const fs = require("fs");
const path = require("path");

const imgDir = path.join(__dirname, "docs", "assets", "img");
const outputDir = path.join(__dirname, "docs", "data");
const outputPath = path.join(outputDir, "heroImages.json");

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

if (!fs.existsSync(imgDir)) {
  console.error("❌ Image folder not found:", imgDir);
  process.exit(1);
}

// Create /docs/data if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read image paths
const files = fs.readdirSync(imgDir)
  .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
  .map(file => `assets/img/${file}`); // relative to site root

// Write output
fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
console.log(`✅ heroImages.json created in docs/data with ${files.length} image(s).`);
