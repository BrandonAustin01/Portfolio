const toggleBtn = document.getElementById("theme-toggle");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

// Theme toggle
function setTheme(mode) {
  document.body.classList.toggle("light", mode === "light");
  localStorage.setItem("theme", mode);
  toggleBtn.textContent = mode === "light" ? "🌙" : "☀️";
}
const userPref = localStorage.getItem("theme");
if (userPref === "light") setTheme("light");
else setTheme("dark");

toggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});

// Hamburger nav toggle
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});
