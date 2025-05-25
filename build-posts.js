const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const matter = require("gray-matter");

// HTML template with ID injected
const template = (title, body, id) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} • Brandon McKinney</title>
  <link rel="stylesheet" href="../assets/css/normalize.css" />
  <link rel="stylesheet" href="../assets/css/style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
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
          <li><a href="about.html">About</a></li>
          <li><a href="https://github.com/BrandonAustin01" target="_blank">GitHub</a></li>
          <li><button id="theme-toggle" aria-label="Toggle Theme">🌗</button></li>
        </ul>
      </div>
    </nav>
  </header>

  <main class="projects">
    <article class="journal-entry" id="${id}">
      ${body}
    </article>
  </main>

  <footer>
    <p>© 2025 Brandon McKinney</p>
  </footer>

  <script src="../assets/js/main.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
</body>
</html>`;

// === Paths
const ROOT = __dirname;
const templatesDir = path.join(ROOT, "templates");
const archivePath = path.join(ROOT, "docs", "data", "archive.json");

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

// === Ensure required folders exist
fs.mkdirSync(templatesDir, { recursive: true });
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

// === Process each .md in /templates
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith(".md"));
const newEntries = [];

for (const file of files) {
  const filePath = path.join(templatesDir, file);
  const raw = fs.readFileSync(filePath, "utf-8");

  const { data, content } = matter(raw);
  const htmlContent = marked.parse(content);

  const title = data.title || "Untitled Post";
  const date = typeof data.date === "string" ? data.date : new Date().toISOString().slice(0, 10);
  const tags = Array.isArray(data.tags) ? data.tags : [];

  const baseName = path.basename(file, ".md").toLowerCase();
  const htmlFileName = `${baseName}.html`;
  const outputPath = path.join(docsPostsDir, htmlFileName);

  fs.writeFileSync(outputPath, template(title, htmlContent, baseName));
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

  const linkPath = `posts/${htmlFileName}`;
  if (!existingEntries.find(e => e.link === linkPath)) {
    newEntries.push({
      title,
      date,
      tags,
      link: linkPath,
      slug: baseName,
      snippet
    });
  }
}

// === Merge and update archive
const allEntries = [...existingEntries, ...newEntries].sort(
  (a, b) => new Date(b.date) - new Date(a.date)
);

fs.writeFileSync(archivePath, JSON.stringify(allEntries, null, 2));
console.log("📦 Synced: docs/data/archive.json");

// === Copy static folders to /docs
copyRecursive(path.join(ROOT, "assets"), docsAssetsDir);
copyRecursive(path.join(ROOT, "data"), docsDataDir);

console.log("🚀 Build complete. Site ready in /docs/");