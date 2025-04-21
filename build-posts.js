// build-posts.js
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const matter = require("gray-matter");

const template = (title, body) => `
<!DOCTYPE html>
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
    <article class="journal-entry">
      ${body}
    </article>
  </main>

  <footer>
    <p>© 2025 Brandon McKinney</p>
  </footer>

  <script src="../assets/js/main.js"></script>
</body>
</html>
`;

const postsDir = path.join(__dirname, "posts");
const archivePath = path.join(__dirname, "data", "archive.json");
const entries = [];

const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

for (const file of files) {
  const filePath = path.join(postsDir, file);
  const raw = fs.readFileSync(filePath, "utf-8");

  const { data, content } = matter(raw);
  const html = marked.parse(content);
  const title = data.title || "Untitled Post";
  const date = typeof data.date === "string" ? data.date : new Date().toISOString().slice(0, 10);
  const tags = Array.isArray(data.tags) ? data.tags : [];

  const htmlFileName = file.replace(/\.md$/, ".html");
  const outputPath = path.join(postsDir, htmlFileName);

  fs.writeFileSync(outputPath, template(title, html));
  console.log(`✅ Built: ${htmlFileName}`);

  let snippet = data.snippet;
  if (!snippet) {
    const firstParagraph = content
      .split("\n")
      .find(line => line.trim().length > 40); // Skip empty or short lines
    snippet = firstParagraph
      ? firstParagraph.trim().replace(/[#>*_`]/g, "")
      : "New journal entry available.";
  }

  entries.push({
    title,
    date,
    tags,
    link: `posts/${htmlFileName}`,
    snippet
  });
  
}

// Sort and write to archive.json
entries.sort((a, b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync(archivePath, JSON.stringify(entries, null, 2));
console.log("📦 Synced: data/archive.json");
