const archiveList = document.getElementById("archive-list");

fetch("data/archive.json")
  .then((res) => res.json())
  .then((entries) => {
    const sorted = entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(entry => {
      const li = document.createElement("li");
      li.className = "archive-entry";

      li.innerHTML = `
        <strong>${entry.title}</strong> <br />
        <small>${entry.date}</small>  
        ${entry.tags ? `<div class="tags">${entry.tags.map(tag => `<span>${tag}</span>`).join(" ")}</div>` : ""}
        ${entry.link ? `<p><a href="${entry.link}" target="_blank">Read more ↗</a></p>` : ""}
      `;

      archiveList.appendChild(li);
    });
  })
  .catch(err => {
    archiveList.innerHTML = `<li>⚠️ Failed to load archive entries.</li>`;
    console.error("Archive load error:", err);
  });
