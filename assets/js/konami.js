// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const konamiCode = [
    "ArrowUp", "ArrowUp",
    "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight",
    "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  
  let input = [];
  
  window.addEventListener("keydown", (e) => {
    input.push(e.key);
    input.splice(-konamiCode.length - 1, input.length - konamiCode.length);
  
    if (input.join("") === konamiCode.join("")) {
      activateEasterEgg();
    }
  });
  
  function activateEasterEgg() {
    const body = document.querySelector("body");
    const msg = document.createElement("div");
    msg.className = "egg-popup";
    msg.textContent = "🕹️ YOU UNLOCKED DEVELOPER MODE";
  
    body.appendChild(msg);
  
    msg.style.opacity = "1";
    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 2000);
    }, 3000);
  }
  