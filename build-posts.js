const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const matter = require("gray-matter");

// Slugify helper
const slugify = str =>
  str.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// HTML template with slug injected as ID
const template = (title, body, slug) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} • Brandon McKinney</title>
  <link rel="stylesheet" href="../assets/css/normalize.css" />
  <link rel="stylesheet" href="../assets/css/style.css" />
  <link rel="icon" href="../assets/img/favicon.png" type="image/png" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Space+Mono&display=swap" rel="stylesheet" />
</head>
<body>
  <header>
    <nav>
      <div class="nav-container">
        <div class="brand">Brandon McKinney</div>
        <button id="nav-toggle" aria-label="Toggle Menu">☰</button>
        <ul id="nav-links">
          <li><a href="../index.html">Home</a></li>
          <li><a href="../archive.html" class="active">Archive</a></li>
          <li><a href="../status.html">Status</a></li>
          <li><a href="https://github.com/BrandonAustin01" target="_blank">GitHub</a></li>
          <li><button id="theme-toggle" aria-label="Toggle Theme">🌗</button></li>
        </ul>
      </div>
    </nav>
  </header>

  <main class="projects">
    <article class="journal-entry" id="${slug}">
      ${body}
    </article>
  </main>

  <footer>
    <p>© 2025 Brandon McKinney</p>
  </footer>

  <script src="../assets/js/main.js"></script>
</body>
</html>`;

// === Paths
const ROOT = __dirname;
const postsDir = path.join(ROOT, "posts");
const archivePath = path.join(ROOT, "data", "archive.json");

const docsDir = path.join(ROOT, "docs");
const docsPostsDir = path.join(docsDir, "posts");
const docsAssetsDir = path.join(docsDir, "assets");
const docsDataDir = path.join(docsDir, "data");

// === Helpers
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// === Ensure target folders exist
fs.mkdirSync(docsPostsDir, { recursive: true });
fs.mkdirSync(docsDataDir, { recursive: true });
fs.mkdirSync(docsAssetsDir, { recursive: true });

// === Read & parse existing archive.json
let existingEntries = [];
if (fs.existsSync(archivePath)) {
  try {
    const raw = fs.readFileSync(archivePath, "utf-8");
    existingEntries = JSON.parse(raw);
  } catch (err) {
    console.error("❌ Failed to read or parse archive.json:", err);
  }
}

const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));
const newEntries = [];

for (const file of files) {
  const filePath = path.join(postsDir, file);
  const raw = fs.readFileSync(filePath, "utf-8");

  const { data, content } = matter(raw);
  const htmlContent = marked.parse(content);

  const title = data.title || "Untitled Post";
  const date = typeof data.date === "string" ? data.date : new Date().toISOString().slice(0, 10);
  const tags = Array.isArray(data.tags) ? data.tags : [];

  const slug = slugify(title);
  const htmlFileName = `${slug}.html`;
  const outputPath = path.join(docsPostsDir, htmlFileName);

  fs.writeFileSync(outputPath, template(title, htmlContent, slug));
  console.log(`✅ Built: ${htmlFileName}`);

  let snippet = data.snippet;
  if (!snippet) {
    const firstParagraph = content
      .split("\n")
      .find(line => line.trim().length > 40);
    snippet = firstParagraph
      ? firstParagraph.trim().replace(/[#>*_`]/g, "")
      : "New journal entry available.";
  }

  newEntries.push({
    title,
    date,
    tags,
    link: `posts/${htmlFileName}`,
    slug,
    snippet
  });
}

// === Merge and sync archive
const mergedEntriesMap = new Map();
for (const entry of existingEntries) mergedEntriesMap.set(entry.link, entry);
for (const entry of newEntries) mergedEntriesMap.set(entry.link, entry);

const mergedEntries = Array.from(mergedEntriesMap.values()).sort(
  (a, b) => new Date(b.date) - new Date(a.date)
);

fs.writeFileSync(path.join(docsDataDir, "archive.json"), JSON.stringify(mergedEntries, null, 2));
console.log("📦 Synced: docs/data/archive.json");

// === Copy static folders to /docs
copyRecursive(path.join(ROOT, "assets"), docsAssetsDir);
copyRecursive(path.join(ROOT, "data"), docsDataDir); // in case status.json or others exist

console.log("🚀 Build complete. Site ready in /docs/");
