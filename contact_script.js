const menu = document.querySelector(".menu");
const btn = document.querySelector(".menu-btn");
const panel = document.querySelector(".menu-panel");

function setOpen(isOpen) {
  menu.classList.toggle("open", isOpen);
  btn.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    // Focus first item for keyboard users
    const firstLink = panel.querySelector("a");
  } 
}

btn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = menu.classList.contains("open");
  setOpen(!isOpen);
});

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target)) setOpen(false);
});

document.addEventListener("keydown", (e) => {
  const isOpen = menu.classList.contains("open");
  if (!isOpen) return;

  if (e.key === "Escape") {
    e.preventDefault();
    setOpen(false);
    return;
  }

  // Arrow key navigation within menu links
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const links = Array.from(panel.querySelectorAll("a"));
    const currentIndex = links.indexOf(document.activeElement);
    const delta = e.key === "ArrowDown" ? 1 : -1;
    const nextIndex = currentIndex === -1
      ? 0
      : (currentIndex + delta + links.length) % links.length;
    links[nextIndex]?.focus();
  }
});

// Optional: close menu after clicking a link
panel.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (link) setOpen(false);
});

// Resend function
const form = document.querySelector("#contact-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: form.querySelector('[name="name"]').value.trim(),
    email: form.querySelector('[name="email"]').value.trim(),
    message: form.querySelector('[name="message"]').value.trim(),
    website: form.querySelector('[name="website"]').value || "", // honeypot
  };

  const r = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (r.ok) {
    alert("Message sent!");
    form.reset();
  } else {
    alert("Something went wrong. Please try again.");
  }
});