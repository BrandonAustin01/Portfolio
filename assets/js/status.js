// Get the UL where status cards will be rendered
const statusList = document.getElementById("status-list");

// Fetch the project status data
fetch("data/status.json")
  .then((res) => res.json())
  .then((projects) => {
    projects.forEach((project) => {
      const li = document.createElement("li");
      li.className = "status-card " + project.status;

      // Create card HTML with icon, name, version badge, and metadata
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
    console.error("Failed to load project status:", err);
    statusList.innerHTML =
      "<li><strong>⚠️ Failed to load status data. Please try again later.</strong></li>";
  });
