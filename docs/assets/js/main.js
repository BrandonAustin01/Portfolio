const toggleBtn = document.getElementById("theme-toggle");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
const heroSlideshow = document.querySelector(".hero-bg-slideshow");

// 🖼️ Load heroImages from JSON and run slideshow
fetch("data/heroImages.json")
  .then(res => res.json())
  .then(heroImages => {
    if (!heroImages || !heroImages.length || !heroSlideshow) return;

    let currentHero = 0;

    function updateHeroBackground() {
      heroSlideshow.style.backgroundImage = `url("${heroImages[currentHero]}")`;
      currentHero = (currentHero + 1) % heroImages.length;
    }

    setInterval(updateHeroBackground, 5000);
    updateHeroBackground();
  })
  .catch(err => {
    console.error("❌ Failed to load heroImages.json:", err);
  });

// 🌗 Theme toggle
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

// 🍔 Hamburger nav toggle
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});
