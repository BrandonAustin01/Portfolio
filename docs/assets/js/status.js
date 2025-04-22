// status.js

document.addEventListener("DOMContentLoaded", () => {
  const statusList = document.getElementById("status-list");

  // Double-check the element exists before continuing
  if (!statusList) return;

  fetch("data/status.json")
    .then((res) => res.json())
    .then((projects) => {
      projects.forEach((project) => {
        const li = document.createElement("li");
        li.className = "status-card " + project.status;

        li.innerHTML = `
          <h3>
            ${project.icon ? `${project.icon} ` : ""}${project.name}
            ${project.version ? `<span class="version-badge">${project.version}</span>` : ""}
          </h3>
          <p>${project.description}</p>
          <p>Status: <strong>${project.status}</strong></p>
          <p>Last update: ${project.lastUpdate}</p>
          <p><a href="${project.link}" target="_blank">View project ↗</a></p>
        `;

        statusList.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to load status.json:", err);
      statusList.innerHTML = `
        <li>
          <strong>⚠️ Could not load project status. Check your connection or try again later.</strong>
        </li>
      `;
    });
});
